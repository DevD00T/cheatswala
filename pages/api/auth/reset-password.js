import mongooseConnect from '@/lib/mongoose';
import { User } from '@/models/User';
import { assertMethod } from '@/lib/api/http';
import {
  getPasswordValidationError,
  hashPassword,
} from '@/lib/auth/password';
import { createHash } from 'crypto';

const handler = async (req, res) => {
  if (!assertMethod(req, res, ['POST'])) {
    return;
  }

  const token = String(req.body?.token || '').trim();
  const password = String(req.body?.password || '');

  if (!token) {
    return res.status(400).json({ message: 'Reset token is required.' });
  }

  const passwordError = getPasswordValidationError(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  await mongooseConnect();

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const now = new Date();

  const updated = await User.findOneAndUpdate(
    {
      resetPasswordTokenHash: tokenHash,
      resetPasswordTokenExpiresAt: { $gt: now },
    },
    {
      $set: {
        passwordHash: hashPassword(password),
        resetPasswordTokenHash: null,
        resetPasswordTokenExpiresAt: null,
      },
      $setOnInsert: {
        roles: ['user'],
      },
    },
    { new: true }
  ).lean();

  if (!updated?._id) {
    return res.status(400).json({
      message: 'Reset link is invalid or expired. Please request a new one.',
    });
  }

  return res.status(200).json({ message: 'Password updated successfully.' });
};

export default handler;
