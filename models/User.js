const { Schema, model, models } = require('mongoose');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    deliveryEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },
    roles: {
      type: [String],
      enum: ['user', 'admin', 'owner'],
      default: ['user'],
    },
    image: { type: String, default: null },
    emailVerified: { type: Date, default: null },
    passwordHash: { type: String, select: false },
    resetPasswordTokenHash: { type: String, select: false, default: null },
    resetPasswordTokenExpiresAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ resetPasswordTokenHash: 1 });

export const User = models?.User || model('User', UserSchema);
