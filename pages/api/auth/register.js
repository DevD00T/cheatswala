import mongooseConnect from '@/lib/mongoose';
import { User } from '@/models/User';
import {
  getPasswordValidationError,
  hashPassword,
} from '@/lib/auth/password';
import { normalizeEmail } from '@/lib/auth/options';

const isValidEmail = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password || '';
  const name = (req.body?.name || '').trim();

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email.' });
  }

  const passwordError = getPasswordValidationError(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  await mongooseConnect();

  const existingUser = await User.findOne({ email }).select('+passwordHash');
  if (existingUser?.passwordHash) {
    return res.status(409).json({ message: 'Account already exists.' });
  }

  const passwordHash = hashPassword(password);

  if (existingUser) {
    existingUser.passwordHash = passwordHash;
    existingUser.name = existingUser.name || name || email.split('@')[0];
    existingUser.deliveryEmail = existingUser.deliveryEmail || email;
    existingUser.roles = existingUser.roles?.length ? existingUser.roles : ['user'];
    await existingUser.save();
    return res.status(201).json({ message: 'Account created successfully.' });
  }

  await User.create({
    name: name || email.split('@')[0],
    email,
    deliveryEmail: email,
    roles: ['user'],
    passwordHash,
  });

  return res.status(201).json({ message: 'Account created successfully.' });
}
