import mongooseConnect from '@/lib/mongoose';
import { User } from '@/models/User';
import { clerkClient, getAuth } from '@clerk/nextjs/server';

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const getClient = async () => {
  if (typeof clerkClient === 'function') {
    return clerkClient();
  }

  return clerkClient;
};

const getPrimaryEmail = (clerkUser) => {
  if (!clerkUser) {
    return '';
  }

  const primaryEmail =
    clerkUser.emailAddresses?.find(
      (entry) => entry.id === clerkUser.primaryEmailAddressId
    ) || clerkUser.emailAddresses?.[0];

  return normalizeEmail(primaryEmail?.emailAddress || '');
};

const getDisplayName = (clerkUser, email) => {
  const fullName = [clerkUser?.firstName, clerkUser?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (fullName) {
    return fullName;
  }

  return email?.split('@')?.[0] || 'User';
};

export const getSessionUser = async (req) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return null;
  }

  try {
    const client = await getClient();
    const clerkUser = await client.users.getUser(userId);
    const email = getPrimaryEmail(clerkUser);

    if (!email) {
      return null;
    }

    await mongooseConnect();

    const image =
      clerkUser.imageUrl ||
      clerkUser.profileImageUrl ||
      null;

    const syncedUser = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          clerkId: userId,
          email,
          name: getDisplayName(clerkUser, email),
          image,
        },
        $addToSet: {
          authProviders: 'clerk',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return {
      id: syncedUser._id.toString(),
      clerkId: userId,
      email: syncedUser.email,
      name: syncedUser.name,
      image: syncedUser.image,
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
