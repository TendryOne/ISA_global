const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TuitionFeeSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    promotion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promotion",
      default: null,
    },
    year: Number,
    field: String,
    level: String,

    totalAmount: Number,
    installments: [
      {
        label: String,
        dueDate: { type: Date, default: null },
        amount: Number,
        proofFile: { type: String, default: null },
        transactionRef: { type: String, default: null },
        method: {
          type: String,
          enum: ["mobile", "bank"],
          required: false,
          default: undefined,
        },
        verified: { type: Boolean, default: false },
        paymentDate: { type: Date, default: null },
        verifiedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        numberOfReminders: { type: Number, default: 0 },
        lastReminderDate: { type: Date, default: null },
      },
    ],
  },
  { timestamps: true }
);

// ===== INDEX OPTIMISÉS =====
TuitionFeeSchema.index({ user: 1, promotion: 1 }, { unique: true });
TuitionFeeSchema.index({ promotion: 1 });
TuitionFeeSchema.index({ "installments.verified": 1 });
TuitionFeeSchema.index({ "installments.dueDate": 1 });
TuitionFeeSchema.index({ "installments.transactionRef": 1 });

// ===== CHAMPS DÉNORMALISÉS POUR PERFORMANCE =====
TuitionFeeSchema.add({
  // Statistiques pré-calculées (mise à jour via middleware)
  stats: {
    totalPaid: { type: Number, default: 0 },
    totalPending: { type: Number, default: 0 },
    totalOverdue: { type: Number, default: 0 },
    lastPaymentDate: { type: Date, default: null }
  }
});

// ===== MIDDLEWARE PRE-SAVE POUR DÉNORMALISATION =====
TuitionFeeSchema.pre('save', function(next) {
  const now = new Date();
  
  // Calculer totalPaid
  this.stats.totalPaid = this.installments
    .filter(i => i.verified === true)
    .reduce((sum, i) => sum + (i.amount || 0), 0);
  
  // Calculer totalPending (preuve soumise mais non vérifiée)
  this.stats.totalPending = this.installments
    .filter(i => !i.verified && (i.proofFile || i.transactionRef))
    .reduce((sum, i) => sum + (i.amount || 0), 0);
  
  // Calculer totalOverdue (en retard)
  this.stats.totalOverdue = this.installments
    .filter(i => !i.verified && !i.proofFile && !i.transactionRef && i.dueDate && i.dueDate < now)
    .reduce((sum, i) => sum + (i.amount || 0), 0);
  
  // Dernière date de paiement
  const paidInstallments = this.installments
    .filter(i => i.verified && i.paymentDate)
    .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
  
  this.stats.lastPaymentDate = paidInstallments[0]?.paymentDate || null;
  
  next();
});

const TutionFees = mongoose.model("tutionFee", TuitionFeeSchema);

module.exports = TutionFees;
