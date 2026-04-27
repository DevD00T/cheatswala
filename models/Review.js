const { Schema, model, models } = require('mongoose');
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title:String,
  description:String,
  rating:Number,
  product:{type:Schema.Types.ObjectId},
  user: { type: Schema.Types.ObjectId, ref: 'User' },
},{timestamps:true});

export const Review = models?.Review || model('Review', ReviewSchema);
