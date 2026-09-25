const Classroom = require("../models/Classroom");
const User = require("../models/User");
const mongoose = require("mongoose");

// @desc    Create a classroom
// @route   POST /api/classrooms
// @access  Private (Teacher only)
const createClassroom = async (req, res) => {
  try {
    const { name, subject, section, semester } = req.body;

    if (!name || !subject || !section || !semester) {
      return res.status(400).json({ success: false, message: "Please provide all required fields (name, subject, section, semester)" });
    }

    const classroom = await Classroom.create({
      name,
      subject,
      section,
      semester,
      teacher: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Classroom created successfully",
      classroom,
    });
  } catch (error) {
    console.error("Create classroom error:", error.message);
    res.status(500).json({ success: false, message: "Server error creating classroom" });
  }
};

// @desc    Get teacher's classrooms
// @route   GET /api/classrooms/teacher
// @access  Private (Teacher only)
const getTeacherClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find({ teacher: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      classrooms,
    });
  } catch (error) {
    console.error("Get teacher classrooms error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching classrooms" });
  }
};

// @desc    Get student's enrolled classrooms
// @route   GET /api/classrooms/student
// @access  Private (Student only)
const getStudentClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find({ students: req.user._id })
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      classrooms,
    });
  } catch (error) {
    console.error("Get student classrooms error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching classrooms" });
  }
};

// @desc    Get single classroom details
// @route   GET /api/classrooms/:id
// @access  Private (Authenticated users)
const getClassroomById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid classroom ID" });
    }

    const classroom = await Classroom.findById(id)
      .populate("teacher", "name email")
      .populate("students", "name email rollNumber");

    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    // Role-based access control (optional but good practice)
    // If student, check if enrolled (unless we allow students to view before joining)
    // Based on requirements, just returning the details.

    res.status(200).json({
      success: true,
      classroom,
    });
  } catch (error) {
    console.error("Get classroom error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching classroom" });
  }
};

// @desc    Student joins a classroom
// @route   POST /api/classrooms/:id/join
// @access  Private (Student only)
const joinClassroom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid classroom ID" });
    }

    // Teachers should not join as students
    if (req.user.role === "teacher") {
      return res.status(403).json({ success: false, message: "Teachers cannot join as students" });
    }

    const classroom = await Classroom.findById(id);

    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    // Check if student is already enrolled
    if (classroom.students.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: "Already enrolled in this classroom" });
    }

    classroom.students.push(req.user._id);
    await classroom.save();

    res.status(200).json({
      success: true,
      message: "Successfully joined the classroom",
      classroom,
    });
  } catch (error) {
    console.error("Join classroom error:", error.message);
    res.status(500).json({ success: false, message: "Server error joining classroom" });
  }
};

// @desc    Teacher removes a student from classroom
// @route   DELETE /api/classrooms/:id/students/:studentId
// @access  Private (Teacher only)
const removeStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: "Invalid classroom or student ID" });
    }

    const classroom = await Classroom.findById(id);

    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    // Only the teacher who created the classroom can remove students
    if (classroom.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to modify this classroom" });
    }

    const initialStudentCount = classroom.students.length;
    classroom.students = classroom.students.filter(
      (student) => student.toString() !== studentId
    );

    if (classroom.students.length === initialStudentCount) {
      return res.status(404).json({ success: false, message: "Student not found in this classroom" });
    }

    await classroom.save();

    res.status(200).json({
      success: true,
      message: "Student removed from classroom",
    });
  } catch (error) {
    console.error("Remove student error:", error.message);
    res.status(500).json({ success: false, message: "Server error removing student" });
  }
};

module.exports = {
  createClassroom,
  getTeacherClassrooms,
  getStudentClassrooms,
  getClassroomById,
  joinClassroom,
  removeStudent,
};
