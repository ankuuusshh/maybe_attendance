const Attendance = require("../models/Attendance");
const Classroom = require("../models/Classroom");
const mongoose = require("mongoose");

// @desc    Mark attendance for a classroom
// @route   POST /api/attendance
// @access  Private (Teacher only)
const markAttendance = async (req, res) => {
  try {
    const { classroomId, date, attendance } = req.body;

    if (!classroomId || !date || !attendance || !Array.isArray(attendance)) {
      return res.status(400).json({ success: false, message: "classroomId, date, and attendance array are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(classroomId)) {
      return res.status(400).json({ success: false, message: "Invalid classroom ID" });
    }

    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    if (classroom.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to mark attendance for this classroom" });
    }

    const attendanceRecords = [];
    const parsedDate = new Date(date);

    for (const record of attendance) {
      if (!record.studentId || !record.status) {
        return res.status(400).json({ success: false, message: "Each attendance record must have studentId and status" });
      }

      if (record.status !== "present" && record.status !== "absent") {
        return res.status(400).json({ success: false, message: "Status must be 'present' or 'absent'" });
      }

      if (!classroom.students.includes(record.studentId)) {
        return res.status(400).json({ success: false, message: `Student ${record.studentId} is not enrolled in this classroom` });
      }

      attendanceRecords.push({
        classroom: classroomId,
        student: record.studentId,
        date: parsedDate,
        status: record.status,
        markedBy: req.user._id,
      });
    }

    // Use insertMany with ordered: false to gracefully skip duplicates if needed, or handle bulkWrite.
    // The requirement states "Prevent duplicate attendance", the schema unique index handles it.
    try {
      const savedAttendance = await Attendance.insertMany(attendanceRecords);
      res.status(201).json({
        success: true,
        message: "Attendance marked successfully",
        attendance: savedAttendance,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: "Duplicate attendance records exist for this date" });
      }
      throw err;
    }
  } catch (error) {
    console.error("Mark attendance error:", error.message);
    res.status(500).json({ success: false, message: "Server error marking attendance" });
  }
};

// @desc    Get classroom attendance for a specific date
// @route   GET /api/attendance/classroom/:classroomId?date=YYYY-MM-DD
// @access  Private (Teacher or Admin)
const getClassroomAttendance = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(classroomId)) {
      return res.status(400).json({ success: false, message: "Invalid classroom ID" });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    if (req.user.role !== "admin" && classroom.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view this classroom's attendance" });
    }

    const query = { classroom: classroomId };
    if (date) {
      const queryDate = new Date(date);
      const nextDay = new Date(queryDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      // Match the exact date, or across the day if stored as ISO string with time
      query.date = {
        $gte: queryDate,
        $lt: nextDay,
      };
    }

    const attendance = await Attendance.find(query).populate("student", "name email rollNumber");

    res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("Get classroom attendance error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching attendance" });
  }
};

// @desc    Get student's overall attendance history
// @route   GET /api/attendance/student
// @access  Private (Student only)
const getStudentAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.user._id })
      .populate("classroom", "name subject section semester")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("Get student attendance error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching attendance" });
  }
};

// @desc    Get student's attendance for a specific classroom
// @route   GET /api/attendance/student/:classroomId
// @access  Private (Student only)
const getStudentAttendanceForClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(classroomId)) {
      return res.status(400).json({ success: false, message: "Invalid classroom ID" });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    if (!classroom.students.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not enrolled in this classroom" });
    }

    const attendance = await Attendance.find({
      student: req.user._id,
      classroom: classroomId,
    })
      .populate("classroom", "name subject section semester")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("Get student classroom attendance error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching attendance" });
  }
};

// @desc    Update an attendance record
// @route   PUT /api/attendance/:attendanceId
// @access  Private (Teacher or Admin)
const updateAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      return res.status(400).json({ success: false, message: "Invalid attendance ID" });
    }

    if (status !== "present" && status !== "absent") {
      return res.status(400).json({ success: false, message: "Status must be 'present' or 'absent'" });
    }

    const attendanceRecord = await Attendance.findById(attendanceId);

    if (!attendanceRecord) {
      return res.status(404).json({ success: false, message: "Attendance record not found" });
    }

    const classroom = await Classroom.findById(attendanceRecord.classroom);

    if (req.user.role !== "admin" && classroom.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this attendance record" });
    }

    attendanceRecord.status = status;
    await attendanceRecord.save();

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      attendance: attendanceRecord,
    });
  } catch (error) {
    console.error("Update attendance error:", error.message);
    res.status(500).json({ success: false, message: "Server error updating attendance" });
  }
};

// @desc    Delete an attendance record
// @route   DELETE /api/attendance/:attendanceId
// @access  Private (Teacher or Admin)
const deleteAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      return res.status(400).json({ success: false, message: "Invalid attendance ID" });
    }

    const attendanceRecord = await Attendance.findById(attendanceId);

    if (!attendanceRecord) {
      return res.status(404).json({ success: false, message: "Attendance record not found" });
    }

    const classroom = await Classroom.findById(attendanceRecord.classroom);

    if (req.user.role !== "admin" && classroom.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this attendance record" });
    }

    await Attendance.deleteOne({ _id: attendanceId });

    res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    console.error("Delete attendance error:", error.message);
    res.status(500).json({ success: false, message: "Server error deleting attendance" });
  }
};

// @desc    Get attendance summary for student
// @route   GET /api/attendance/student/summary
// @access  Private (Student only)
const getStudentAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Get all classrooms the student is enrolled in
    const classrooms = await Classroom.find({ students: studentId });

    const summary = [];

    for (const classroom of classrooms) {
      const records = await Attendance.find({
        student: studentId,
        classroom: classroom._id,
      });

      const totalClasses = records.length;
      let present = 0;
      let absent = 0;

      records.forEach((record) => {
        if (record.status === "present") present++;
        else if (record.status === "absent") absent++;
      });

      let percentage = 0;
      if (totalClasses > 0) {
        percentage = Math.round((present / totalClasses) * 100);
      }

      summary.push({
        classroomId: classroom._id,
        classroomName: classroom.name,
        subject: classroom.subject,
        totalClasses,
        present,
        absent,
        percentage,
      });
    }

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Get attendance summary error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching attendance summary" });
  }
};

module.exports = {
  markAttendance,
  getClassroomAttendance,
  getStudentAttendance,
  getStudentAttendanceForClassroom,
  updateAttendance,
  deleteAttendance,
  getStudentAttendanceSummary,
};
