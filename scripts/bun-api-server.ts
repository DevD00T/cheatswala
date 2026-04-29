import { MongoClient, type Collection, type Db } from 'mongodb';

type SessionRecord = {
  _id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  meta: Record<string, unknown>;
};

type PostRecord = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

type SocketData = {
  sessionId: string | null;
  userId: string | null;
};

const apiPort = Number(Bun.env.BUN_API_PORT || 4010);
const mongoUri = String(Bun.env.MONGODB_URI || '').trim();
const sessionCookieName = String(Bun.env.BUN_SESSION_COOKIE_NAME || 'cw_session').trim();
const sessionTtlSeconds = Number(Bun.env.BUN_SESSION_TTL_SECONDS || 60 * 60 * 24 * 7);

const posts = new Map<string, PostRecord>();
const memorySessions = new Map<string, SessionRecord>();

let dbPromise: Promise<Db | null> | null = null;

const json = (payload: unknown, status = 200, headers?: HeadersInit) => {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...headers,
    },
  });
};

const parseJson = async (req: Request): Promise<Record<string, unknown> | null> => {
  try {
    const parsed = (await req.json()) as Record<string, unknown>;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    return null;
  }
};

const getDb = async (): Promise<Db | null> => {
  if (!mongoUri) {
    return null;
  }

  if (!dbPromise) {
    dbPromise = (async () => {
      const client = new MongoClient(mongoUri);
      await client.connect();
      return client.db();
    })().catch((error) => {
      dbPromise = null;
      console.error('[bun-api] MongoDB connection failed:', error);
      return null;
    });
  }

  return dbPromise;
};

const getSessionCollection = async (): Promise<Collection<SessionRecord> | null> => {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const collection = db.collection<SessionRecord>('bun_sessions');
  await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  return collection;
};

const saveSession = async (session: SessionRecord): Promise<void> => {
  const collection = await getSessionCollection();
  if (collection) {
    await collection.updateOne({ _id: session._id }, { $set: session }, { upsert: true });
    return;
  }

  memorySessions.set(session._id, session);
};

const readSession = async (sessionId: string): Promise<SessionRecord | null> => {
  const collection = await getSessionCollection();

  if (collection) {
    const session = await collection.findOne({ _id: sessionId });
    if (!session) {
      return null;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await collection.deleteOne({ _id: sessionId });
      return null;
    }

    return session;
  }

  const session = memorySessions.get(sessionId);
  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    memorySessions.delete(sessionId);
    return null;
  }

  return session;
};

const deleteSession = async (sessionId: string): Promise<void> => {
  const collection = await getSessionCollection();
  if (collection) {
    await collection.deleteOne({ _id: sessionId });
    return;
  }

  memorySessions.delete(sessionId);
};

