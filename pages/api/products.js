import mongooseConnect from '@/lib/mongoose';
import { Product } from '@/models/Product';
import { assertMethod } from '@/lib/api/http';

const handler = async (req, res) => {
  if (!assertMethod(req, res, ['GET'])) {
    return;
  }
  await mongooseConnect();
  const { categories, sort, phrase, ...filters } = req.query;
  let [sortField, sortOrder] = (sort || '_id-desc').split('-');
  let productQuery = {};
  if (categories) {
    productQuery.category = categories.split(',');
  }
  if (phrase) {
    productQuery.$or = [
      { title: { $regex: phrase, $options: 'i' } },
      { description: { $regex: phrase, $options: 'i' } },
    ];
  }
  if (Object.keys(filters).length > 0) {
    Object.keys(filters).forEach((filterName) => {
      productQuery[`properties.${filterName}`] = filters[filterName];
    });
  }
  const products = await Product.find(productQuery, null, {
    sort: { [sortField]: sortOrder === 'asc' ? 1 : -1 },
  });
  res.status(200).json(products);
};

export default handler;
