const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSeenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
      index: true,
    },

    lastSeenAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("NotificationSeen", NotificationSeenSchema);
