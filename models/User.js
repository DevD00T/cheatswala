const { Schema, model, models } = require('mongoose');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, unique: true, sparse: true, index: true },
  name: { type: String, trim: true, maxlength: 120 },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  image: { type: String, default: null },
  emailVerified: { type: Date, default: null },
  passwordHash: { type: String, select: false },
  authProviders: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

UserSchema.index({ email: 1 }, { unique: true });

export const User = models?.User || model('User', UserSchema);
