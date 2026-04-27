import mongooseConnect from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { assertMethod } from "@/lib/api/http";
import { requireSessionUser } from "@/lib/api/auth";

const handler = async(req, res) => {
    if (!assertMethod(req, res, ['GET'])) {
      return;
    }

    await mongooseConnect();
    const user = await requireSessionUser(req, res);
    if (!user) {
      return;
    }

    let orders = await Order.find(
      { userEmail: user.email },
      null,
      { sort: { _id: -1 } }
    );

    orders = orders.map((order) => {
      if (!order.paid && Array.isArray(order.line_items)) {
        order.line_items = order.line_items.map((item) => {
          item.keyList = undefined;
          item.secret = undefined;
          return item;
        });
      }
      return order;
    });

    return res.json(orders);
};

export default handler;
