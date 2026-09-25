const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: [true, "Classroom reference is required"],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      required: [true, "Attendance status is required"],
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Marked by user reference is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance records for the same classroom, student, and date
attendanceSchema.index({ classroom: 1, student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
