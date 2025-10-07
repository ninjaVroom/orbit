'use client';
import { useState } from 'react';
import { clients, projects } from '@/lib/data';
import { date, money } from '@/lib/format';
import { useStore } from '@/lib/store';
import { provinceName, taxRates, totals } from '@/lib/tax';
import { ClientRecord } from '@/components/screens';

export default function Clients() {
  const { state } = useStore();
  const [sel, setSel] = useState('atlas');
  return (
    <div className="page">
      <header className="page-head"><h1>clients</h1></header>
      <div className="clients-grid">
        <ul className="client-list" aria-label="Clients">
          {clients.map((c) => {
            const owing = state.invoices.filter((i) => i.clientId === c.id && i.state === 'sent').reduce((s, i) => s + totals(i.lines, c.province).total, 0);
            return (
              <li key={c.id}>
                <button aria-pressed={sel === c.id} onClick={() => setSel(c.id)}>
                  <strong>{c.name}</strong>
                  <span className="muted small">{c.city}, {provinceName[c.province]}</span>
                  <span className="small">{taxRates(c.province).map((t) => t.label).join(' + ')}</span>
                  <span className="small num">{owing ? `${money(owing)} owing` : 'nothing owing'}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="client-detail">
          <ClientRecord clientId={sel} />
          <p className="muted small">
            Client since {date(clients.find((c) => c.id === sel)!.since)}. Project: {projects.find((p) => p.clientId === sel)!.name}.
            Portal access: on for {clients.find((c) => c.id === sel)!.email}.
          </p>
        </div>
      </div>
    </div>
  );
}
