// The record and its rules: one reducer, run in the browser for instant feedback and on the server as
// the source of truth (src/payload/orbit.ts). No React here, so both sides can import it.
import * as seed from './data';
import type { Activity, Deliverable, Invoice, InvoiceState, Status, Task } from './data';
import { addDays, first, person } from './format';

export type State = {
  tasks: Task[];
  deliverables: Deliverable[];
  invoices: Invoice[];
  activity: Activity[];
  persona: string;
  clock: number;
};

export const initial = (): State => ({
  tasks: structuredClone(seed.tasks),
  deliverables: structuredClone(seed.deliverables),
  invoices: structuredClone(seed.invoices),
  activity: structuredClone(seed.activity),
  persona: 'alex',
  clock: 0,
});

export type Action =
  | { type: 'move'; taskId: string; to: Status }
  | { type: 'approve'; deliverableId: string }
  | { type: 'changes'; deliverableId: string; note: string }
  | { type: 'comment'; taskId: string; text: string }
  | { type: 'invoice'; id: string; state: InvoiceState }
  | { type: 'persona'; id: string }
  | { type: 'reset' }
  | { type: 'load'; state: State };

// Demo clock: the day is fixed to DEMO_TODAY, minutes tick forward so each action gets its own time.
const stamp = (s: State) => {
  const m = 9 * 60 + 30 + s.clock * 7;
  return `${seed.DEMO_TODAY}T${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

export const statusName: Record<Status, string> = { todo: 'to do', progress: 'in progress', review: 'client review', done: 'done' };

/** Returns why a move is not allowed, or null. The same rule a server would enforce. */
export function moveError(s: State, taskId: string, to: Status): string | null {
  const task = s.tasks.find((t) => t.id === taskId);
  if (!task || task.status === to) return null;
  const role = person(s.persona).role;
  if (role === 'client') return 'Clients can’t move cards.';
  if (role === 'member' && task.assignee !== s.persona) return 'Members can only move their own tasks.';
  const del = task.deliverableId && s.deliverables.find((d) => d.id === task.deliverableId);
  if (del && to === 'done' && del.state !== 'approved') {
    const client = seed.clients.find((c) => c.id === seed.projects.find((p) => p.id === task.projectId)!.clientId)!;
    return `${first(client.contactId)} hasn’t approved this yet, so it can’t be done.`;
  }
  return null;
}

function log(s: State, who: string, text: string, projectId: string): Activity[] {
  return [{ id: `a${Date.now()}${s.clock}`, at: stamp(s), who, text, projectId }, ...s.activity];
}

export function reducer(s: State, a: Action): State {
  const tick = { ...s, clock: s.clock + 1 };
  switch (a.type) {
    case 'load': return a.state;
    case 'reset': return { ...initial(), persona: s.persona };
    case 'persona': return { ...s, persona: a.id };
    case 'move': {
      if (moveError(s, a.taskId, a.to)) return s;
      const task = s.tasks.find((t) => t.id === a.taskId)!;
      return {
        ...tick,
        tasks: s.tasks.map((t) => (t.id === a.taskId ? { ...t, status: a.to } : t)),
        activity: log(s, s.persona, `moved ${task.title} to ${statusName[a.to]}`, task.projectId),
      };
    }
    case 'comment':
      return {
        ...tick,
        tasks: s.tasks.map((t) => t.id === a.taskId
          ? { ...t, comments: [...t.comments, { id: `c${Date.now()}`, by: s.persona, at: stamp(s), text: a.text }] }
          : t),
      };
    case 'approve': {
      const del = s.deliverables.find((d) => d.id === a.deliverableId);
      if (!del || del.state === 'approved') return s;
      const project = seed.projects.find((p) => p.id === del.projectId)!;
      const client = seed.clients.find((c) => c.id === project.clientId)!;
      const by = client.contactId;
      const draft = s.invoices.find((i) => i.projectId === project.id && i.state === 'draft');
      const nextNo = Math.max(...s.invoices.map((i) => Number(i.id.slice(-3)))) + 1;
      const invoices = draft
        ? s.invoices.map((i) => (i === draft ? { ...i, lines: [...i.lines, ...del.invoiceLines] } : i))
        : [...s.invoices, { id: `INV-2026-${String(nextNo).padStart(3, '0')}`, clientId: client.id, projectId: project.id, state: 'draft' as const, lines: del.invoiceLines }];
      return {
        ...tick,
        deliverables: s.deliverables.map((d) => d.id === del.id
          ? { ...d, state: 'approved', history: [...d.history, { version: d.version, state: 'approved', at: stamp(s), by }] }
          : d),
        tasks: s.tasks.map((t) => (t.id === del.taskId ? { ...t, status: 'done' } : t)),
        invoices,
        activity: log(s, by, `approved ${del.title} v${del.version}. Invoice lines drafted.`, project.id),
      };
    }
    case 'changes': {
      const del = s.deliverables.find((d) => d.id === a.deliverableId);
      if (!del) return s;
      const project = seed.projects.find((p) => p.id === del.projectId)!;
      const by = seed.clients.find((c) => c.id === project.clientId)!.contactId;
      return {
        ...tick,
        deliverables: s.deliverables.map((d) => d.id === del.id
          ? { ...d, state: 'changes', history: [...d.history, { version: d.version, state: 'changes', at: stamp(s), by, note: a.note }] }
          : d),
        tasks: s.tasks.map((t) => t.id === del.taskId
          ? { ...t, status: 'progress', comments: [...t.comments, { id: `c${Date.now()}`, by, at: stamp(s), text: a.note, shared: true }] }
          : t),
        activity: log(s, by, `asked for changes on ${del.title} v${del.version}`, project.id),
      };
    }
    case 'invoice': {
      const inv = s.invoices.find((i) => i.id === a.id)!;
      const terms = seed.clients.find((c) => c.id === inv.clientId)!.terms;
      const patch: Partial<Invoice> =
        a.state === 'sent' ? { issued: seed.DEMO_TODAY, due: addDays(seed.DEMO_TODAY, terms) }
        : a.state === 'paid' ? { paidOn: seed.DEMO_TODAY, method: 'Interac e-Transfer' } : {};
      return {
        ...tick,
        invoices: s.invoices.map((i) => (i.id === a.id ? { ...i, ...patch, state: a.state } : i)),
        activity: log(s, s.persona, `marked ${inv.id} as ${a.state}`, inv.projectId),
      };
    }
  }
}

// Derived values, computed from the records (the "how is this counted?" rules).
export const progress = (s: State, projectId: string) => {
  const ts = s.tasks.filter((t) => t.projectId === projectId);
  return ts.length ? Math.round((ts.filter((t) => t.status === 'done').length / ts.length) * 100) : 0;
};
export const isOverdue = (i: Invoice) => i.state === 'sent' && !!i.due && i.due < seed.DEMO_TODAY;

const clientOf = (projectId: string) => seed.projects.find((p) => p.id === projectId)!.clientId;

/** Server-side check for every action, run as the signed-in person. Returns why it is refused, or null. */
export function actionError(s: State, a: Action, who: string): string | null {
  const me = person(who);
  const own = (projectId: string) => me.role !== 'client' || me.clientId === clientOf(projectId);
  switch (a.type) {
    case 'move': return moveError({ ...s, persona: who }, a.taskId, a.to);
    case 'comment': {
      const t = s.tasks.find((x) => x.id === a.taskId);
      if (!t || !own(t.projectId)) return 'That task isn’t yours to comment on.';
      return a.text.trim() ? null : 'Write a comment first.';
    }
    case 'approve':
    case 'changes': {
      const d = s.deliverables.find((x) => x.id === a.deliverableId);
      if (!d) return 'That deliverable doesn’t exist.';
      if (me.role === 'member' || !own(d.projectId)) return 'Only the client or the studio leads can decide on this.';
      if (a.type === 'changes' && !a.note.trim()) return 'Say what should change.';
      return null;
    }
    case 'invoice': {
      if (me.role !== 'owner') return 'Only the owner can send invoices or mark them paid.';
      const i = s.invoices.find((x) => x.id === a.id);
      const from: Record<InvoiceState, InvoiceState[]> = { draft: [], sent: ['draft'], paid: ['sent'], void: ['draft', 'sent'] };
      return i && from[a.state].includes(i.state) ? null : 'That invoice can’t move to that state.';
    }
    case 'reset': return null;
    default: return 'Not an action the server takes.';
  }
}

/** What a person may read. Clients see their own projects, shared comments only, and no drafts. */
export function visibleTo(s: State, who: string): State {
  const me = person(who);
  if (me.role !== 'client') return { ...s, persona: who };
  const mine = (projectId: string) => clientOf(projectId) === me.clientId;
  return {
    ...s,
    persona: who,
    tasks: s.tasks.filter((t) => mine(t.projectId)).map((t) => ({ ...t, comments: t.comments.filter((c) => c.shared) })),
    deliverables: s.deliverables.filter((d) => mine(d.projectId)),
    invoices: s.invoices.filter((i) => mine(i.projectId) && i.state !== 'draft'),
    activity: s.activity.filter((x) => mine(x.projectId)),
  };
}
