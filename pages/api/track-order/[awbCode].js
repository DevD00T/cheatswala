import { Order } from '@/models/Order';

const { default: mongooseConnect } = require('@/lib/mongoose');

const handler = async (req, res) => {
  const { method } = req;
  await mongooseConnect();
  if (method === 'GET') {
    const { awbCode } = req.query;
    
    if(!awbCode || awbCode===''){
        return res.status(400).json({ success: false, message: 'Tracking ID required' });
    
    }
    try {
        const order = await Order.findOne({awbCode});
        
        if(order){
           //remove deliveryProducts field if order is not paid
            if(!order.paid){
                order.line_items=order.line_items.map(item=>{
                    item.keyList = undefined;
                    item.secret = undefined;
                    return item;
                }
                )
            }
            return res.status(200).json({ success: true, order });
        }else{
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server Error' });
    }
  }
};

export default handler;
