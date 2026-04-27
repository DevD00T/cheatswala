import { Bot, InlineKeyboard } from 'grammy';

let botInstance = null;
let tokenCache = null;
let webhookSignature = null;
let webhookConfiguredAt = 0;

const ORDER_ACTION_PREFIX = 'order_action';
const ORDER_ACTIONS = new Set(['deliver', 'cancel', 'email']);

const getBot = () => {
  const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  if (!token) {
    return null;
  }

  if (!botInstance || tokenCache !== token) {
    tokenCache = token;
    botInstance = new Bot(token);
  }

  return botInstance;
};

const stripTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const ensureWebhook = async (bot) => {
  const webhookBaseUrl =
    (process.env.TELEGRAM_WEBHOOK_URL || '').trim() ||
    (process.env.STOREFRONT_URL || '').trim();
  const webhookUrl = webhookBaseUrl
    ? webhookBaseUrl.includes('/api/telegram/webhook')
      ? stripTrailingSlash(webhookBaseUrl)
      : `${stripTrailingSlash(webhookBaseUrl)}/api/telegram/webhook`
    : '';
  if (!webhookUrl) {
    return;
  }

  const secretToken = (process.env.TELEGRAM_WEBHOOK_SECRET || '').trim();
  const signature = `${tokenCache}|${webhookUrl}|${secretToken}`;
  const now = Date.now();

  if (signature === webhookSignature && now - webhookConfiguredAt < 300000) {
    return;
  }

  await bot.api.setWebhook(webhookUrl, {
    secret_token: secretToken || undefined,
    allowed_updates: ['callback_query'],
  });

  webhookSignature = signature;
  webhookConfiguredAt = now;
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const normalizeTelegramTarget = (value = '') => {
  const sanitized = String(value).trim().replace(/\s+/g, '');
  if (!sanitized) {
    return '';
  }

  if (/^-?\d+$/.test(sanitized)) {
    return sanitized;
  }

  return sanitized.startsWith('@') ? sanitized : `@${sanitized}`;
};

const parseTelegramTargets = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeTelegramTarget).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/[,\n]/)
      .map(normalizeTelegramTarget)
      .filter(Boolean);
  }

  return [];
};

const getTelegramRecipients = (notifyTargets) => {
  const targets = [
    ...parseTelegramTargets(notifyTargets),
    ...parseTelegramTargets(process.env.TELEGRAM_NOTIFY_USERNAMES || ''),
    ...parseTelegramTargets(process.env.TELEGRAM_ADMIN_CHAT_ID || ''),
  ];

  return Array.from(new Set(targets));
};

const getOrderActionCallbackData = (action, orderId) =>
  `${ORDER_ACTION_PREFIX}|${action}|${orderId}`;

export const parseOrderActionCallbackData = (callbackData) => {
  const [prefix, action, orderId] = String(callbackData || '').split('|');
  if (prefix !== ORDER_ACTION_PREFIX || !ORDER_ACTIONS.has(action)) {
    return null;
  }

  if (!/^[a-f0-9]{24}$/i.test(orderId || '')) {
    return null;
  }

  return { action, orderId };
};

export const getTelegramBot = () => getBot();

export const sendNewOrderTelegramNotification = async ({
  orderId,
  orderEmail,
  paymentMethodName,
  itemCount,
  totalAmount,
  adminDashboardUrl,
  storefrontUrl,
  notifyTargets,
}) => {
  const bot = getBot();
  const recipients = getTelegramRecipients(notifyTargets);

  if (!bot || recipients.length === 0 || !orderId) {
    return;
  }

  try {
    await ensureWebhook(bot);
  } catch (error) {
    console.error('Telegram webhook setup failed:', error?.message || error);
  }

  const adminBase = stripTrailingSlash(
    adminDashboardUrl || process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3001'
  );
  const storefrontBase = stripTrailingSlash(
    storefrontUrl || process.env.STOREFRONT_URL || 'http://localhost:3000'
  );

  const message = [
    '🛒 <b>New Manual Payment Order</b>',
    '',
    `<b>Order ID:</b> <code>${escapeHtml(orderId)}</code>`,
    `<b>Email:</b> ${escapeHtml(orderEmail || '-')}`,
    `<b>Payment Method:</b> ${escapeHtml(paymentMethodName || 'Manual')}`,
    `<b>Items:</b> ${escapeHtml(itemCount || 0)}`,
    `<b>Total:</b> ${escapeHtml(formatCurrency(totalAmount))}`,
  ].join('\n');

  const keyboard = new InlineKeyboard()
    .text('Mark Delivered', getOrderActionCallbackData('deliver', orderId))
    .text('Send Email', getOrderActionCallbackData('email', orderId))
    .row()
    .text('Cancel Order', getOrderActionCallbackData('cancel', orderId))
    .row()
    .url('Open Order', `${adminBase}/orders?orderId=${encodeURIComponent(orderId)}`)
    .row()
    .url('Orders Queue', `${adminBase}/orders`)
    .url(
      'Payment Page',
      `${storefrontBase}/checkout/${encodeURIComponent(orderId)}`
    );

  for (const chatId of recipients) {
    try {
      await bot.api.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: keyboard,
      });
    } catch (error) {
      console.error(
        `Telegram notification failed for recipient ${chatId}:`,
        error?.message || error
      );
    }
  }
};
