const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getClassroomAttendance,
  getStudentAttendance,
  getStudentAttendanceForClassroom,
  updateAttendance,
  deleteAttendance,
  getStudentAttendanceSummary,
} = require("../controllers/attendanceController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// @route   POST /api/attendance
// @desc    Mark attendance for a classroom
// @access  Private (Teacher)
router.post("/", protect, authorizeRoles("teacher"), markAttendance);

// @route   GET /api/attendance/classroom/:classroomId
// @desc    Get classroom attendance for a specific date
// @access  Private (Teacher or Admin)
router.get("/classroom/:classroomId", protect, authorizeRoles("teacher", "admin"), getClassroomAttendance);

// @route   GET /api/attendance/student/summary
// @desc    Get attendance summary for student
// @access  Private (Student)
// IMPORTANT: Put this BEFORE /student/:classroomId so it doesn't match as an ID parameter
router.get("/student/summary", protect, authorizeRoles("student"), getStudentAttendanceSummary);

// @route   GET /api/attendance/student
// @desc    Get student's overall attendance history
// @access  Private (Student)
router.get("/student", protect, authorizeRoles("student"), getStudentAttendance);

// @route   GET /api/attendance/student/:classroomId
// @desc    Get student's attendance for a specific classroom
// @access  Private (Student)
router.get("/student/:classroomId", protect, authorizeRoles("student"), getStudentAttendanceForClassroom);

// @route   PUT /api/attendance/:attendanceId
// @desc    Update an attendance record
// @access  Private (Teacher or Admin)
router.put("/:attendanceId", protect, authorizeRoles("teacher", "admin"), updateAttendance);

// @route   DELETE /api/attendance/:attendanceId
// @desc    Delete an attendance record
// @access  Private (Teacher or Admin)
router.delete("/:attendanceId", protect, authorizeRoles("teacher", "admin"), deleteAttendance);

module.exports = router;
