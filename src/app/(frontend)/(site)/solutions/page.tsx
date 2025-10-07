import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'solutions', description: 'orbit for creative studios, marketing agencies, web teams and production companies.' };

const verticals = [
  { name: 'creative studios', line: 'Moodboards, rounds of feedback, final files, sign-off.', demo: 'Atlas, a Montréal coffee roaster', href: '/app/projects/atlas' },
  { name: 'marketing agencies', line: 'Campaign assets, approvals per channel, French and English versions.', demo: 'Nova Outdoor, Halifax', href: '/app/projects/nova' },
  { name: 'web teams', line: 'Prototypes, staging links in the portal, launch sign-off.', demo: 'Luma Commerce, Vancouver', href: '/app/projects/luma' },
  { name: 'production companies', line: 'Cuts, versions, notes with a name and a time, delivery.', demo: 'Echo, a Calgary podcast network', href: '/app/projects/echo' },
];

export default function Solutions() {
  return (
    <>
      <header className="container page-hero">
        <h1>made for studios that ship for clients</h1>
        <p className="lead muted">Four kinds of work, one handover. Each has a project in the demo you can open.</p>
      </header>
      <section className="container" aria-label="Kinds of studio">
        <ul className="verticals">
          {verticals.map((v) => (
            <li key={v.name} data-reveal>
              <h2>{v.name}</h2>
              <p className="muted">{v.line}</p>
              <Link className="text-link" href={v.href}>open {v.demo}</Link>
            </li>
          ))}
        </ul>
      </section>
      <figure className="container">
        <div className="photo-band">
          <img src="/images/mockups/studio-work-tinted.jpg" alt="A studio table covered in printed layouts and colour swatches" data-parallax="0.12" />
          <figcaption>the handover is where client work stalls</figcaption>
        </div>
      </figure>
      <p className="container statement" data-reveal>every studio has a handover. orbit is built around it.</p>
    </>
  );
}
