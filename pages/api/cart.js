import mongooseConnect from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { assertMethod } from "@/lib/api/http";

const handler = async (req, res) => {
    if (!assertMethod(req, res, ['POST'])) {
      return;
    }

    await mongooseConnect();
    const ids = req.body.ids;
    res.json(await Product.find({_id:ids}).select('-keyList -secret'));
};

export default handler;
