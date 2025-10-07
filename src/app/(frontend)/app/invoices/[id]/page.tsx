'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { person } from '@/lib/format';
import { useStore } from '@/lib/store';
import { InvoiceDoc } from '@/components/screens';
import { useToast } from '@/components/ui';

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const inv = state.invoices.find((i) => i.id === id);
  const owner = person(state.persona).role === 'owner';
  return (
    <div className="page">
      <header className="page-head">
        <p className="muted small"><Link href="/app/invoices">invoices</Link> / {id}</p>
        {inv && (
          <div className="actions no-print">
            {inv.state === 'draft' && (
              <button className="btn btn--primary" disabled={!owner} title={owner ? undefined : 'Only the owner sends invoices'}
                onClick={() => { dispatch({ type: 'invoice', id: inv.id, state: 'sent' }); toast({ text: `${inv.id} sent. It’s in the client’s portal now.` }); }}>
                send to client
              </button>
            )}
            {inv.state === 'sent' && (
              <button className="btn btn--primary" disabled={!owner}
                onClick={() => { dispatch({ type: 'invoice', id: inv.id, state: 'paid' }); toast({ text: `${inv.id} marked paid.` }); }}>
                mark as paid
              </button>
            )}
            <button className="btn btn--ghost" onClick={() => print()}>print or save PDF</button>
          </div>
        )}
      </header>
      {!owner && inv?.state !== 'paid' && <p className="muted small">Only Alex, the owner, can send invoices or mark them paid.</p>}
      <div className="doc"><InvoiceDoc invoiceId={id} /></div>
    </div>
  );
}
