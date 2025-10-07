'use client';
// The signature: one Atlas deliverable as the agency's card and as Morgan's portal row.
// Approve in the portal and the board, the waiting count and the invoice all change, from one record.
import Link from 'next/link';
import { money } from '@/lib/format';
import { useStore } from '@/lib/store';
import { Avatar, PriorityPill, Tween, useToast } from './ui';

const cols = [
  { key: 'progress', label: 'in progress' },
  { key: 'review', label: 'client review' },
  { key: 'done', label: 'done' },
] as const;

export function SyncDemo() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const del = state.deliverables.find((d) => d.id === 'd-atlas-v3')!;
  const task = state.tasks.find((t) => t.id === del.taskId)!;
  const approved = del.state === 'approved';
  const waiting = state.deliverables.filter((d) => d.state === 'waiting').length;
  const draft = state.invoices.find((i) => i.projectId === 'atlas' && i.state === 'draft');
  const shown = (key: string) => state.tasks.filter((t) => t.projectId === 'atlas' && t.status === key).slice(0, key === 'done' ? 1 : 2);

  const approve = () => {
    dispatch({ type: 'approve', deliverableId: del.id });
    toast({ text: 'Morgan approved Final presentation v3. The card moved and the invoice line is drafted.' });
  };

  return (
    <div className={`sync ${approved ? 'is-approved' : ''}`} aria-describedby="sync-note">
      <p id="sync-note" className="visually-hidden">
        Interactive example. Pressing approve shows the agency board and the client portal update together.
      </p>
      <div className="sync-pane sync-agency">
        <p className="sync-label">
          <span>agency board, atlas brand identity</span>
          <span className="sync-count">waiting on clients <strong><Tween value={waiting} /></strong></span>
        </p>
        <div className="sync-board">
          {cols.map((c) => {
            const list = c.key === 'done' && approved ? [task] : shown(c.key);
            return (
              <div key={c.key} className="sync-col">
                <p className="sync-col-head">{c.label}</p>
                {list.map((t) => (
                  <div key={`${t.id}-${t.status}`} className={`sync-card ${t.id === task.id ? 'is-signal' : ''}`}>
                    <span>{t.title}</span>
                    <span className="sync-card-meta">
                      {t.id === task.id ? <span className="pill pill--soft">v3</span> : <PriorityPill p={t.priority} />}
                      <Avatar id={t.assignee} size={22} />
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <svg className="sync-arc" viewBox="0 0 650 64" preserveAspectRatio="none" aria-hidden="true">
        <path d="M110 62 C 220 0, 470 0, 580 2" fill="none" />
        <circle r="5" className="sync-dot" />
      </svg>

      <div className="sync-pane sync-portal" data-theme="lavender">
        <p className="sync-label"><span>client portal, welcome back Morgan</span><span>Atlas, Montréal</span></p>
        <div className="sync-row">
          <div>
            <p className="sync-row-title">Final presentation v3 {approved ? 'is approved' : 'is ready for your review'}</p>
            <p className="muted small">18 slides from Jamie, shared Nov. 9</p>
          </div>
          {approved ? (
            <button className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: 'reset' })}>reset the demo</button>
          ) : (
            <div className="actions">
              <button className="btn btn--primary" onClick={approve}>approve</button>
              <Link className="btn btn--ghost" href="/portal/reviews">ask for changes</Link>
            </div>
          )}
        </div>
        <p className={`sync-invoice ${draft ? 'is-on' : ''}`}>
          {draft
            ? <>invoice draft {draft.id}: {draft.lines[0].label}, {money(draft.lines[0].cents)} <Link href={`/app/invoices/${draft.id}`}>open it</Link></>
            : 'invoice line: waiting on Morgan’s sign-off'}
        </p>
      </div>
    </div>
  );
}
