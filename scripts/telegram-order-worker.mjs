#!/usr/bin/env bun

import { MongoClient, ObjectId } from 'mongodb';

const env = (key, fallback = '') => String(process.env[key] ?? fallback).trim();
const parseBool = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  return fallback;
};

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeUsername = (value = '') =>
  String(value || '').replace(/^@/, '').trim().toLowerCase();

const normalizeTelegramTarget = (value = '') => {
  const sanitized = String(value).trim().replace(/\s+/g, '');
  if (!sanitized) return '';
  if (/^-?\d+$/.test(sanitized)) return sanitized;
  const username = normalizeUsername(sanitized);
  return username ? `@${username}` : '';
};

const parseTelegramTargets = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(normalizeTelegramTarget).filter(Boolean);
  }

  return String(value)
    .split(/[\n,]/)
    .map(normalizeTelegramTarget)
    .filter(Boolean);
};

const stripTrailingSlash = (value = '') => value.replace(/\/+$/, '');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const config = {
  mongoUri: env('MONGODB_URI'),
  botToken: env('TELEGRAM_BOT_TOKEN'),
  adminDashboardUrl: stripTrailingSlash(env('ADMIN_DASHBOARD_URL', 'http://localhost:3001')),
  storefrontUrl: stripTrailingSlash(env('STOREFRONT_URL', 'http://localhost:3000')),
  serviceToken: env('ADMIN_API_SERVICE_TOKEN'),
  pollIntervalMs: parseNumber(env('TELEGRAM_ORDER_POLL_INTERVAL_MS'), 10000),
  lookbackMinutes: parseNumber(env('TELEGRAM_ORDER_LOOKBACK_MINUTES'), 240),
  batchLimit: parseNumber(env('TELEGRAM_ORDER_BATCH_LIMIT'), 50),
  updateTimeoutSec: parseNumber(env('TELEGRAM_UPDATE_TIMEOUT_SEC'), 30),
  updatesIdleDelayMs: parseNumber(env('TELEGRAM_UPDATES_IDLE_DELAY_MS'), 300),
  enableUpdatePolling: parseBool(env('TELEGRAM_WORKER_ENABLE_UPDATE_POLLING'), false),
  deleteWebhookOnStart: parseBool(env('TELEGRAM_DELETE_WEBHOOK_ON_START'), false),
  notifyCollection: env('TELEGRAM_NOTIFY_STATE_COLLECTION', 'telegram_order_notifications'),
  stateCollection: env('TELEGRAM_WORKER_STATE_COLLECTION', 'telegram_order_worker_state'),
  subscribersCollection: env('TELEGRAM_SUBSCRIBERS_COLLECTION', 'telegram_subscribers'),
  settingsCollection: env('TELEGRAM_SETTINGS_COLLECTION', 'settings'),
  ordersCollection: env('TELEGRAM_ORDERS_COLLECTION', 'orders'),
  paymentMethodsCollection: env('TELEGRAM_PAYMENT_METHODS_COLLECTION', 'paymentmethods'),
  onlyPendingOrders: parseBool(env('TELEGRAM_ONLY_PENDING_ORDERS'), true),
  failedRetryLimit: parseNumber(env('TELEGRAM_FAILED_RETRY_LIMIT'), 20),
  failedRetryMaxAttempts: parseNumber(env('TELEGRAM_FAILED_RETRY_MAX_ATTEMPTS'), 20),
  failedRetryBackoffMs: parseNumber(env('TELEGRAM_FAILED_RETRY_BACKOFF_MS'), 30000),
};

if (!config.mongoUri) {
  console.error('[telegram-worker] Missing MONGODB_URI');
  process.exit(1);
}

if (!config.botToken) {
  console.error('[telegram-worker] Missing TELEGRAM_BOT_TOKEN');
  process.exit(1);
}

const telegramApiBase = `https://api.telegram.org/bot${config.botToken}`;
const ORDER_ACTION_PREFIX = 'order_action';
const ORDER_CURSOR_DOC_ID = 'order_cursor';
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

const stats = {
  startedAt: new Date(),
  ordersScanned: 0,
  ordersSent: 0,
  callbacksHandled: 0,
  callbackErrors: 0,
  lastOrderScanAt: null,
  lastOrderSentAt: null,
  lastCallbackAt: null,
};

let shuttingDown = false;
let telegramOffset = 0;

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

