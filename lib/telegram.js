import { Bot, InlineKeyboard, webhookCallback } from 'grammy';
import clientPromise from '@/lib/mongodb';

let botInstance = null;
let tokenCache = null;
let botInitialized = false;
let webhookSignature = null;
let webhookConfiguredAt = 0;

const ORDER_ACTION_PREFIX = 'order_action';
const ORDER_ACTIONS = new Set(['deliver', 'cancel', 'email']);

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

const TELEGRAM_SUBSCRIBERS_COLLECTION = 'telegram_subscribers';

const normalizeUsername = (value = '') =>
  String(value || '').replace(/^@/, '').trim().toLowerCase();

const getDb = async () => {
  const client = await clientPromise;
  return client.db();
};

const upsertSubscriber = async ({ chatId, username, firstName, lastName }) => {
  if (!chatId) {
    return;
  }

  const now = new Date();
  const db = await getDb();
  const collection = db.collection(TELEGRAM_SUBSCRIBERS_COLLECTION);

  const chatIdValue = chatId.toString();
  const normalizedUsername = normalizeUsername(username);

  const filter = normalizedUsername
    ? { $or: [{ chatId: chatIdValue }, { username: normalizedUsername }] }
    : { chatId: chatIdValue };

  await collection.updateOne(
    filter,
    {
      $set: {
        chatId: chatIdValue,
        username: normalizedUsername || null,
        firstName: firstName || '',
        lastName: lastName || '',
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );
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

const setupBot = (bot) => {
  bot.command('start', async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) {
      return;
    }

    await upsertSubscriber({
      chatId,
      username: ctx.from?.username,
      firstName: ctx.from?.first_name,
      lastName: ctx.from?.last_name,
    });

    const hasUsername = normalizeUsername(ctx.from?.username);
    const botUsername = (process.env.TELEGRAM_BOT_USERNAME || '').trim();

    const base =
      'Subscribed. You will receive order notifications if your Telegram username is configured in admin Settings.';
    const extra = hasUsername
      ? ''
      : ' Your Telegram account has no @username set. Ask the admin to add your numeric chat ID instead.';
    const hint = botUsername
      ? `\n\nBot: @${normalizeUsername(botUsername)}`
      : '';

    await ctx.reply(`${base}${extra}${hint}`);
  });

  bot.callbackQuery(new RegExp(`^${ORDER_ACTION_PREFIX}\\|`), async (ctx) => {
    const parsed = parseOrderActionCallbackData(ctx.callbackQuery?.data);

    if (!parsed) {
      await ctx.answerCallbackQuery({
        text: 'Unsupported action payload.',
        show_alert: true,
      });
      return;
    }

    const actionResult = await callAdminOrderAction(parsed);

    await ctx.answerCallbackQuery({
      text: actionResult.ok ? 'Action completed.' : 'Action failed.',
      show_alert: !actionResult.ok,
    });

    const chatId = ctx.chat?.id;
    if (chatId) {
      const prefix = actionResult.ok ? '✅' : '❌';
      await ctx.api.sendMessage(
        chatId,
        `${prefix} #${parsed.orderId} • ${ACTION_TO_LABEL[parsed.action]}: ${actionResult.message}`
      );
    }
  });
};

const ensureBot = () => {
  const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  if (!token) {
    return null;
  }

  if (!botInstance || tokenCache !== token) {
    tokenCache = token;
    botInstance = new Bot(token);
    botInitialized = false;
  }

  if (!botInitialized) {
    botInitialized = true;
    setupBot(botInstance);
  }

  return botInstance;
};

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
    allowed_updates: ['callback_query', 'message'],
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

const resolveTelegramRecipients = async (notifyTargets) => {
  const targets = getTelegramRecipients(notifyTargets);
  if (targets.length === 0) {
    return [];
  }

  const numericChatIds = new Set();
  const handles = new Set();

  targets.forEach((target) => {
    if (!target) {
      return;
    }

    if (/^-?\d+$/.test(target)) {
      numericChatIds.add(target);
      return;
    }

    const username = normalizeUsername(target);
    if (username) {
      handles.add(username);
    }
  });

  const resolved = new Set([...numericChatIds]);

  if (handles.size > 0) {
    try {
      const db = await getDb();
      const subscribers = await db
        .collection(TELEGRAM_SUBSCRIBERS_COLLECTION)
        .find({ username: { $in: Array.from(handles) } })
        .toArray();

      const usernameToChatId = new Map();
      subscribers.forEach((subscriber) => {
        const username = normalizeUsername(subscriber?.username);
        const chatId = subscriber?.chatId;
        if (username && chatId) {
          usernameToChatId.set(username, chatId.toString());
        }
      });

      Array.from(handles).forEach((username) => {
        const chatId = usernameToChatId.get(username);
        if (chatId) {
          resolved.add(chatId);
        } else {
          // Fallback: keep @username in case it's a channel handle.
          resolved.add(`@${username}`);
        }
      });
    } catch (error) {
      Array.from(handles).forEach((username) => resolved.add(`@${username}`));
    }
  }

  return Array.from(resolved);
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

export const getTelegramBot = () => ensureBot();

export const getTelegramWebhookHandler = () => {
  const bot = ensureBot();
  if (!bot) {
    return null;
  }

  return webhookCallback(bot, 'std/http');
};

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
  const bot = ensureBot();
  const recipients = await resolveTelegramRecipients(notifyTargets);

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
