import mongooseConnect from '@/lib/mongoose';
import { Address } from '@/models/Address';
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

  const email = (req.body?.email || '').trim();
  const address = await Address.findOne({ userEmail: user.email });

  if (req.method === 'PUT') {
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    if (address) {
      const updated = await Address.findByIdAndUpdate(
        address._id,
        { email },
        { new: true }
      );
      return res.json(updated);
    }

    const created = await Address.create({
      userEmail: user.email,
      email,
    });
    return res.json(created);
  }

  if (!address) {
    const created = await Address.create({
      userEmail: user.email,
      email: user.email,
    });
    return res.json(created);
  }

  if (!address.email) {
    const updated = await Address.findByIdAndUpdate(
      address._id,
      { email: user.email },
      { new: true }
    );
    return res.json(updated);
  }

  return res.json(address);
};

export default handler;
