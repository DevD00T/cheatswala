
import { Review } from '@/models/Review';
import { Order } from '@/models/Order';  // make sure to import Order model
import mongooseConnect from '@/lib/mongoose';
import { User } from '@/models/User';
import { assertMethod } from '@/lib/api/http';
import { getSessionUser } from '@/lib/api/auth';

const handler = async (req, res) => {
  if (!assertMethod(req, res, ['GET', 'POST'])) {
    return;
  }

  await mongooseConnect();

  if (req.method === 'POST') {
    const sessionUser = await getSessionUser(req, res);

    if (!sessionUser?.email) {
      return res.status(401).send('You must be logged in to post a review.');
    }

    const { title, description, rating, product } = req.body;
    if (!product) {
      return res.status(400).json({ message: 'Product is required.' });
    }

    if (Number(rating) <= 0) {
      return res.status(400).json({ message: 'Please select a rating.' });
    }

    const user = await User.findOne({ email: sessionUser.email });
    if (!user) {
      return res.status(404).send('User not found.');
    }

    const existingReview = await Review.findOne({ product, user: user._id });
    if (existingReview) {
      return res.status(400).send('You can only review a product once.');
    }

    const order = await Order.findOne({
      userEmail: sessionUser.email,
      'line_items.price_data.product_data.metadata.productId': product,
      paid: true,
    });
    if (!order) {
      return res
        .status(403)
        .send('You can only review products you purchased.');
    }

    const review = await Review.create({
      title,
      description,
      rating,
      product,
      user: user._id,
    });
    return res.status(201).json(review);
  }

  const { product } = req.query;
  if (!product) {
    return res.status(400).json({ message: 'Product is required.' });
  }

  const reviews = await Review
    .find({ product }, null, { sort: { createdAt: -1 } })
    .populate('user', 'name image');
  return res.json(reviews);
};

export default handler;
