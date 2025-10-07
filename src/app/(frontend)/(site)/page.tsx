import Link from 'next/link';
import { SyncDemo } from '@/components/SyncDemo';
import { Journey, Views } from '@/components/Journey';
import { Personas, Plans } from '@/components/Marketing';

const code = `// src/lib/store.tsx (excerpt)
export function moveError(s: State, taskId: string, to: Status) {
  if (role === 'client') return 'Clients can’t move cards.';
  if (del && to === 'done' && del.state !== 'approved')
    return \`\${first(client.contactId)} hasn’t approved this yet.\`;
  return null;
}`;

const perms: [string, string, string, string, string][] = [
  ['see studio-wide numbers', 'yes', 'yes', 'own work', 'no'],
  ['move tasks', 'yes', 'yes', 'assigned', 'no'],
  ['mark client work done', 'after approval', 'after approval', 'no', 'no'],
  ['approve a deliverable', 'no', 'no', 'no', 'own projects'],
];

const faqs = [
  ['Can a client see our internal comments?', 'No. Clients see their projects, reviews and invoices. Your threads stay yours.'],
  ['What happens when a client asks for changes?', 'The card goes back to in progress with their note, kept with a name and a time.'],
  ['Does it handle GST, HST and QST?', 'Yes. Tax follows the client’s province, in Canadian dollars.'],
  ['Is the demo real data?', 'No. Northstar Studio and its clients are made up, and it saves in your browser only.'],
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-orbit" data-parallax="0.35" aria-hidden="true"><span /><span /></div>
        <div className="container hero-grid">
          <div className="hero-text">
            <h1 className="hero-h">your agency. in sync.</h1>
            <p className="lead">Your team works on the board. Your clients approve in their own portal. The invoice follows.</p>
            <div className="actions">
              <Link className="btn btn--primary btn--lg" href="/login">open the live demo</Link>
              <Link className="btn btn--ghost btn--lg" href="#journey-h">how it works</Link>
            </div>
            <p className="muted small">Runs on sample data from a made-up Toronto studio. No card, no sign-up.</p>
          </div>
          <div className="hero-demo" data-parallax="-0.06">
            <SyncDemo />
            <p className="hero-hint muted small">Try it: press approve as Morgan.</p>
          </div>
        </div>
      </section>

      <Journey />
      <Views />

      <section className="band band--lavender" data-theme="lavender" aria-labelledby="hood-h">
        <div className="container hood">
          <div className="hood-text" data-reveal>
            <h2 id="hood-h">built to be read</h2>
            <p className="lead">One function decides what can move. The board, the portal and the server all ask it.</p>
            <Link className="text-link" href="/features#roles">read how roles work</Link>
          </div>
          <div className="hood-pics">
            <pre className="code" data-reveal aria-label="Code: the rule that decides if a card can move"><code>{code}</code></pre>
            <div className="table-wrap" data-reveal>
              <table className="perm">
                <caption className="visually-hidden">Who can do what</caption>
                <thead><tr><th scope="col">action</th><th scope="col">owner</th><th scope="col">manager</th><th scope="col">member</th><th scope="col">client</th></tr></thead>
                <tbody>{perms.map(([a, ...r]) => <tr key={a}><th scope="row">{a}</th>{r.map((v, i) => <td key={i}>{v}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <Plans />

      <section className="faq container" aria-labelledby="faq-h">
        <h2 id="faq-h">questions</h2>
        <div className="faq-list">
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="close" aria-labelledby="close-h">
        <div className="close-ring" data-parallax="0.2" aria-hidden="true" />
        <div className="container close-inner" data-reveal>
          <h2 id="close-h">see it run</h2>
          <p className="lead">Step into Northstar Studio as one of three people.</p>
          <Personas size="lg" />
        </div>
      </section>
    </>
  );
}
