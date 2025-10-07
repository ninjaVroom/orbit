'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { clients } from '@/lib/data';
import { date, money } from '@/lib/format';
import { isOverdue, useStore } from '@/lib/store';
import { totals } from '@/lib/tax';
import { InvoiceDoc } from '@/components/screens';
import { InvoicePill } from '@/components/ui';

export default function Page() { return <Suspense><PortalInvoices /></Suspense>; }

function PortalInvoices() {
  const { state } = useStore();
  const q = useSearchParams().get('id');
  const c = clients.find((x) => x.id === 'atlas')!;
  // Clients never see drafts.
  const mine = state.invoices.filter((i) => i.clientId === 'atlas' && i.state !== 'draft');
  const open = mine.find((i) => i.id === q) ?? mine[mine.length - 1];
  return (
    <div className="portal-page">
      <h1 className="portal-h">invoices</h1>
      <div className="portal-inv">
        <ul className="inv-list" aria-label="Your invoices">
          {mine.map((i) => (
            <li key={i.id}>
              <Link href={`?id=${i.id}`} aria-current={open?.id === i.id ? 'true' : undefined} scroll={false}>
                <strong>{i.id}</strong>
                <span className="num">{money(totals(i.lines, c.province).total)}</span>
                <span className="muted small">{i.state === 'paid' ? `paid ${date(i.paidOn!)}` : `due ${date(i.due!)}`}</span>
                <InvoicePill state={i.state} overdue={isOverdue(i)} />
              </Link>
            </li>
          ))}
        </ul>
        {open ? <div className="doc"><InvoiceDoc invoiceId={open.id} /></div> : <p className="muted">No invoices yet.</p>}
      </div>
    </div>
  );
}
