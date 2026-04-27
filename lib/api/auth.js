import mongooseConnect from '@/lib/mongoose';
import { User } from '@/models/User';
import { getToken } from 'next-auth/jwt';

export const getSessionUser = async (req) => {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const userId = token?.sub;
  if (!userId) {
    return null;
  }

  try {
    await mongooseConnect();

    const user = await User.findById(userId).lean();
    if (!user?.email) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name || user.email,
      image: user.image || null,
      deliveryEmail: user.deliveryEmail || user.email,
      roles: user.roles || ['user'],
    };
  } catch (error) {
    return null;
  }
};

export const requireSessionUser = async (req, res) => {
  const user = await getSessionUser(req);

  if (!user?.email) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }

  return user;
};
