const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    matricule: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      set: (v) => v.toUpperCase(),
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      set: (v) => {
        if (!v) return "";
        return v
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      set: (v) => v.toLowerCase(),
    },
    address: {
      type: String,
      required: [true, "L'adresse est requise"],
      trim: true,
      minlength: [1, "L'adresse doit contenir au moins 1 caractère"],
    },
    phone: {
      type: String,
      required: [true, "Le numéro de téléphone est requis"],
      trim: true,
      unique: [
        true,
        "Un utilisateur possédant ce numéro de téléphone existe déjà",
      ],
    },
    gender: {
      type: String,
      required: [true, "Le genre est requis"],
      enum: {
        values: ["male", "female"],
        message: 'Le genre doit être soit "male" soit "female"',
      },
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    configs: {
      defaultPassword: {
        type: Boolean,
        default: true,
      },
      lastPasswordChange: {
        type: Date,
        default: null,
      },
    },

  },
  {
    discriminatorKey: "role",
    collection: "users",
    timestamps: true,
  }
);

UserSchema.index({ name: "text", firstName: "text" });

UserSchema.index({ role: 1, matricule: 1 });

const User = mongoose.model("user", UserSchema);

module.exports = User;
