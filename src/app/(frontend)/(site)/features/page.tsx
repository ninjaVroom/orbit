import type { Metadata } from 'next';
import Link from 'next/link';
import { FeaturePics } from './pics';

export const metadata: Metadata = { title: 'features', description: 'The board, the client portal, invoices with Canadian sales tax, and roles the server checks.' };

const keys: [string, string][] = [
  ['Ctrl K', 'search projects, clients and invoices from anywhere'],
  ['Esc', 'close the task drawer and land back where you were'],
  ['Arrow keys', 'move between the three views on the home page'],
  ['Tab', 'every card has a move menu, so the board works without a mouse'],
];

export default function Features() {
  return (
    <>
      <header className="container page-hero">
        <h1>what’s in orbit</h1>
        <p className="lead muted">Four parts that share one record: the board, the portal, the invoice and the roles that guard them.</p>
      </header>
      <FeaturePics />
      <section className="container feature" aria-labelledby="keys-h">
        <div className="feature-text" data-reveal>
          <h2 id="keys-h">the little things</h2>
          <p className="muted">Toasts that say what happened and offer undo. A layout that holds on a phone. Keys for people who live in it.</p>
        </div>
        <div className="feature-pic feature-pic--plain" data-reveal>
          <table className="kbd-table">
            <caption className="visually-hidden">Keyboard shortcuts</caption>
            <tbody>{keys.map(([k, v]) => <tr key={k}><th scope="row"><kbd>{k}</kbd></th><td>{v}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="close" aria-labelledby="fclose-h">
        <div className="container close-inner" data-reveal>
          <h2 id="fclose-h">open the board</h2>
          <p className="lead">Drag a card, try to finish one the client hasn’t approved, and watch it refuse.</p>
          <Link className="btn btn--lg btn--ghost close-btn" href="/app/projects/atlas">open the atlas board</Link>
        </div>
      </section>
    </>
  );
}
