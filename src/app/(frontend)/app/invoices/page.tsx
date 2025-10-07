'use client';
import Link from 'next/link';
import { useState } from 'react';
import { clients } from '@/lib/data';
import { date, money } from '@/lib/format';
import { isOverdue, useStore } from '@/lib/store';
import { totals } from '@/lib/tax';
import { InvoicePill, Tween } from '@/components/ui';

const filters = ['all', 'draft', 'sent', 'overdue', 'paid'] as const;

export default function Invoices() {
  const { state } = useStore();
  const [f, setF] = useState<(typeof filters)[number]>('all');
  const rows = state.invoices.map((i) => {
    const c = clients.find((x) => x.id === i.clientId)!;
    return { i, c, t: totals(i.lines, c.province), overdue: isOverdue(i) };
  }).sort((a, b) => b.i.id.localeCompare(a.i.id));
  const shown = rows.filter((r) => f === 'all' || (f === 'overdue' ? r.overdue : r.i.state === f && !(f === 'sent' && r.overdue)));
  const sum = (pick: typeof rows) => pick.reduce((s, r) => s + r.t.total, 0);

  return (
    <div className="page">
      <header className="page-head"><h1>invoices</h1></header>
      <ul className="kpis kpis--3">
        <li className="kpi"><p className="kpi-label">outstanding</p><p className="kpi-value"><Tween value={sum(rows.filter((r) => r.i.state === 'sent'))} format={(n) => money(n)} /></p></li>
        <li className="kpi"><p className="kpi-label">overdue</p><p className="kpi-value"><Tween value={sum(rows.filter((r) => r.overdue))} format={(n) => money(n)} /></p></li>
        <li className="kpi"><p className="kpi-label">in drafts</p><p className="kpi-value"><Tween value={sum(rows.filter((r) => r.i.state === 'draft'))} format={(n) => money(n)} /></p></li>
      </ul>
      <div className="segmented segmented--light" role="group" aria-label="Filter invoices">
        {filters.map((x) => <button key={x} aria-pressed={f === x} onClick={() => setF(x)}>{x}</button>)}
      </div>
      <div className="table-scroll">
        <table className="table">
          <thead><tr><th scope="col">invoice</th><th scope="col">client</th><th scope="col">issued</th><th scope="col">due</th><th scope="col">state</th><th scope="col" className="num">total, CAD</th></tr></thead>
          <tbody>
            {shown.map(({ i, c, t, overdue }) => (
              <tr key={i.id}>
                <th scope="row"><Link href={`/app/invoices/${i.id}`}>{i.id}</Link></th>
                <td>{c.name}<span className="muted small block">{c.province}</span></td>
                <td>{i.issued ? date(i.issued) : 'not sent'}</td>
                <td>{i.due ? date(i.due) : `net ${c.terms}`}</td>
                <td><InvoicePill state={i.state} overdue={overdue} /></td>
                <td className="num">{money(t.total)}</td>
              </tr>
            ))}
            {!shown.length && <tr><td colSpan={6} className="muted">No {f} invoices.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="muted small">Totals include GST, HST or QST for each client’s province.</p>
    </div>
  );
}
