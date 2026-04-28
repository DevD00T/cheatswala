import mongooseConnect from '@/lib/mongoose';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';
import { assertMethod } from '@/lib/api/http';
import { getSessionUser } from '@/lib/api/auth';
import { PaymentMethod } from '@/models/PaymentMethods';
import { Setting } from '@/models/Setting';
import { sendNewOrderTelegramNotification } from '@/lib/telegram';
import { User } from '@/models/User';

const getRequestBaseUrl = (req) => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol =
    typeof forwardedProto === 'string' && forwardedProto
      ? forwardedProto.split(',')[0]
      : 'http';
  const host = req.headers.host;
  if (!host) {
    return '';
  }

  return `${protocol}://${host}`;
};

const useTelegramOrderWorker =
  String(process.env.TELEGRAM_USE_ORDER_WORKER || '')
    .trim()
    .toLowerCase() === 'true';

const handler = async (req, res) => {
  if (!assertMethod(req, res, ['POST'])) {
    return;
  }

  try {
    const { email, paymentMethod, cartProducts, defaultAddress } = req.body;
    const sessionUser = await getSessionUser(req);
    const accountEmail = (sessionUser?.email || '').trim().toLowerCase();
    const accountUserId = sessionUser?.id || '';
    const normalizedEmail = ((email || '').trim().toLowerCase() || accountEmail);

    if (!normalizedEmail || !paymentMethod || !Array.isArray(cartProducts)) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (cartProducts.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    await mongooseConnect();

    if (defaultAddress && accountUserId) {
      await User.findByIdAndUpdate(accountUserId, {
        $set: { deliveryEmail: normalizedEmail },
      });
    }

    const productIds = cartProducts;
    const uniqueIds = [...new Set(productIds)];
    const productInfos = await Product.find({ _id: uniqueIds });

    let line_items = [];
    let outOfStockProducts = [];
    let totalPrice = 0;

    for (const productId of uniqueIds) {
      const productInfo = productInfos.find((p) => p._id.toString() === productId);
      const quantity = productIds.filter((id) => id === productId)?.length || 0;
      if (!productInfo) {
        continue;
      }
      totalPrice += productInfo.price * quantity;

      if (quantity > 0) {
        if (productInfo.stock >= quantity) {
          line_items.push({
            quantity,
            price_data: {
              currency: 'INR',
              product_data: {
                name: productInfo.title,
                image: productInfo.images?.[0] || '',
                metadata: {
                  productId: productId,
                  selling_price: Number(productInfo.price),
                },
              },
              unit_amount: Number(productInfo.price),
            },
          });
        } else {
          outOfStockProducts.push(productInfo);
        }
      }
    }

    if (outOfStockProducts.length > 0) {
      return res.status(400).json({
        message: 'OUT_OF_STOCK_PRODUCTS',
        outOfStockProducts,
      });
    }

    const orderDoc = await Order.create({
      line_items,
      email: normalizedEmail,
      paid: false,
      userEmail: accountEmail || normalizedEmail,
      totalAmount: totalPrice,
      paymentMethod,
      status: 'Waiting for payment',
    });

    if (!useTelegramOrderWorker) {
      try {
        const [paymentMethodInfo, telegramRecipients] = await Promise.all([
          PaymentMethod.findById(paymentMethod).select('name').lean(),
          Setting.findOne({ name: 'telegramNotifyUsernames' })
            .select('value')
            .lean(),
        ]);

        await sendNewOrderTelegramNotification({
          orderId: orderDoc._id.toString(),
          orderEmail: normalizedEmail,
          paymentMethodName: paymentMethodInfo?.name || '',
          itemCount: cartProducts.length,
          totalAmount: totalPrice,
          storefrontUrl: getRequestBaseUrl(req),
          notifyTargets: telegramRecipients?.value,
        });
      } catch (telegramError) {
        console.error('Telegram notification failed:', telegramError?.message);
      }
    }

    return res.json({
      orderId: orderDoc._id,
    });
  } catch (error) {
    console.error('An error occurred during checkout:', error);
    return res.status(500).json({
      message: 'An error occurred during payment processing',
    });
  }
};

export default handler;
