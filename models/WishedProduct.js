const { Schema, model, models } = require('mongoose');
const mongoose = require('mongoose');

const WishedProductSchema = new mongoose.Schema({
  userEmail:{ type: String,required:true },
  product:{ type: mongoose.Types.ObjectId, ref: 'Product' }
});

export const WishedProduct = models?.WishedProduct || model('WishedProduct', WishedProductSchema);
