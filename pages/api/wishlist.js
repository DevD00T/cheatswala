import mongooseConnect from '@/lib/mongoose';
import { WishedProduct } from '@/models/WishedProduct';
import { assertMethod } from '@/lib/api/http';
import { requireSessionUser } from '@/lib/api/auth';
const handler = async (req, res) => {
  if (!assertMethod(req, res, ['GET', 'POST'])) {
    return;
  }

  await mongooseConnect();

  const user = await requireSessionUser(req, res);
  if (!user) {
    return;
  }
  const email = user.email;

  if (req.method === 'POST') {
    const { product } = req.body;
    if (!product) {
      return res.status(400).json({ message: 'Product is required.' });
    }

    const wishedProduct = await WishedProduct.findOne({
      userEmail: email,
      product,
    });
    if (wishedProduct) {
      await WishedProduct.findByIdAndDelete(wishedProduct._id);
    } else {
      await WishedProduct.create({
        userEmail: email,
        product,
      });
    }
    return res.json(true);
  }

  const wishedProducts = await WishedProduct.find({ userEmail: email }).populate({
    path: 'product',
    select: '-keyList -secret',
  });
  return res.json(wishedProducts);
};

export default handler;
