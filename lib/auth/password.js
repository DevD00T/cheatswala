import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export const getPasswordValidationError = (password = '') => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  if (!PASSWORD_REGEX.test(password)) {
    return 'Password must include uppercase, lowercase, and a number.';
  }

  return null;
};

export const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password, storedHash = '') => {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) {
    return false;
  }

  const hashedBuffer = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(hash, 'hex');

  if (storedBuffer.length !== hashedBuffer.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, hashedBuffer);
};
