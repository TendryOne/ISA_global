const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubmissionSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "user", required: true },
    assignment: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    fileUrl: { type: String, default: null },
    submittedAt: { type: Date, default: Date.now },
    grade: { type: Number, min: 0, max: 20 },
    status: {
      type: String,
      enum: ["submitted", "graded", "late", "missing"],
      default: "submitted",
    },
    feedback: { type: String },
  },
  {
    timestamps: true,
  }
);

SubmissionSchema.index({ student: 1, assignment: 1 }, { unique: true });

const Submission = mongoose.model("Submission", SubmissionSchema);

module.exports = Submission;
