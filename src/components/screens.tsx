'use client';
// Product screens shared by the app, the portal and the marketing pictures. One component, one record.
import { useState, type DragEvent } from 'react';
import Link from 'next/link';
import { clients, projects, people, studio, type Status } from '@/lib/data';
import { date, day, dueLabel, first, money, person, time } from '@/lib/format';
import { isOverdue, moveError, progress, statusName, useStore } from '@/lib/store';
import { provinceName, totals } from '@/lib/tax';
import { Avatar, InvoicePill, PriorityPill, useToast } from './ui';
import { Icon } from './Icon';

const columns: Status[] = ['todo', 'progress', 'review', 'done'];

export function Board({ projectId, interactive = false, onOpen, highlight }: {
  projectId: string; interactive?: boolean; onOpen?: (taskId: string) => void; highlight?: string;
}) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [over, setOver] = useState<Status | null>(null);
  const tasks = state.tasks.filter((t) => t.projectId === projectId);

  const move = (taskId: string, to: Status) => {
    const err = moveError(state, taskId, to);
    const task = tasks.find((t) => t.id === taskId)!;
    if (err) {
      toast({ tone: 'error', text: `Couldn’t move “${task.title}”. ${err} It’s back in ${statusName[task.status]}.` });
      return;
    }
    if (task.status === to) return;
    const from = task.status;
    dispatch({ type: 'move', taskId, to });
    toast({ text: `Moved to ${statusName[to]}.`, action: { label: 'undo', run: () => dispatch({ type: 'move', taskId, to: from }) } });
  };

  const drop = (e: DragEvent, to: Status) => {
    e.preventDefault();
    setOver(null);
    move(e.dataTransfer.getData('text/plain'), to);
  };

  return (
    <div className="board">
      {columns.map((col) => {
        const list = tasks.filter((t) => t.status === col);
        return (
          <section key={col} className={`board-col ${over === col ? 'is-over' : ''}`} aria-label={statusName[col]}
            onDragOver={interactive ? (e) => { e.preventDefault(); setOver(col); } : undefined}
            onDragLeave={interactive ? () => setOver(null) : undefined}
            onDrop={interactive ? (e) => drop(e, col) : undefined}>
            <h3 className="board-head">{statusName[col]} <span className="count">{list.length}</span></h3>
            <ul className="board-list">
              {list.map((t) => {
                const del = t.deliverableId && state.deliverables.find((d) => d.id === t.deliverableId);
                return (
                  <li key={`${t.id}-${t.status}`} className={`task-card ${highlight === t.id ? 'is-hot' : ''}`}
                    draggable={interactive} onDragStart={(e) => e.dataTransfer.setData('text/plain', t.id)}>
                    <span className="task-title">{t.title}</span>
                    {interactive && (
                      <button className="task-open" onClick={() => onOpen?.(t.id)}><span className="visually-hidden">Open {t.title}</span></button>
                    )}
                    <div className="task-meta">
                      <PriorityPill p={t.priority} />
                      {del && <span className="pill pill--soft">v{del.version}</span>}
                      <span className={`due ${t.status !== 'done' && dueLabel(t.due).includes('late') ? 'due--late' : ''}`}>
                        {t.status === 'done' ? day(t.due) : dueLabel(t.due)}
                      </span>
                      <Avatar id={t.assignee} size={24} />
                    </div>
                    {interactive && (
                      <label className="task-move">
                        <span className="visually-hidden">Move {t.title} to</span>
                        <select value={t.status} onChange={(e) => move(t.id, e.target.value as Status)}>
                          {columns.map((c) => <option key={c} value={c}>{statusName[c]}</option>)}
                        </select>
                      </label>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function ReviewPanel({ deliverableId, onDone }: { deliverableId: string; onDone?: (approved: boolean) => void }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const del = state.deliverables.find((d) => d.id === deliverableId)!;
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');
  const project = projects.find((p) => p.id === del.projectId)!;

  const approve = () => {
    dispatch({ type: 'approve', deliverableId });
    toast({ text: `You approved ${del.title} v${del.version}. ${studio.name} has been told.` });
    onDone?.(true);
  };
  const send = () => {
    if (!note.trim()) { setErr('Add a note so the team knows what to change.'); return; }
    dispatch({ type: 'changes', deliverableId, note: note.trim() });
    toast({ text: `Sent. ${studio.name} will see your note on ${del.title}.` });
    setAsking(false); setNote(''); setErr('');
    onDone?.(false);
  };

  return (
    <article className="review">
      <div className="review-preview" aria-hidden="true">
        <span className="review-mark">{project.short.toLowerCase()}</span>
        <span className="review-sub">{del.title.toLowerCase()} · v{del.version}</span>
      </div>
      <div className="review-body">
        <h3>{del.title} v{del.version}</h3>
        <p className="muted">{del.summary}</p>
        <p className="review-file"><Icon name="file" size={16} /> {del.file}</p>
        {del.state === 'waiting' && !asking && (
          <div className="actions">
            <button className="btn btn--primary" onClick={approve}>approve</button>
            <button className="btn btn--ghost" onClick={() => setAsking(true)}>ask for changes</button>
          </div>
        )}
        {asking && (
          <div className="field">
            <label htmlFor={`note-${del.id}`}>What should change?</label>
            <textarea id={`note-${del.id}`} rows={3} value={note} onChange={(e) => { setNote(e.target.value); setErr(''); }}
              aria-invalid={!!err} aria-describedby={err ? `err-${del.id}` : undefined} />
            {err && <p className="field-error" id={`err-${del.id}`}>{err}</p>}
            <div className="actions">
              <button className="btn btn--primary" onClick={send}>send note</button>
              <button className="btn btn--ghost" onClick={() => { setAsking(false); setErr(''); }}>cancel</button>
            </div>
          </div>
        )}
        {del.state === 'approved' && <p className="decided decided--ok"><Icon name="check" size={16} /> Approved. The team has it.</p>}
        {del.state === 'changes' && <p className="decided">You asked for changes. The next version will show up here.</p>}
        <ol className="history" aria-label="Decision history">
          {[...del.history].reverse().map((h, i) => (
            <li key={i}>
              <span>v{h.version} {h.state === 'sent' ? 'shared' : h.state === 'approved' ? 'approved' : 'changes asked'} by {first(h.by)}</span>
              <span className="muted">{time(h.at)}</span>
              {h.note && <q>{h.note}</q>}
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
}

export function InvoiceDoc({ invoiceId }: { invoiceId: string }) {
  const { state } = useStore();
  const inv = state.invoices.find((i) => i.id === invoiceId);
  if (!inv) return <p>That invoice doesn’t exist.</p>;
  const client = clients.find((c) => c.id === inv.clientId)!;
  const t = totals(inv.lines, client.province);
  return (
    <article className="invoice">
      <header className="invoice-head">
        <div>
          <p className="invoice-from">{studio.name}</p>
          <p className="muted small">{studio.address}<br />GST/HST no. {studio.gst}</p>
        </div>
        <div className="invoice-id">
          <h3>{inv.id}</h3>
          <InvoicePill state={inv.state} overdue={isOverdue(inv)} />
        </div>
      </header>
      <dl className="invoice-meta">
        <div><dt>billed to</dt><dd>{client.legal}<br /><span className="muted small">{client.address}</span></dd></div>
        <div><dt>issued</dt><dd>{inv.issued ? date(inv.issued) : 'not sent yet'}</dd></div>
        <div><dt>due</dt><dd>{inv.due ? date(inv.due) : `net ${client.terms}`}</dd></div>
      </dl>
      <table className="lines">
        <thead><tr><th scope="col">item</th><th scope="col" className="num">amount</th></tr></thead>
        <tbody>
          {inv.lines.map((l, i) => <tr key={i}><td>{l.label}</td><td className="num">{money(l.cents)}</td></tr>)}
        </tbody>
        <tfoot>
          <tr><th scope="row">subtotal</th><td className="num">{money(t.subtotal)}</td></tr>
          {t.taxes.map((x) => <tr key={x.label}><th scope="row">{x.label}</th><td className="num">{money(x.cents)}</td></tr>)}
          <tr className="total"><th scope="row">total, CAD</th><td className="num">{money(t.total)}</td></tr>
        </tfoot>
      </table>
      <p className="muted small">
        Tax applied for {provinceName[client.province]}, where the work is delivered.
        {inv.state === 'paid' ? ` Paid ${date(inv.paidOn!)} by ${inv.method}.` : ' Pay by Interac e-Transfer to payments@northstar.example or by EFT.'}
      </p>
    </article>
  );
}

export function ClientRecord({ clientId }: { clientId: string }) {
  const c = clients.find((x) => x.id === clientId)!;
  const contact = person(c.contactId);
  return (
    <article className="record">
      <header className="record-head">
        <span className="record-mark">{c.name[0]}</span>
        <div><h3>{c.legal}</h3><p className="muted">{c.city}, {provinceName[c.province]}</p></div>
      </header>
      <dl className="record-grid">
        <div><dt>signs off</dt><dd><Avatar id={contact.id} size={24} /> {contact.name}</dd></div>
        <div><dt>role</dt><dd>{contact.title}</dd></div>
        <div><dt>email</dt><dd>{c.email}</dd></div>
        <div><dt>phone</dt><dd>{c.phone}</dd></div>
        <div><dt>address</dt><dd>{c.address}</dd></div>
        <div><dt>terms</dt><dd>net {c.terms}, CAD</dd></div>
      </dl>
    </article>
  );
}

export function ProjectSetup({ projectId }: { projectId: string }) {
  const p = projects.find((x) => x.id === projectId)!;
  const team = people.filter((x) => x.role !== 'client');
  return (
    <article className="setup">
      <h3>{p.name}</h3>
      <p className="muted">{p.summary}</p>
      <ol className="timeline">
        {p.milestones.map((m) => (
          <li key={m.label} className={m.done ? 'is-done' : ''}>
            <span className="tl-mark" aria-hidden="true" />
            <span>{m.label}</span>
            <span className="muted">{date(m.due)}{m.done ? ', done' : ''}</span>
          </li>
        ))}
      </ol>
      <div className="setup-team">
        {team.map((x) => <span key={x.id} className="chip"><Avatar id={x.id} size={22} /> {x.name.split(' ')[0]}</span>)}
      </div>
    </article>
  );
}

export function PortalHome({ clientId, compact = false }: { clientId: string; compact?: boolean }) {
  const { state } = useStore();
  const c = clients.find((x) => x.id === clientId)!;
  const project = projects.find((p) => p.clientId === clientId)!;
  const pct = progress(state, project.id);
  const reviews = state.deliverables.filter((d) => d.projectId === project.id && d.state === 'waiting');
  const due = state.invoices.filter((i) => i.clientId === clientId && i.state === 'sent');
  const next = project.milestones.find((m) => !m.done);
  return (
    <div className={`portal-home ${compact ? 'is-compact' : ''}`}>
      <p className="muted">Welcome back, {first(c.contactId)}</p>
      <section className="portal-hero">
        <h3>{project.name}</h3>
        <p>{pct}% done{next ? `. Next: ${next.label.toLowerCase()}, ${day(next.due)}.` : '.'}</p>
        <div className="bar" aria-hidden="true"><span style={{ transform: `scaleX(${pct / 100})` }} /></div>
      </section>
      <h4 className="portal-sub">needs your attention</h4>
      <ul className="attention">
        {reviews.map((d) => (
          <li key={d.id}>
            <span><strong>{d.title} v{d.version}</strong> is ready for your review</span>
            <Link className="btn btn--primary btn--sm" href="/portal/reviews">review</Link>
          </li>
        ))}
        {due.map((i) => (
          <li key={i.id}>
            <span><strong>{i.id}</strong>, {money(totals(i.lines, c.province).total)}, {isOverdue(i) ? 'overdue' : dueLabel(i.due!)}</span>
            <Link className="btn btn--ghost btn--sm" href={`/portal/invoices?id=${i.id}`}>view</Link>
          </li>
        ))}
        {!reviews.length && !due.length && <li className="muted">All caught up. Nothing needs you right now.</li>}
      </ul>
    </div>
  );
}

export function PhoneToday() {
  const { state } = useStore();
  const mine = state.tasks.filter((t) => t.assignee === 'jamie' && t.status !== 'done').sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4);
  return (
    <div className="phone">
      <p className="phone-top"><span>9:41</span><span>Northstar</span></p>
      <h3>today, Jamie</h3>
      <ul className="phone-list">
        {mine.map((t) => (
          <li key={t.id}>
            <span>{t.title}</span>
            <span className="muted small">{projects.find((p) => p.id === t.projectId)!.short}, {dueLabel(t.due)}</span>
          </li>
        ))}
      </ul>
      <p className="phone-nav"><Icon name="home" /><Icon name="folder" /><Icon name="check" /><Icon name="menu" /></p>
    </div>
  );
}
