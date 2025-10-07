'use client';
import Link from 'next/link';
import { clients, DEMO_TODAY, projects } from '@/lib/data';
import { date, day, dueLabel, first, money0, person, time } from '@/lib/format';
import { isOverdue, progress, useStore } from '@/lib/store';
import { totals } from '@/lib/tax';
import { Avatar, PriorityPill, Tween } from '@/components/ui';

export default function Overview() {
  const { state } = useStore();
  const me = person(state.persona);
  const member = me.role === 'member';
  const visible = member ? projects.filter((p) => state.tasks.some((t) => t.projectId === p.id && t.assignee === me.id)) : projects;

  const due = state.tasks.filter((t) => t.due <= '2026-11-30');
  const done = due.filter((t) => t.status === 'done').length;
  const waiting = state.deliverables.filter((d) => d.state === 'waiting').length;
  const outstanding = state.invoices.filter((i) => i.state === 'sent').reduce((s, i) => {
    const c = clients.find((x) => x.id === i.clientId)!;
    return s + totals(i.lines, c.province).total;
  }, 0);
  const overdue = state.invoices.filter(isOverdue).length;

  const kpis = [
    { label: 'active projects', value: visible.length, fmt: (n: number) => String(Math.round(n)), rule: 'Projects with work not yet done, in this workspace.' },
    { label: 'tasks done this month', value: Math.round((done / due.length) * 100), fmt: (n: number) => `${Math.round(n)}%`, rule: `${done} done out of ${due.length} tasks due by Nov. 30.` },
    { label: 'waiting on clients', value: waiting, fmt: (n: number) => String(Math.round(n)), rule: 'Versions shared to a portal with no decision yet.' },
    { label: 'outstanding, CAD', value: outstanding, fmt: (n: number) => money0(n), rule: `Sent invoices including GST/HST, ${overdue} overdue. Drafts don’t count.` },
  ];

  const milestones = projects.flatMap((p) => p.milestones.filter((m) => !m.done).map((m) => ({ ...m, p })))
    .sort((a, b) => a.due.localeCompare(b.due)).slice(0, 5);
  const mine = state.tasks.filter((t) => t.assignee === me.id && t.status !== 'done').sort((a, b) => a.due.localeCompare(b.due));

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>good morning, {first(me.id).toLowerCase()}</h1>
          <p className="muted">{new Date(`${DEMO_TODAY}T12:00`).toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}. Here’s what’s moving at Northstar.</p>
        </div>
        <Link className="btn btn--primary" href="/app/projects/atlas">open the atlas board</Link>
      </header>

      {!member && (
        <ul className="kpis">
          {kpis.map((k) => (
            <li key={k.label} className="kpi">
              <p className="kpi-label">{k.label}</p>
              <p className="kpi-value"><Tween value={k.value} format={k.fmt} /></p>
              <details className="kpi-rule"><summary>how is this counted?</summary><p>{k.rule}</p></details>
            </li>
          ))}
        </ul>
      )}

      <div className="overview-grid">
        <section aria-labelledby="ap-h">
          <h2 id="ap-h" className="block-h">{member ? 'your projects' : 'active projects'}</h2>
          <ul className="plist">
            {visible.map((p) => {
              const pct = progress(state, p.id);
              const c = clients.find((x) => x.id === p.clientId)!;
              const w = state.deliverables.find((d) => d.projectId === p.id && d.state === 'waiting');
              return (
                <li key={p.id}>
                  <Link href={`/app/projects/${p.id}`} className="plist-name">{p.name}</Link>
                  <span className="muted small">{c.city}, {c.province}. {first(c.contactId)} signs off.</span>
                  <span className="plist-state">{w ? <span className="pill pill--review">v{w.version} with {first(c.contactId)}</span> : <span className="pill pill--progress">in progress</span>}</span>
                  <span className="plist-bar"><span className="bar"><span style={{ transform: `scaleX(${pct / 100})` }} /></span><span className="num">{pct}%</span></span>
                </li>
              );
            })}
          </ul>
          <p className="muted small">Progress is done tasks out of all tasks on the project.</p>
        </section>

        <aside className="overview-side">
          <section aria-labelledby="ms-h">
            <h2 id="ms-h" className="block-h">upcoming milestones</h2>
            <ul className="milestones">
              {milestones.map((m) => (
                <li key={m.p.id + m.label}>
                  <span className="date-chip">{day(m.due)}</span>
                  <span><strong>{m.label}</strong><span className="muted small">{m.p.short}, led by {first(m.p.lead)}</span></span>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="mw-h">
            <h2 id="mw-h" className="block-h">your work</h2>
            <ul className="mywork">
              {mine.length ? mine.map((t) => (
                <li key={t.id}>
                  <Link href={`/app/projects/${t.projectId}?task=${t.id}`}>{t.title}</Link>
                  <span className="muted small">{dueLabel(t.due)}</span>
                  <PriorityPill p={t.priority} />
                </li>
              )) : <li className="muted">Nothing assigned to you. Enjoy it.</li>}
            </ul>
          </section>
        </aside>
      </div>

      <section aria-labelledby="act-h" className="activity">
        <h2 id="act-h" className="block-h">activity</h2>
        <ol>
          {state.activity.slice(0, 6).map((a) => (
            <li key={a.id}>
              <Avatar id={a.who} size={28} />
              <span><strong>{person(a.who).name}</strong> {a.text}</span>
              <span className="muted small">{time(a.at)}</span>
            </li>
          ))}
        </ol>
        <p className="muted small">Times are Eastern. Last updated {date(DEMO_TODAY)}.</p>
      </section>
    </div>
  );
}