const telegramRequest = async (method, payload = undefined) => {
  const response = await fetch(`${telegramApiBase}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload ? JSON.stringify(payload) : '{}',
  });

  const json = await safeJson(response);

  if (!response.ok || !json?.ok) {
    const description = json?.description || `${response.status} ${response.statusText}`;
    const error = new Error(`Telegram ${method} failed: ${description}`);
    error.status = response.status;
    error.responseBody = json;
    throw error;
  }

  return json.result;
};

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const countLineItems = (lineItems) => {
  if (Array.isArray(lineItems)) {
    return lineItems.reduce((acc, item) => acc + Number(item?.quantity || 0), 0);
  }

  if (lineItems && typeof lineItems === 'object') {
    return Object.values(lineItems).reduce(
      (acc, item) => acc + Number(item?.quantity || 0),
      0
    );
  }

  return 0;
};

const parseOrderActionCallbackData = (callbackData) => {
  const [prefix, action, orderId] = String(callbackData || '').split('|');
  if (prefix !== ORDER_ACTION_PREFIX || !Object.prototype.hasOwnProperty.call(ACTION_TO_ENDPOINT, action)) {
    return null;
  }

  if (!/^[a-f0-9]{24}$/i.test(orderId || '')) {
    return null;
  }

  return { action, orderId };
};

const getOrderActionCallbackData = (action, orderId) =>
  `${ORDER_ACTION_PREFIX}|${action}|${orderId}`;

const callAdminOrderAction = async ({ action, orderId }) => {
  const endpoint = ACTION_TO_ENDPOINT[action];
  if (!endpoint) {
    return { ok: false, message: 'Unsupported action.' };
  }

  if (!config.adminDashboardUrl) {
    return { ok: false, message: 'Missing ADMIN_DASHBOARD_URL.' };
  }

  if (!config.serviceToken) {
    return {
      ok: false,
      message: 'Missing ADMIN_API_SERVICE_TOKEN. Cannot call admin action endpoints.',
    };
  }

  const response = await fetch(
    `${config.adminDashboardUrl}/api/orders/${encodeURIComponent(orderId)}/${endpoint}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-service-token': config.serviceToken,
      },
    }
  );

  const payload = (await safeJson(response)) || {};
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
    updatedOrder: payload?.updatedOrder,
  };
};

