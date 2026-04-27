import { Review } from '@/models/Review';
import { Order } from '@/models/Order'; 
import mongooseConnect from '@/lib/mongoose';

import { User } from '@/models/User';
import { assertMethod } from '@/lib/api/http';
import { getSessionUser } from '@/lib/api/auth';

const handler = async (req, res) => {
  if (!assertMethod(req, res, ['GET'])) {
    return;
  }

  await mongooseConnect();

  const sessionUser = await getSessionUser(req, res);
  if (!sessionUser?.email) {
    return res.json({
      eligibility: false,
      message: 'You must be logged in to post a review.',
    });
  }

  const user = await User.findOne({ email: sessionUser.email });
  if (!user) {
    return res.json({
      eligibility: false,
      message: 'You must be logged in to post a review.',
    });
  }

  const { product } = req.query;
  if (!product) {
    return res
      .status(400)
      .json({ eligibility: false, message: 'Product is required.' });
  }

  const existingReview = await Review.findOne({ product, user: user._id });
  if (existingReview) {
    return res.json({
      eligibility: false,
      message: 'You can only review a product once.',
    });
  }

  const order = await Order.findOne({
    userEmail: sessionUser.email,
    'line_items.price_data.product_data.metadata.productId': product,
    paid: true,
  });

  if (!order) {
    return res.json({
      eligibility: false,
      message: 'You can only review products you purchased.',
    });
  }

  return res.json({ eligibility: true });
};

export default handler;
