const express = require("express");
const router = express.Router();
const {
  createClassroom,
  getTeacherClassrooms,
  getStudentClassrooms,
  getClassroomById,
  joinClassroom,
  removeStudent,
} = require("../controllers/classroomController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// @route   POST /api/classrooms
// @desc    Create a classroom
// @access  Private (Teacher)
router.post("/", protect, authorizeRoles("teacher"), createClassroom);

// @route   GET /api/classrooms/teacher
// @desc    Get teacher's classrooms
// @access  Private (Teacher)
router.get("/teacher", protect, authorizeRoles("teacher"), getTeacherClassrooms);

// @route   GET /api/classrooms/student
// @desc    Get student's enrolled classrooms
// @access  Private (Student)
router.get("/student", protect, authorizeRoles("student"), getStudentClassrooms);

// @route   GET /api/classrooms/:id
// @desc    Get single classroom details
// @access  Private (Authenticated users - Admin, Teacher, Student)
router.get("/:id", protect, getClassroomById);

// @route   POST /api/classrooms/:id/join
// @desc    Student joins a classroom
// @access  Private (Student)
router.post("/:id/join", protect, authorizeRoles("student"), joinClassroom);

// @route   DELETE /api/classrooms/:id/students/:studentId
// @desc    Teacher removes a student from classroom
// @access  Private (Teacher)
router.delete("/:id/students/:studentId", protect, authorizeRoles("teacher"), removeStudent);

module.exports = router;
