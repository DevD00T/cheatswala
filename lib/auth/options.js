import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import mongooseConnect from '@/lib/mongoose';
import { User } from '@/models/User';
import { verifyPassword } from '@/lib/auth/password';
import { timingSafeEqual } from 'crypto';

export const normalizeEmail = (email = '') => email.trim().toLowerCase();

const devAuthEmail = normalizeEmail(process.env.DEV_AUTH_EMAIL || '');
const devAuthPassword = process.env.DEV_AUTH_PASSWORD || '';

const safeEqual = (left = '', right = '') => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

const authorizeDevelopmentUser = async (email, password) => {
  if (!devAuthEmail || !devAuthPassword) {
    return null;
  }

  if (email !== devAuthEmail || !safeEqual(password, devAuthPassword)) {
    return null;
  }

  await mongooseConnect();
  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        email,
        name: 'Development User',
        deliveryEmail: email,
        roles: ['user'],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name || user.email,
    image: user.image || null,
  };
};

const credentialsProvider = CredentialsProvider({
  name: 'Email and Password',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    const email = normalizeEmail(credentials?.email);
    const password = credentials?.password || '';

    if (!email || !password) {
      return null;
    }

    const devUser = await authorizeDevelopmentUser(email, password);
    if (devUser) {
      return devUser;
    }

    await mongooseConnect();
    const user = await User.findOne({ email }).select('+passwordHash').lean();

    if (!user?.passwordHash) {
      return null;
    }

    const isValidPassword = verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name || user.email,
      image: user.image || null,
    };
  },
});

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: MongoDBAdapter(clientPromise),
  providers: [credentialsProvider],
  pages: {
    signIn: '/account',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 6,
  },
  callbacks: {
    async signIn({ user }) {
      const email = normalizeEmail(user?.email);
      return !!email;
    },
    async jwt({ token, user, account }) {
      if (user?.id) {
        token.sub = user.id.toString();
      }

      if (account?.provider) {
        token.provider = account.provider;
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
        session.user.provider = token.provider || 'unknown';
      }

      return session;
    },
  },
};
