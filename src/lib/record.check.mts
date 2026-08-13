// Server rules: who may do what, and what clients may read. Run with `npm test`.
import assert from 'node:assert/strict';
import { actionError, initial, reducer, visibleTo } from './record';

const s = initial();
assert.equal(actionError(s, { type: 'move', taskId: 't5', to: 'progress' }, 'morgan'), 'Clients can’t move cards.');
assert.match(actionError(s, { type: 'move', taskId: 't5', to: 'done' }, 'alex')!, /hasn’t approved/);
assert.equal(actionError(s, { type: 'invoice', id: 'INV-2026-041', state: 'sent' }, 'taylor'), 'Only the owner can send invoices or mark them paid.');
assert.equal(actionError(s, { type: 'invoice', id: 'INV-2026-041', state: 'sent' }, 'alex'), null);
assert.match(actionError(s, { type: 'invoice', id: 'INV-2026-041', state: 'paid' }, 'alex')!, /can’t move/);
assert.match(actionError(s, { type: 'approve', deliverableId: 'd-luma-v2' }, 'morgan')!, /Only the client/);
assert.match(actionError(s, { type: 'approve', deliverableId: 'd-atlas-v3' }, 'jamie')!, /Only the client/);
assert.equal(actionError(s, { type: 'approve', deliverableId: 'd-atlas-v3' }, 'morgan'), null);
assert.equal(actionError(s, { type: 'changes', deliverableId: 'd-atlas-v3', note: ' ' }, 'morgan'), 'Say what should change.');
assert.equal(actionError(s, { type: 'persona', id: 'alex' }, 'morgan'), 'Not an action the server takes.');

const after = reducer({ ...s, persona: 'morgan' }, { type: 'approve', deliverableId: 'd-atlas-v3' });
const seen = visibleTo(after, 'morgan');
assert.ok(seen.tasks.every((t) => t.projectId === 'atlas' && t.comments.every((c) => c.shared)));
assert.ok(seen.invoices.every((i) => i.projectId === 'atlas' && i.state !== 'draft'));
assert.ok(after.invoices.some((i) => i.projectId === 'atlas' && i.state === 'draft'), 'approval drafts an invoice');
assert.equal(visibleTo(after, 'alex').tasks.length, after.tasks.length);
console.log('record: all checks pass');
