const { Schema, model, models } = require('mongoose');
const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  userEmail:{ type: String,unique:true,required:true },
  email: { type: String },
});

export const Address = models?.Address || model('Address', AddressSchema);
