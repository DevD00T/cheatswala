import mongooseConnect from "@/lib/mongoose";
import { PaymentMethod } from "@/models/PaymentMethods";
import { assertMethod } from "@/lib/api/http";


const handler = async(req, res) => {
    await mongooseConnect();
    if (!assertMethod(req, res, ['GET'])) {
      return;
    }

    let paymentMethods = await PaymentMethod.find({});
    res.json(paymentMethods)
};

export default handler;
