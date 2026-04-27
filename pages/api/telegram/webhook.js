import { getTelegramWebhookHandler } from '@/lib/telegram';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, message: 'Method not allowed.' });
  }

  const expectedSecret = (process.env.TELEGRAM_WEBHOOK_SECRET || '').trim();
  if (expectedSecret) {
    const incomingSecret = String(
      req.headers['x-telegram-bot-api-secret-token'] || ''
    ).trim();
    if (incomingSecret !== expectedSecret) {
      return res.status(401).json({ ok: false, message: 'Invalid webhook signature.' });
    }
  }

  const webhookHandler = getTelegramWebhookHandler();
  if (!webhookHandler) {
    return res.status(503).json({ ok: false, message: 'Telegram bot is not configured.' });
  }

  return webhookHandler(req, res);
};

export default handler;

export const config = {
  api: {
    // grammY webhook callback expects to read the raw request stream.
    bodyParser: false,
  },
};
