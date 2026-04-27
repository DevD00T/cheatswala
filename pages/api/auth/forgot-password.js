import mongooseConnect from '@/lib/mongoose';
import { User } from '@/models/User';
import { normalizeEmail } from '@/lib/auth/options';
import { assertMethod } from '@/lib/api/http';
import { buildPasswordResetEmail, sendResendEmail } from '@/lib/resend';
import { createHash, randomBytes } from 'crypto';

const isValidEmail = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const stripTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const getRequestBaseUrl = (req) => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol =
    typeof forwardedProto === 'string' && forwardedProto
      ? forwardedProto.split(',')[0]
      : 'http';
  const host = req.headers.host;
  if (!host) {
    return '';
  }

  return `${protocol}://${host}`;
};

const buildBaseUrl = (req) => {
  const envBase = (process.env.SITE_URL || '').trim();
  if (envBase) {
    return stripTrailingSlash(envBase);
  }

  return stripTrailingSlash(getRequestBaseUrl(req));
};

const handler = async (req, res) => {
  if (!assertMethod(req, res, ['POST'])) {
    return;
  }

  const email = normalizeEmail(req.body?.email);
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email.' });
  }

  await mongooseConnect();

  const user = await User.findOne({ email }).select('_id email').lean();
  if (!user?._id) {
    return res.status(200).json({
      message: 'If an account exists, a reset link has been emailed.',
    });
  }

  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await User.findByIdAndUpdate(user._id, {
    resetPasswordTokenHash: tokenHash,
    resetPasswordTokenExpiresAt: expiresAt,
  });

  const baseUrl = buildBaseUrl(req);
  if (!baseUrl) {
    return res.status(500).json({ message: 'SITE_URL is not configured.' });
  }

  const resetUrl = `${baseUrl}/account?tab=reset&token=${encodeURIComponent(token)}`;
  const emailTemplate = buildPasswordResetEmail({ resetUrl });

  await sendResendEmail({
    to: user.email,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
    text: emailTemplate.text,
  });

  return res.status(200).json({
    message: 'If an account exists, a reset link has been emailed.',
  });
};

export default handler;