const withCookie = (response: Response, cookie: string): Response => {
  const headers = new Headers(response.headers);
  headers.append('set-cookie', cookie);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

const buildCookie = (name: string, value: string, maxAge: number): string => {
  const secure = Bun.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
};

const websocketError = () => json({ ok: false, message: 'WebSocket upgrade failed' }, 500);

const server = Bun.serve<SocketData>({
  port: apiPort,
  routes: {
    '/api/status': () =>
      json({
        ok: true,
        runtime: 'bun',
        serverTime: new Date().toISOString(),
      }),

    '/users/:id': (req) =>
      json({
        message: `Hello User ${req.params.id}!`,
        userId: req.params.id,
      }),

    '/api/posts': {
      GET: () => json({ posts: Array.from(posts.values()) }),
      POST: async (req) => {
        const body = await parseJson(req);
        const title = String(body?.title || '').trim();
        const content = String(body?.content || '').trim();

        if (!title || !content) {
          return json({ ok: false, message: 'title and content are required' }, 400);
        }

        const post: PostRecord = {
          id: Bun.randomUUIDv7(),
          title,
          content,
          createdAt: new Date().toISOString(),
        };
        posts.set(post.id, post);

        return json({ created: true, post }, 201);
      },
    },

    '/api/posts/:id': (req) => {
      const post = posts.get(req.params.id);
      if (!post) {
        return json({ ok: false, message: 'Post not found' }, 404);
      }

      return json({ post });
    },

    '/api/auth/password/hash': {
      POST: async (req) => {
        const body = await parseJson(req);
        const password = String(body?.password || '');
        if (!password) {
          return json({ ok: false, message: 'password is required' }, 400);
        }

        const hash = await Bun.password.hash(password, {
          algorithm: 'argon2id',
          memoryCost: 65536,
          timeCost: 2,
        });

        // UUIDv7 is for sortable unique IDs (session/token tracking), not password hashing.
        const hashRef = Bun.randomUUIDv7();

        return json({ ok: true, hash, hashRef });
      },
    },

    '/api/auth/password/verify': {
      POST: async (req) => {
        const body = await parseJson(req);
        const password = String(body?.password || '');
        const hash = String(body?.hash || '');

        if (!password || !hash) {
          return json({ ok: false, message: 'password and hash are required' }, 400);
        }

        const valid = await Bun.password.verify(password, hash);
        return json({ ok: true, valid });
      },
    },

    '/api/session/start': {
      POST: async (req) => {
        const body = await parseJson(req);
        const userId = String(body?.userId || '').trim();
        const theme = String(body?.theme || 'light').trim() || 'light';

        if (!userId) {
          return json({ ok: false, message: 'userId is required' }, 400);
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + sessionTtlSeconds * 1000);
        const sessionId = Bun.randomUUIDv7();

        await saveSession({
          _id: sessionId,
          userId,
          createdAt: now,
          expiresAt,
          meta: { theme },
        });

        const sessionCookie = buildCookie(sessionCookieName, sessionId, sessionTtlSeconds);
        const themeCookie = buildCookie('theme', theme, sessionTtlSeconds);

        const response = json({
          ok: true,
          sessionId,
          userId,
          expiresAt: expiresAt.toISOString(),
        });

        return withCookie(withCookie(response, sessionCookie), themeCookie);
      },
    },

    '/api/session/end': {
      POST: async (req) => {
        const sessionId = req.cookies.get(sessionCookieName);
        if (sessionId) {
          await deleteSession(sessionId);
        }

        const expireCookie = `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
        return withCookie(json({ ok: true }), expireCookie);
      },
    },

    '/profile': async (req) => {
      const theme = req.cookies.get('theme') || 'light';
      const sessionId = req.cookies.get(sessionCookieName);

      if (!sessionId) {
        return json({ userId: null, theme, message: 'No active session' }, 401);
      }

      const session = await readSession(sessionId);
      if (!session) {
        return json({ userId: null, theme, message: 'Session expired or not found' }, 401);
      }

      return json({
        userId: session.userId,
        theme,
        message: 'Profile page',
      });
    },

    '/api/metrics': () =>
      json({
        pendingRequests: server.pendingRequests,
        pendingWebSockets: server.pendingWebSockets,
        chatSubscribers: server.subscriberCount('chat'),
      }),

    '/api/*': () => json({ message: 'Not found' }, 404),

    '/blog/hello': Response.redirect('/blog/hello/world', 302),

    '/favicon.ico': new Response(Bun.file('./public/favicon.ico')),
  },

  fetch(req, serverInstance) {
    const url = new URL(req.url);

    if (url.pathname === '/ws') {
      const cookies = new Bun.CookieMap(req.headers.get('cookie') || '');
      const sessionId = cookies.get(sessionCookieName);

      serverInstance.upgrade(req, {
        data: {
          sessionId,
          userId: null,
        },
      });
      return undefined;
    }

    return new Response('Not Found', { status: 404 });
  },

  websocket: {
    open(ws) {
      ws.subscribe('chat');
      ws.send(JSON.stringify({ type: 'welcome', message: 'WebSocket connected' }));
    },

    async message(ws, message) {
      let payload: Record<string, unknown> = {};

      try {
        payload = JSON.parse(String(message));
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON payload' }));
        return;
      }

      const sessionId = ws.data.sessionId;
      const session = sessionId ? await readSession(sessionId) : null;
      const userId = session?.userId || 'anonymous';

      const outgoing = {
        type: 'message',
        from: userId,
        data: payload,
        at: new Date().toISOString(),
      };

      server.publish('chat', JSON.stringify(outgoing));
    },

    close(ws) {
      ws.unsubscribe('chat');
    },
  },

  error(error) {
    console.error('[bun-api] server error:', error);
    return json({ ok: false, message: 'Internal Server Error' }, 500);
  },
});

console.log(`Bun API server running at ${server.url}`);
