/**
 * aiController.js
 *
 * Node.js proxy between the React frontend and the Python FastAPI AI service.
 *
 * Routes it handles:
 *   POST /api/ai/register-face      — Student registers their face
 *   POST /api/ai/recognize-classroom — Teacher scans classroom photo
 *   GET  /api/ai/face-status         — Check if student has face registered
 *
 * The AI service runs at AI_SERVICE_URL (default: http://localhost:8000)
 */

const FormData = require("form-data");
const fetch = require("node-fetch");
const User = require("../models/User");
const Classroom = require("../models/Classroom");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: forward a multipart file to the Python AI service
// ─────────────────────────────────────────────────────────────────────────────
async function proxyToAI(endpoint, formData) {
  const url = `${AI_SERVICE_URL}${endpoint}`;
  const res = await fetch(url, {
    method: "POST",
    body: formData,
    headers: formData.getHeaders(),
  });

  const json = await res.json();
  if (!res.ok) {
    const msg = json?.detail || `AI service error ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/register-face
// Body: multipart — photo (image file)
// Auth: student
// ─────────────────────────────────────────────────────────────────────────────
const registerFace = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No photo uploaded." });
    }

    const studentId = req.user._id.toString();

    // Build FormData to forward to Python service
    const form = new FormData();
    form.append("studentId", studentId);
    form.append("photo", req.file.buffer, {
      filename: req.file.originalname || "photo.jpg",
      contentType: req.file.mimetype || "image/jpeg",
    });

    const aiResult = await proxyToAI("/register-face", form);

    // aiResult = { studentId, encoding: [128 floats] }
    const encoding = aiResult.encoding;
    if (!encoding || encoding.length !== 128) {
      return res.status(500).json({ message: "Invalid encoding returned by AI service." });
    }

    // Append the new encoding to the student's existing encodings (up to 10)
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found." });

    const currentEncodings = student.faceEncodings || [];
    const updatedEncodings = [...currentEncodings, encoding].slice(-10); // keep latest 10

    student.faceEncodings = updatedEncodings;
    student.faceRegistered = true;
    await student.save();

    return res.json({
      message: "Face encoding saved successfully.",
      totalSamples: updatedEncodings.length,
      faceRegistered: true,
    });
  } catch (err) {
    console.error("registerFace error:", err.message);
    return res.status(500).json({ message: err.message || "Face registration failed." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/ai/face-status
// Auth: student
// Returns how many samples are stored for the logged-in student
// ─────────────────────────────────────────────────────────────────────────────
const getFaceStatus = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select("faceRegistered faceEncodings");
    if (!student) return res.status(404).json({ message: "Student not found." });

    return res.json({
      faceRegistered: student.faceRegistered,
      totalSamples: (student.faceEncodings || []).length,
    });
  } catch (err) {
    console.error("getFaceStatus error:", err.message);
    return res.status(500).json({ message: "Failed to fetch face status." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/ai/face-encodings
// Auth: student
// Clear all stored face encodings for the student
// ─────────────────────────────────────────────────────────────────────────────
const clearFaceEncodings = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      faceEncodings: [],
      faceRegistered: false,
    });
    return res.json({ message: "Face encodings cleared successfully." });
  } catch (err) {
    console.error("clearFaceEncodings error:", err.message);
    return res.status(500).json({ message: "Failed to clear face encodings." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/recognize-classroom
// Body: multipart — classroomId (string), photo (image file)
// Auth: teacher
// ─────────────────────────────────────────────────────────────────────────────
const recognizeClassroom = async (req, res) => {
  try {
    const { classroomId } = req.body;

    if (!classroomId) {
      return res.status(400).json({ message: "classroomId is required." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No classroom photo uploaded." });
    }

    // Fetch the classroom and verify it belongs to this teacher
    const classroom = await Classroom.findById(classroomId).populate(
      "students",
      "name email rollNumber faceEncodings faceRegistered"
    );

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found." });
    }

    if (classroom.teacher.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You do not own this classroom." });
    }

    const students = classroom.students;

    if (students.length === 0) {
      return res.status(400).json({ message: "No students enrolled in this classroom." });
    }

    // Build the students JSON payload for the AI service
    // Only include students who have face encodings
    const studentsPayload = students.map((s) => ({
      studentId: s._id.toString(),
      name: s.name,
      rollNumber: s.rollNumber || "",
      encodings: s.faceEncodings || [],
    }));

    // Build FormData for the AI service
    const form = new FormData();
    form.append("classroomId", classroomId);
    form.append("students", JSON.stringify(studentsPayload));
    form.append("photo", req.file.buffer, {
      filename: req.file.originalname || "classroom.jpg",
      contentType: req.file.mimetype || "image/jpeg",
    });

    const aiResult = await proxyToAI("/recognize-classroom", form);

    // Return AI results to the frontend
    return res.json({
      classroomId,
      classroomName: classroom.name,
      subject: classroom.subject,
      facesDetected: aiResult.facesDetected,
      unknownFaces: aiResult.unknownFaces,
      results: aiResult.results,
    });
  } catch (err) {
    console.error("recognizeClassroom error:", err.message);
    return res.status(500).json({ message: err.message || "AI recognition failed." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/ai/health
// Check if the Python AI service is reachable
// ─────────────────────────────────────────────────────────────────────────────
const checkAiHealth = async (req, res) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/`);
    const data = await response.json();
    return res.json({ aiServiceUp: true, ...data });
  } catch (err) {
    return res.status(503).json({
      aiServiceUp: false,
      message: "AI service is not running. Please start the Python FastAPI service.",
    });
  }
};

module.exports = {
  registerFace,
  getFaceStatus,
  clearFaceEncodings,
  recognizeClassroom,
  checkAiHealth,
};
