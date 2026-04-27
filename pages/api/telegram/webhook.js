import {
  getTelegramBot,
  parseOrderActionCallbackData,
} from '@/lib/telegram';

const ACTION_TO_ENDPOINT = {
  deliver: 'accept',
  cancel: 'cancel',
  email: 'sendmail',
};

const ACTION_TO_LABEL = {
  deliver: 'Mark Delivered',
  cancel: 'Cancel Order',
  email: 'Send Email',
};

const stripTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const toSafeString = async (response) => {
  try {
    return await response.text();
  } catch (error) {
    return '';
  }
};

const callAdminOrderAction = async ({ action, orderId }) => {
  const endpoint = ACTION_TO_ENDPOINT[action];
  const adminBaseUrl = stripTrailingSlash(
    (process.env.ADMIN_DASHBOARD_URL || '').trim()
  );
  const serviceToken = (process.env.ADMIN_API_SERVICE_TOKEN || '').trim();

  if (!endpoint) {
    return { ok: false, message: 'Unsupported action.' };
  }

  if (!adminBaseUrl || !serviceToken) {
    return {
      ok: false,
      message: 'Missing ADMIN_DASHBOARD_URL or ADMIN_API_SERVICE_TOKEN.',
    };
  }

  const response = await fetch(
    `${adminBaseUrl}/api/orders/${encodeURIComponent(orderId)}/${endpoint}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-service-token': serviceToken,
      },
    }
  );

  let payload = {};
  try {
    payload = await response.json();
  } catch (error) {
    const rawBody = await toSafeString(response);
    payload = rawBody ? { message: rawBody } : {};
  }

  if (!response.ok || payload?.success === false) {
    return {
      ok: false,
      message:
        payload?.message ||
        `${ACTION_TO_LABEL[action] || 'Order action'} failed (${response.status}).`,
    };
  }

  return {
    ok: true,
    message: payload?.message || `${ACTION_TO_LABEL[action]} completed.`,
  };
};

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

  const callbackQuery = req.body?.callback_query;
  if (!callbackQuery) {
    return res.status(200).json({ ok: true });
  }

  const bot = getTelegramBot();
  if (!bot) {
    return res.status(503).json({ ok: false, message: 'Telegram bot is not configured.' });
  }

  const parsed = parseOrderActionCallbackData(callbackQuery.data);
  if (!parsed) {
    await bot.api.answerCallbackQuery(callbackQuery.id, {
      text: 'Unsupported action payload.',
      show_alert: true,
    });
    return res.status(200).json({ ok: true });
  }

  const actionResult = await callAdminOrderAction(parsed);

  await bot.api.answerCallbackQuery(callbackQuery.id, {
    text: actionResult.ok ? 'Action completed.' : 'Action failed.',
    show_alert: !actionResult.ok,
  });

  const chatId = callbackQuery.message?.chat?.id;
  if (chatId) {
    const prefix = actionResult.ok ? '✅' : '❌';
    await bot.api.sendMessage(
      chatId,
      `${prefix} #${parsed.orderId} • ${ACTION_TO_LABEL[parsed.action]}: ${actionResult.message}`
    );
  }

  return res.status(200).json({ ok: true });
};

export default handler;
