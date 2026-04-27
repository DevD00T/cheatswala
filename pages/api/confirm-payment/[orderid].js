import mongooseConnect from '@/lib/mongoose';
import { Order } from '@/models/Order';
const { v4: uuidv4 } = require('uuid');

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    try {
      const { orderid } = req.query;
      const { senderDetails } = req.body;

      // Check if any required field is empty
      if (!Array.isArray(senderDetails) || senderDetails.length === 0) {
        return res.status(400).json({ message: 'Sender details required and should be an array.' });
      }

      await mongooseConnect();
      const order = await Order.findById(orderid).populate('paymentMethod');

      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      if (order.paid || order.status === 'Order processing') {
        return res.status(400).json({ message: 'Order already paid or being processed.' });
      }

      const validSenderDetails = senderDetails.filter(detail =>
        order.paymentMethod.senderDetailsRequired.includes(detail.name)
      );

      if (validSenderDetails.length !== order.paymentMethod.senderDetailsRequired.length) {
        return res.status(400).json({ message: 'Invalid sender details.' });
      }

      const randomUUID = uuidv4();
      const awbCode = randomUUID.replace(/-/g, '');

      // Update the order with sender details, AWB code, and status
      order.senderDetails = validSenderDetails;
      order.awbCode = awbCode;
      order.status = 'Order processing';

      await order.save();

      return res.status(200).json({ success: true, awbCode });
    } catch (error) {
      console.error('An error occurred during payment:', error);
      return res.status(500).json({ message: 'An error occurred during payment processing.' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed. Should be a POST request.' });
  }
};

export default handler;
