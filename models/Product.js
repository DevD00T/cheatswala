const { Schema, model, models } = require('mongoose');
const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    price: { type: Number },
    images: [{ type: String }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    properties: { type: Object },
    stock: { type: Number, default: 0 },
    slug: { type: String, unique: true },
    tags: [{ type: String }],
    downloads: [
      {
        name: String,
        link: String,
        version: String,
        changelog: String,
        updateTime: { type: Date, default: Date.now },
      },
    ],
    typeOfProduct: String,
    tutorial: String,
    keyList: [{type: String}],
    secret: String,
    copiesSold: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

ProductSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

export const Product = models?.Product || model('Product', ProductSchema);
