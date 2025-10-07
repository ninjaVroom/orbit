'use client';
import Link from 'next/link';
import { clients, projects } from '@/lib/data';
import { date, first, money0 } from '@/lib/format';
import { progress, useStore } from '@/lib/store';

export default function Projects() {
  const { state } = useStore();
  const role = state.persona === 'alex' ? 'owner' : 'other';
  return (
    <div className="page">
      <header className="page-head"><h1>projects</h1></header>
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr><th scope="col">project</th><th scope="col">client</th><th scope="col">lead</th><th scope="col">due</th><th scope="col">progress</th>
              {role === 'owner' && <th scope="col" className="num">fee</th>}{role === 'owner' && <th scope="col" className="num">margin</th>}</tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const c = clients.find((x) => x.id === p.clientId)!;
              const pct = progress(state, p.id);
              return (
                <tr key={p.id}>
                  <th scope="row"><Link href={`/app/projects/${p.id}`}>{p.name}</Link></th>
                  <td>{c.name}<span className="muted small block">{c.city}, {c.province}</span></td>
                  <td>{first(p.lead)}</td>
                  <td>{date(p.due)}</td>
                  <td><span className="plist-bar"><span className="bar"><span style={{ transform: `scaleX(${pct / 100})` }} /></span><span className="num">{pct}%</span></span></td>
                  {role === 'owner' && <td className="num">{money0(p.feeCents)}</td>}
                  {role === 'owner' && <td className="num">{Math.round(((p.feeCents - p.costCents) / p.feeCents) * 100)}%</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {role !== 'owner' && <p className="muted small">Fees and margins are visible to the owner only.</p>}
    </div>
  );
}
