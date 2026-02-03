const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BugReportSchema = new Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["bug", "feature", "improvement", "other"],
    },
    description: { type: String, required: true },
    reporterMatricule: { type: String, required: true },
    reporter: { type: Schema.Types.ObjectId, ref: "user", required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index pour les filtres courants
BugReportSchema.index({ isResolved: 1, createdAt: -1 });
BugReportSchema.index({ priority: 1, isResolved: 1 });
BugReportSchema.index({ type: 1, isResolved: 1 });
BugReportSchema.index({ reporterMatricule: 1 });
BugReportSchema.index({ createdAt: -1 });

const BugReport = mongoose.model("BugReport", BugReportSchema);

module.exports = BugReport;
