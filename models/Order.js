const { Schema, model, models } = require("mongoose");
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userEmail: String,
    line_items: Object,
    email: String,
    paid: Boolean,
    status: String,
    totalAmount: Number,
    paymentMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentMethod",
    },
    senderDetails: [{ type: Object }], //{name,value}
    awbCode: {
      type: String,
      unique: true,
      sparse:true
    },
    emailSent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Order = models?.Order || model("Order", OrderSchema);
