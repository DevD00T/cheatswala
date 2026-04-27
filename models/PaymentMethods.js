const { Schema, model, models } = require('mongoose');
const mongoose = require('mongoose');
const PaymentMethodSchema = new mongoose.Schema(
  {
    name: String,
    image: String,
    qrcode: Object,
    senderDetailsRequired:[{type:String}],
    receiverDetailsRequired:[{type:Object}],
    notes:String
  }
);

export const PaymentMethod = models?.PaymentMethod || model('PaymentMethod', PaymentMethodSchema);
