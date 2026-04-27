import mongooseConnect from '@/lib/mongoose';
import { User } from '@/models/User';
import { assertMethod } from '@/lib/api/http';
import { requireSessionUser } from '@/lib/api/auth';

const handler = async (req, res) => {
  if (!assertMethod(req, res, ['GET', 'PUT'])) {
    return;
  }

  await mongooseConnect();

  const user = await requireSessionUser(req, res);
  if (!user) {
    return;
  }

  const email = (req.body?.email || '').trim().toLowerCase();
  const userDoc = await User.findById(user.id);

  if (req.method === 'PUT') {
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    if (!userDoc) {
      return res.status(404).json({ message: 'User not found.' });
    }

    userDoc.deliveryEmail = email;
    await userDoc.save();
    return res.json({ email: userDoc.deliveryEmail || userDoc.email });
  }

  if (!userDoc) {
    return res.status(404).json({ message: 'User not found.' });
  }

  if (!userDoc.deliveryEmail) {
    userDoc.deliveryEmail = userDoc.email;
    await userDoc.save();
  }

  return res.json({ email: userDoc.deliveryEmail || userDoc.email });
};

export default handler;
