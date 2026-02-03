const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const EXPIRE_IN_DAYS = 30;
const NotificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", default: null, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    informationType: {
      type: String,
      enum: [
        "schedule",
        "academic",
        "administrative",
        "financial",
        "exam",
        "announcement",
        "pedagogical",
        "alert",
        "account",
        "system",
      ],
      default: "announcement",
    },
    warningLevel: {
      type: String,
      default: null,
      enum: ["info", "warning", "critical"],
    },
    promotion: [
      {
        type: Schema.Types.ObjectId,
        ref: "Promotion",
        index: true,
      },
    ],
    type: {
      type: String,
      enum: [
        "individual",
        "global",
        "promotion",
        "admin",
        "professor",
        "student",
        "superAdmin",
      ],
      default: "global",
      index: true, // 🚀 Index ajouté
    },
    linkTo: { type: String, default: null },
    expireAt: {
      type: Date,
      default: () =>
        new Date(Date.now() + EXPIRE_IN_DAYS * 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

// ===== INDEX COMPOSÉS OPTIMISÉS =====
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, type: 1 });

const Notification = mongoose.model("notification", NotificationSchema);
module.exports = Notification;
