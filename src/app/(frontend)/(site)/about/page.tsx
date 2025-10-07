import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'about', description: 'Why orbit exists, and how it was built.' };

const next = [
  ['Time tracking against each task', 'not built yet'],
  ['Retainers that bill monthly', 'not built yet'],
  ['Payments through Stripe, with Interac', 'not built yet'],
  ['A French interface for Quebec studios and clients', 'not built yet'],
];

export default function About() {
  return (
    <>
      <header className="container page-hero">
        <h1>why orbit exists</h1>
      </header>
      <article className="container letter">
        <p>Agency work falls apart at the handover. The team finishes, the client is somewhere in an email thread, and the invoice waits on a “looks good” nobody can find.</p>
        <p>orbit puts that moment in one place. The studio works on a board. The client gets a portal with only what’s theirs. When they approve, the card moves and the invoice line appears, because it’s the same record underneath.</p>
        <figure className="photo-band photo-band--letter">
          <img src="/images/mockups/studio-work-tinted.jpg" alt="Printed layouts and swatches spread across a studio table" data-parallax="0.1" />
        </figure>
        <h2>an independent build</h2>
        <p>orbit is a portfolio project, designed and built in Toronto. The demo world is Canadian on purpose: a studio on Shaw Street, clients in Montréal, Vancouver, Halifax and Calgary, prices in dollars and taxes that change at the provincial line.</p>
        <p>The approval rules, the tax maths and the role checks each live in one function, with tests for the money.</p>
        <h2>what’s next</h2>
        <ul className="roadmap">
          {next.map(([a, b]) => <li key={a}><span>{a}</span><span className="muted">{b}</span></li>)}
        </ul>
        <p><Link className="text-link" href="/contact">get in touch</Link></p>
      </article>
    </>
  );
}
