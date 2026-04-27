import mongooseConnect from '@/lib/mongoose';
import { Product } from '@/models/Product';
import { assertMethod } from '@/lib/api/http';

const handler = async (req, res) => {
  if (!assertMethod(req, res, ['GET'])) {
    return;
  }

  await mongooseConnect();
  const { id } = req.query;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, stock: product.stock });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export default handler;