const upsertSubscriber = async (subscribersCollection, { chatId, username, firstName, lastName }) => {
  if (!chatId) return;

  const now = new Date();
  const chatIdValue = String(chatId);
  const normalizedUsername = normalizeUsername(username);

  const filter = normalizedUsername
    ? { $or: [{ chatId: chatIdValue }, { username: normalizedUsername }] }
    : { chatId: chatIdValue };

  await subscribersCollection.updateOne(
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

const getConfiguredTargets = async (settingsCollection) => {
  const settingsDoc = await settingsCollection.findOne({ name: 'telegramNotifyUsernames' });

  const targets = [
    ...parseTelegramTargets(settingsDoc?.value),
    ...parseTelegramTargets(env('TELEGRAM_NOTIFY_USERNAMES', '')),
    ...parseTelegramTargets(env('TELEGRAM_ADMIN_CHAT_ID', '')),
  ];

  return Array.from(new Set(targets));
};

const resolveTelegramRecipients = async ({ settingsCollection, subscribersCollection }) => {
  const targets = await getConfiguredTargets(settingsCollection);
  if (targets.length === 0) {
    return [];
  }

  const numericChatIds = new Set();
  const handles = new Set();

  targets.forEach((target) => {
    if (/^-?\d+$/.test(target)) {
      numericChatIds.add(target);
      return;
    }

    const username = normalizeUsername(target);
    if (username) handles.add(username);
  });

  const resolved = new Set([...numericChatIds]);

  if (handles.size > 0) {
    const subscribers = await subscribersCollection
      .find({ username: { $in: Array.from(handles) } })
      .toArray();

    const userToChatId = new Map();
    subscribers.forEach((subscriber) => {
      const username = normalizeUsername(subscriber?.username);
      const chatId = subscriber?.chatId;
      if (username && chatId) {
        userToChatId.set(username, String(chatId));
      }
    });

    handles.forEach((username) => {
      const mapped = userToChatId.get(username);
      if (mapped) {
        resolved.add(mapped);
      } else {
        // Fallback for channels/supergroups with public handles.
        resolved.add(`@${username}`);
      }
    });
  }

  return Array.from(resolved);
};

const buildOrderMessage = ({ order, paymentMethodName }) => {
  const orderId = String(order?._id || '');
  const itemCount = countLineItems(order?.line_items);
  const createdAt = order?.createdAt ? new Date(order.createdAt).toISOString() : '-';

  return [
    '🛒 <b>New Manual Payment Order</b>',
    '',
    `<b>Order ID:</b> <code>${orderId}</code>`,
    `<b>Email:</b> ${order?.email || '-'}`,
    `<b>Status:</b> ${order?.status || '-'}`,
    `<b>Payment Method:</b> ${paymentMethodName || 'Manual'}`,
    `<b>Items:</b> ${itemCount}`,
    `<b>Total:</b> ${formatCurrency(order?.totalAmount)}`,
    `<b>Created:</b> ${createdAt}`,
  ].join('\n');
};

const buildOrderKeyboard = (orderId) => ({
  inline_keyboard: [
    [
      { text: 'Mark Delivered', callback_data: getOrderActionCallbackData('deliver', orderId) },
      { text: 'Send Email', callback_data: getOrderActionCallbackData('email', orderId) },
    ],
    [{ text: 'Cancel Order', callback_data: getOrderActionCallbackData('cancel', orderId) }],
    [
      {
        text: 'Open Order',
        url: `${config.adminDashboardUrl}/orders?orderId=${encodeURIComponent(orderId)}`,
      },
    ],
    [
      { text: 'Orders Queue', url: `${config.adminDashboardUrl}/orders` },
      {
        text: 'Payment Page',
        url: `${config.storefrontUrl}/checkout/${encodeURIComponent(orderId)}`,
      },
    ],
  ],
});

const sendOrderNotification = async ({ order, paymentMethodName, recipients }) => {
  const orderId = String(order._id);
  const text = buildOrderMessage({ order, paymentMethodName });
  const replyMarkup = buildOrderKeyboard(orderId);

  const deliveryResults = [];

  for (const chatId of recipients) {
    try {
      const result = await telegramRequest('sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: replyMarkup,
      });

      deliveryResults.push({ chatId, messageId: result?.message_id, ok: true });
    } catch (error) {
      deliveryResults.push({ chatId, ok: false, error: error.message });
      console.error(`[telegram-worker] Failed to send order ${orderId} to ${chatId}: ${error.message}`);
    }
  }

  const delivered = deliveryResults.filter((entry) => entry.ok);

  return {
    ok: delivered.length > 0,
    delivered,
    failed: deliveryResults.filter((entry) => !entry.ok),
  };
};

const handleStatusCommand = async (message) => {
  const chatId = message?.chat?.id;
  if (!chatId) return;

  const lines = [
    '*Worker Status*',
    `Started: ${stats.startedAt.toISOString()}`,
    `Orders scanned: ${stats.ordersScanned}`,
    `Orders notified: ${stats.ordersSent}`,
    `Callbacks handled: ${stats.callbacksHandled}`,
    `Callback errors: ${stats.callbackErrors}`,
    `Last order scan: ${stats.lastOrderScanAt ? stats.lastOrderScanAt.toISOString() : '-'}`,
    `Last order sent: ${stats.lastOrderSentAt ? stats.lastOrderSentAt.toISOString() : '-'}`,
    `Last callback: ${stats.lastCallbackAt ? stats.lastCallbackAt.toISOString() : '-'}`,
  ];

  await telegramRequest('sendMessage', {
    chat_id: chatId,
    text: lines.join('\n'),
    parse_mode: 'Markdown',
  });
};

const handleStartCommand = async ({ message, subscribersCollection }) => {
  const chatId = message?.chat?.id;
  if (!chatId) return;

  await upsertSubscriber(subscribersCollection, {
    chatId,
    username: message?.from?.username,
    firstName: message?.from?.first_name,
    lastName: message?.from?.last_name,
  });

  const botUsername = env('TELEGRAM_BOT_USERNAME', '');
  const base =
    'Subscribed. You will receive order notifications if your Telegram username is configured in admin settings.';
  const hint = botUsername ? `\n\nBot: @${normalizeUsername(botUsername)}` : '';

  await telegramRequest('sendMessage', {
    chat_id: chatId,
    text: `${base}${hint}`,
  });
};

const handleCallbackQuery = async (callbackQuery) => {
  const callbackId = callbackQuery?.id;
  const chatId = callbackQuery?.message?.chat?.id;
  const parsed = parseOrderActionCallbackData(callbackQuery?.data);

  if (!callbackId) return;

  if (!parsed) {
    await telegramRequest('answerCallbackQuery', {
      callback_query_id: callbackId,
      text: 'Unsupported action payload.',
      show_alert: true,
    });
    return;
  }

  const result = await callAdminOrderAction(parsed);

  await telegramRequest('answerCallbackQuery', {
    callback_query_id: callbackId,
    text: result.ok ? 'Action completed.' : 'Action failed.',
    show_alert: !result.ok,
  });

  if (chatId) {
    const prefix = result.ok ? '✅' : '❌';
    await telegramRequest('sendMessage', {
      chat_id: chatId,
      text: `${prefix} #${parsed.orderId} • ${ACTION_TO_LABEL[parsed.action]}: ${result.message}`,
    });
  }

  stats.callbacksHandled += 1;
  stats.lastCallbackAt = new Date();
};

const handleUpdate = async (update, subscribersCollection) => {
  if (update?.message?.text) {
    const text = String(update.message.text || '').trim();

    if (text.startsWith('/start')) {
      await handleStartCommand({ message: update.message, subscribersCollection });
      return;
    }

    if (text.startsWith('/status')) {
      await handleStatusCommand(update.message);
      return;
    }
  }

  if (update?.callback_query) {
    try {
      await handleCallbackQuery(update.callback_query);
    } catch (error) {
      stats.callbackErrors += 1;
      console.error(`[telegram-worker] callback handler failed: ${error.message}`);

      if (update.callback_query?.id) {
        try {
          await telegramRequest('answerCallbackQuery', {
            callback_query_id: update.callback_query.id,
            text: 'Action failed. Check worker logs.',
            show_alert: true,
          });
        } catch (ackError) {
          console.error(
            `[telegram-worker] callback error acknowledgement failed: ${ackError.message}`
          );
        }
      }
    }
  }
};

const getPaymentMethodNameMap = async (paymentMethodsCollection) => {
  const methods = await paymentMethodsCollection.find({}, { projection: { name: 1 } }).toArray();
  const map = new Map();

  methods.forEach((item) => {
    map.set(String(item?._id), item?.name || 'Manual');
  });

  return map;
};

const buildOrderQuery = ({ cursorCreatedAt, cursorOrderId }) => {
  const query = {};

  if (cursorCreatedAt && cursorOrderId) {
    const objectId = tryParseObjectId(cursorOrderId);
    if (objectId) {
      query.$or = [
        { createdAt: { $gt: cursorCreatedAt } },
        { createdAt: cursorCreatedAt, _id: { $gt: objectId } },
      ];
    } else {
      query.createdAt = { $gt: cursorCreatedAt };
    }
  } else if (cursorCreatedAt) {
    query.createdAt = { $gte: cursorCreatedAt };
  }

  if (config.onlyPendingOrders) {
    query.status = { $in: ['Waiting for payment', 'Order processing'] };
  }

  return query;
};

const loadCursorState = async (stateCollection) => {
  const doc = await stateCollection.findOne({ _id: ORDER_CURSOR_DOC_ID });
  if (doc?.cursorCreatedAt && doc?.cursorOrderId) {
    return {
      cursorCreatedAt: new Date(doc.cursorCreatedAt),
      cursorOrderId: String(doc.cursorOrderId),
    };
  }

  return {
    cursorCreatedAt: new Date(Date.now() - config.lookbackMinutes * 60 * 1000),
    cursorOrderId: null,
  };
};

const saveCursorState = async (stateCollection, cursor) => {
  await stateCollection.updateOne(
    { _id: ORDER_CURSOR_DOC_ID },
    {
      $set: {
        cursorCreatedAt: cursor.cursorCreatedAt,
        cursorOrderId: cursor.cursorOrderId || null,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
};

const tryParseObjectId = (value) => {
  try {
    return new ObjectId(value);
  } catch (error) {
    return null;
  }
};

const retryFailedNotifications = async ({
  notifyCollection,
  ordersCollection,
  paymentMethodsCollection,
  settingsCollection,
  subscribersCollection,
}) => {
  const cutoff = new Date(Date.now() - config.failedRetryBackoffMs);
  const failedRecords = await notifyCollection
    .find({
      status: 'failed',
      attempts: { $lt: config.failedRetryMaxAttempts },
      $or: [{ lastAttemptAt: { $lte: cutoff } }, { lastAttemptAt: { $exists: false } }],
    })
    .sort({ lastAttemptAt: 1, createdAt: 1 })
    .limit(config.failedRetryLimit)
    .toArray();

  if (failedRecords.length === 0) {
    return;
  }

  const recipients = await resolveTelegramRecipients({ settingsCollection, subscribersCollection });
  if (recipients.length === 0) {
    console.warn('[telegram-worker] No Telegram recipients configured for retries.');
    return;
  }

  const paymentMethods = await getPaymentMethodNameMap(paymentMethodsCollection);

  for (const record of failedRecords) {
    const orderObjectId = tryParseObjectId(record?.orderId);
    if (!orderObjectId) {
      continue;
    }

    const order = await ordersCollection.findOne({ _id: orderObjectId });
    if (!order) {
      await notifyCollection.updateOne(
        { _id: record._id },
        {
          $set: { status: 'missing', updatedAt: new Date() },
          $inc: { attempts: 1 },
        }
      );
      continue;
    }

    const paymentMethodName = paymentMethods.get(String(order?.paymentMethod || '')) || 'Manual';
    const result = await sendOrderNotification({
      order,
      paymentMethodName,
      recipients,
    });

    const now = new Date();
    if (result.ok) {
      await notifyCollection.updateOne(
        { _id: record._id },
        {
          $set: {
            status: 'sent',
            sentAt: now,
            recipients,
            delivered: result.delivered,
            failed: result.failed,
            orderStatus: order?.status || '',
            updatedAt: now,
          },
        }
      );
      stats.ordersSent += 1;
      stats.lastOrderSentAt = now;
      console.log(`[telegram-worker] Retry succeeded for order ${record.orderId}`);
    } else {
      await notifyCollection.updateOne(
        { _id: record._id },
        {
          $set: {
            status: 'failed',
            lastAttemptAt: now,
            recipients,
            failed: result.failed,
            orderStatus: order?.status || '',
            updatedAt: now,
          },
          $inc: { attempts: 1 },
        }
      );
      console.error(`[telegram-worker] Retry failed for order ${record.orderId}`);
    }
  }
};

const runOrderScan = async ({
  ordersCollection,
  paymentMethodsCollection,
  settingsCollection,
  subscribersCollection,
  notifyCollection,
  stateCollection,
  cursor,
}) => {
  const query = buildOrderQuery(cursor);
  const orders = await ordersCollection
    .find(query)
    .sort({ createdAt: 1, _id: 1 })
    .limit(config.batchLimit)
    .toArray();

  if (orders.length === 0) {
    return cursor;
  }

  stats.ordersScanned += orders.length;
  const recipients = await resolveTelegramRecipients({ settingsCollection, subscribersCollection });

  if (recipients.length === 0) {
    console.warn('[telegram-worker] No Telegram recipients configured.');
    return cursor;
  }

  const paymentMethods = await getPaymentMethodNameMap(paymentMethodsCollection);
  let nextCursor = { ...cursor };

  for (const order of orders) {
    const orderId = String(order._id);
    nextCursor = {
      cursorCreatedAt: new Date(order.createdAt || new Date()),
      cursorOrderId: orderId,
    };

    const existing = await notifyCollection.findOne({ orderId });
    if (existing?.status === 'sent') {
      continue;
    }

    const paymentMethodName = paymentMethods.get(String(order?.paymentMethod || '')) || 'Manual';

    const result = await sendOrderNotification({
      order,
      paymentMethodName,
      recipients,
    });

    const now = new Date();

    if (result.ok) {
      await notifyCollection.updateOne(
        { orderId },
        {
          $set: {
            orderId,
            status: 'sent',
            sentAt: now,
            recipients,
            delivered: result.delivered,
            failed: result.failed,
            orderCreatedAt: order?.createdAt || null,
            orderStatus: order?.status || '',
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true }
      );

      stats.ordersSent += 1;
      stats.lastOrderSentAt = now;
      console.log(`[telegram-worker] Notified order ${orderId}`);
    } else {
      await notifyCollection.updateOne(
        { orderId },
        {
          $set: {
            orderId,
            status: 'failed',
            lastAttemptAt: now,
            recipients,
            failed: result.failed,
            orderCreatedAt: order?.createdAt || null,
            orderStatus: order?.status || '',
            updatedAt: now,
          },
          $inc: {
            attempts: 1,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true }
      );

      console.error(`[telegram-worker] Notification failed for order ${orderId}`);
    }
  }

  await saveCursorState(stateCollection, nextCursor);
  return nextCursor;
};

const startOrderLoop = async (collections) => {
  let cursor = await loadCursorState(collections.stateCollection);
  console.log(
    `[telegram-worker] Order cursor from ${cursor.cursorCreatedAt.toISOString()} (${cursor.cursorOrderId || 'start'})`
  );

  while (!shuttingDown) {
    try {
      cursor = await runOrderScan({ ...collections, cursor });
      await retryFailedNotifications(collections);
      stats.lastOrderScanAt = new Date();
    } catch (error) {
      console.error(`[telegram-worker] Order scan failed: ${error.message}`);
    }

    await sleep(config.pollIntervalMs);
  }
};

const startUpdatesLoop = async (subscribersCollection) => {
  while (!shuttingDown) {
    try {
      const updates = await telegramRequest('getUpdates', {
        offset: telegramOffset,
        timeout: config.updateTimeoutSec,
        allowed_updates: ['message', 'callback_query'],
      });

      if (!Array.isArray(updates) || updates.length === 0) {
        await sleep(config.updatesIdleDelayMs);
        continue;
      }

      for (const update of updates) {
        telegramOffset = Math.max(telegramOffset, Number(update.update_id || 0) + 1);
        await handleUpdate(update, subscribersCollection);
      }
    } catch (error) {
      const status = Number(error?.status || 0);
      const description = error?.responseBody?.description || error.message;

      if (status === 409) {
        console.error(
          '[telegram-worker] Telegram getUpdates conflict (webhook active). Set TELEGRAM_DELETE_WEBHOOK_ON_START=true or remove webhook.'
        );
      } else {
        console.error(`[telegram-worker] getUpdates failed: ${description}`);
      }

      await sleep(2000);
    }
  }
};

const main = async () => {
  console.log('[telegram-worker] Starting Bun worker...');

  const client = new MongoClient(config.mongoUri);
  await client.connect();

  const db = client.db();
  const ordersCollection = db.collection(config.ordersCollection);
  const paymentMethodsCollection = db.collection(config.paymentMethodsCollection);
  const settingsCollection = db.collection(config.settingsCollection);
  const subscribersCollection = db.collection(config.subscribersCollection);
  const notifyCollection = db.collection(config.notifyCollection);
  const stateCollection = db.collection(config.stateCollection);

  await notifyCollection.createIndex({ orderId: 1 }, { unique: true });
  await notifyCollection.createIndex({ sentAt: -1 });
  await notifyCollection.createIndex({ status: 1, lastAttemptAt: 1, attempts: 1 });
  await stateCollection.createIndex({ updatedAt: -1 });

  if (config.enableUpdatePolling && config.deleteWebhookOnStart) {
    try {
      await telegramRequest('deleteWebhook', { drop_pending_updates: false });
      console.log('[telegram-worker] Existing Telegram webhook deleted for polling mode.');
    } catch (error) {
      console.error(`[telegram-worker] deleteWebhook failed: ${error.message}`);
    }
  }

  try {
    const me = await telegramRequest('getMe');
    console.log(
      `[telegram-worker] Connected as @${me?.username || 'unknown'} | polling every ${config.pollIntervalMs}ms`
    );
  } catch (error) {
    console.error(`[telegram-worker] getMe failed: ${error.message}`);
  }

  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[telegram-worker] Received ${signal}. Shutting down...`);
    try {
      await client.close();
    } catch (error) {
      console.error(`[telegram-worker] Mongo close failed: ${error.message}`);
    }
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  const tasks = [
    startOrderLoop({
      ordersCollection,
      paymentMethodsCollection,
      settingsCollection,
      subscribersCollection,
      notifyCollection,
      stateCollection,
    }),
  ];

  if (config.enableUpdatePolling) {
    tasks.push(startUpdatesLoop(subscribersCollection));
    console.log('[telegram-worker] Telegram update polling is enabled.');
  } else {
    console.log(
      '[telegram-worker] Telegram update polling is disabled (webhook mode expected for commands/callbacks).'
    );
  }

  await Promise.all(tasks);
};

main().catch((error) => {
  console.error('[telegram-worker] Fatal error:', error);
  process.exit(1);
});
