const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const administrativeRequestSchema = new Schema(
  {
    matricule: { type: String, required: true },
    student: { type: Schema.Types.ObjectId, ref: "user", required: true },
    promotion: {
      type: Schema.Types.ObjectId,
      ref: "Promotion",
      required: true,
    },
    requestType: {
      type: String,
      required: true,
      enum: ["transcript", "enrollment_certificate", "diploma"],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "recoverable", "delivered", "cancelled"],
      default: "pending",
    },
    recoveryDate: {
      type: Date,
      default: null,
    },
    handledBy: { type: Schema.Types.ObjectId, ref: "user", default: null },
  },
  {
    timestamps: true,
  }
);

administrativeRequestSchema.index({ matricule: 1 });
administrativeRequestSchema.index({ status: 1 });
administrativeRequestSchema.index({ requestType: 1 });

administrativeRequestSchema.index(
  { student: 1, promotion: 1, requestType: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "in-progress"] } },
  }
);
const AdministrativeRequest = mongoose.model(
  "AdministrativeRequest",
  administrativeRequestSchema
);

module.exports = AdministrativeRequest;
