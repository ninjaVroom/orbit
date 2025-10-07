// The server side of the record. Loads it from Postgres, runs actions through the shared reducer
// after the server-side rules, writes back only the documents that changed, and seeds a fresh database.
import type { Endpoint, Payload, PayloadRequest } from 'payload';
import * as seed from '@/lib/data';
import { actionError, initial, reducer, visibleTo, type Action, type State } from '@/lib/record';

const kinds = ['tasks', 'deliverables', 'invoices', 'activity'] as const;
type Kind = (typeof kinds)[number];

// Payload adds timestamps and returns null for empty fields; the record uses undefined.
const clean = (doc: Record<string, unknown>) => {
  const { createdAt, updatedAt, ...rest } = doc;
  return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== null));
};

async function load(payload: Payload): Promise<State> {
  const out = {} as Record<Kind, unknown[]>;
  for (const k of kinds) {
    // Activity is a feed, newest first; everything else keeps the order it was created in.
    const res = await payload.find({ collection: k, pagination: false, depth: 0, sort: k === 'activity' ? '-createdAt' : 'createdAt' });
    out[k] = res.docs.map((d) => clean(d as unknown as Record<string, unknown>));
  }
  const s = { ...initial(), ...(out as unknown as Pick<State, Kind>) };
  // The demo clock only moves forward: one tick per logged event or comment.
  s.clock = s.activity.length + s.tasks.reduce((n, t) => n + t.comments.length, 0);
  return s;
}

async function save(payload: Payload, before: State, after: State) {
  for (const k of kinds) {
    const old = new Map((before[k] as { id: string }[]).map((d) => [d.id, JSON.stringify(d)]));
    for (const doc of after[k] as { id: string }[]) {
      const prev = old.get(doc.id);
      if (prev === undefined) await payload.create({ collection: k, data: doc as never });
      else if (prev !== JSON.stringify(doc)) await payload.update({ collection: k, id: doc.id, data: doc as never });
    }
  }
}

async function reseed(payload: Payload) {
  for (const k of kinds) await payload.delete({ collection: k, where: { id: { exists: true } } });
  const s = initial();
  for (const k of kinds) {
    const docs = k === 'activity' ? [...s[k]].reverse() : s[k]; // oldest event first, so newest has the latest createdAt
    for (const doc of docs) await payload.create({ collection: k, data: doc as never });
  }
}

export async function seedIfEmpty(payload: Payload) {
  if ((await payload.count({ collection: 'users' })).totalDocs === 0) {
    for (const p of seed.people) {
      await payload.create({
        collection: 'users',
        data: { email: seed.demoEmail(p.id), password: seed.DEMO_PASSWORD, personId: p.id, name: p.name, role: p.role },
      });
    }
  }
  if ((await payload.count({ collection: 'tasks' })).totalDocs === 0) await reseed(payload);
}

const who = (req: PayloadRequest) => (req.user as { personId?: string } | null)?.personId;
const fail = (status: number, error: string) => Response.json({ error }, { status });

// actions run one at a time in this process. Fine for one server; use row locks or a
// transaction per action if this ever runs on several instances.
let queue: Promise<unknown> = Promise.resolve();

export const endpoints: Endpoint[] = [
  {
    path: '/orbit/state',
    method: 'get',
    handler: async (req) => {
      const me = who(req);
      if (!me) return fail(401, 'Sign in first.');
      return Response.json(visibleTo(await load(req.payload), me));
    },
  },
  {
    path: '/orbit/action',
    method: 'post',
    handler: async (req) => {
      const me = who(req);
      if (!me) return fail(401, 'Sign in first.');
      const action = (await req.json?.()) as Action | undefined;
      if (!action || typeof action.type !== 'string') return fail(400, 'Send an action.');
      const run = queue.then(async () => {
        const before = await load(req.payload);
        const error = actionError(before, action, me);
        if (error) return fail(403, error);
        if (action.type === 'reset') await reseed(req.payload);
        else await save(req.payload, before, reducer({ ...before, persona: me }, action));
        return Response.json(visibleTo(await load(req.payload), me));
      });
      queue = run.catch(() => undefined);
      return run;
    },
  },
];
