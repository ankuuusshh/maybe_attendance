const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  registerFace,
  getFaceStatus,
  clearFaceEncodings,
  recognizeClassroom,
  checkAiHealth,
} = require("../controllers/aiController");

// Store uploaded files in memory (buffer) so we can forward them to Python
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// @route   GET /api/ai/health
// @desc    Check if the Python AI service is reachable
// @access  Public
router.get("/health", checkAiHealth);

// @route   GET /api/ai/face-status
// @desc    Get the current student's face registration status
// @access  Private (Student)
router.get("/face-status", protect, authorizeRoles("student"), getFaceStatus);

// @route   POST /api/ai/register-face
// @desc    Student uploads a face photo → AI service extracts 128-d encoding → stored in MongoDB
// @access  Private (Student)
router.post(
  "/register-face",
  protect,
  authorizeRoles("student"),
  upload.single("photo"),
  registerFace
);

// @route   DELETE /api/ai/face-encodings
// @desc    Clear all stored face encodings for the student
// @access  Private (Student)
router.delete("/face-encodings", protect, authorizeRoles("student"), clearFaceEncodings);

// @route   POST /api/ai/recognize-classroom
// @desc    Teacher uploads a group photo → AI detects faces → returns match results
// @access  Private (Teacher)
router.post(
  "/recognize-classroom",
  protect,
  authorizeRoles("teacher"),
  upload.single("photo"),
  recognizeClassroom
);

module.exports = router;
