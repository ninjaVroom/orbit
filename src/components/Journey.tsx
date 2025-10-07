'use client';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useStore } from '@/lib/store';
import { Board, ClientRecord, InvoiceDoc, PhoneToday, PortalHome, ProjectSetup, ReviewPanel } from './screens';
import { Frame } from './ui';

const stages = [
  { head: 'add the client.', line: 'Contacts, the province for tax, and who on their side signs off.' },
  { head: 'set up the project.', line: 'Milestones, the team, and the first tasks on the board.' },
  { head: 'do the work.', line: 'Move cards, comment, attach files. Every change lands in the activity log.' },
  { head: 'hand it over.', line: 'Publish a version to the portal. The client approves or asks for changes, with a name and a time.' },
  { head: 'send the invoice.', line: 'Approved work becomes line items, with GST, HST or QST worked out for you.' },
];

export function Journey() {
  const { state } = useStore();
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const invoiceId = state.invoices.find((i) => i.projectId === 'atlas' && i.state === 'draft')?.id ?? 'INV-2026-040';

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const pictures = [
    <Frame key="1" width={760} label="The Atlas client record"><ClientRecord clientId="atlas" /></Frame>,
    <Frame key="2" width={760} label="Atlas project milestones and team"><ProjectSetup projectId="atlas" /></Frame>,
    <Frame key="3" width={1080} label="The Atlas project board"><Board projectId="atlas" highlight="t5" /></Frame>,
    <Frame key="4" width={760} label="Morgan's review in the portal"><ReviewPanel deliverableId="d-atlas-v3" /></Frame>,
    <Frame key="5" width={760} label="An Atlas invoice with GST and QST"><InvoiceDoc invoiceId={invoiceId} /></Frame>,
  ];

  return (
    <section className="journey container" aria-labelledby="journey-h">
      <div className="journey-text">
        <h2 id="journey-h">from brief to paid</h2>
        <p className="lead muted">One Atlas deliverable, from the first call to the paid invoice.</p>
        <ol className="journey-steps" style={{ ['--k' as string]: (active + 1) / stages.length }}>
          {stages.map((s, i) => (
            <li key={s.head} data-i={i} ref={(el) => { items.current[i] = el; }} className={i === active ? 'is-active' : ''}>
              <span className="journey-n num">{i + 1}</span>
              <div>
                <h3>{s.head}</h3>
                <p className="muted">{s.line}</p>
              </div>
              <div className="journey-inline">{pictures[i]}</div>
            </li>
          ))}
        </ol>
      </div>
      <div className="journey-stage" aria-hidden="true">
        <div className="journey-sticky">
          {pictures.map((p, i) => (
            <div key={i} className={`journey-pic ${i === active ? 'is-on' : ''}`}>{p}</div>
          ))}
          <p className="journey-caption">stage {active + 1} of 5, {stages[active].head.replace('.', '')}</p>
        </div>
      </div>
    </section>
  );
}

const views = [
  { key: 'team', label: 'your team', caption: 'The board, the margins, the internal thread. Everything.' },
  { key: 'client', label: 'your client', caption: 'Their project, their reviews, their invoices. Nothing of yours they weren’t meant to see.' },
  { key: 'phone', label: 'on the go', caption: 'Today’s work for whoever is holding the phone.' },
] as const;

export function Views() {
  const [i, setI] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    const n = (i + d + views.length) % views.length;
    setI(n);
    tabs.current[n]?.focus();
  };
  return (
    <section className="views container" aria-labelledby="views-h">
      <div className="views-head">
        <h2 id="views-h">one project, three screens</h2>
        <p className="lead muted">The same Atlas project, as your team sees it, as Morgan sees it, and on a phone.</p>
      </div>
      <div className="segmented" role="tablist" aria-label="Choose a view" onKeyDown={onKey}>
        {views.map((v, n) => (
          <button key={v.key} role="tab" id={`tab-${v.key}`} aria-selected={i === n} aria-controls={`panel-${v.key}`}
            tabIndex={i === n ? 0 : -1} ref={(el) => { tabs.current[n] = el; }} onClick={() => setI(n)}>{v.label}</button>
        ))}
      </div>
      {views.map((v, n) => (
        <div key={v.key} role="tabpanel" id={`panel-${v.key}`} aria-labelledby={`tab-${v.key}`} hidden={i !== n} className="views-panel">
          <div className={`views-pic views-pic--${v.key}`} data-reveal>
            {v.key === 'team' && <Frame width={1240} label="The Atlas board, agency view"><div className="mini-app"><Board projectId="atlas" /></div></Frame>}
            {v.key === 'client' && <Frame width={900} label="The Atlas project in Morgan's portal"><div className="mini-portal"><PortalHome clientId="atlas" /></div></Frame>}
            {v.key === 'phone' && <Frame width={390} label="Jamie's day on a phone"><PhoneToday /></Frame>}
          </div>
          <p className="views-caption">{v.caption}</p>
        </div>
      ))}
    </section>
  );
}
