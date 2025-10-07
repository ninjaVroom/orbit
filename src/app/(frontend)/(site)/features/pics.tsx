'use client';
import { Board, InvoiceDoc, PortalHome, ReviewPanel } from '@/components/screens';
import { Frame } from '@/components/ui';

export function FeaturePics() {
  return (
    <>
      <section className="container feature feature--wide" aria-labelledby="f1">
        <div className="feature-text" data-reveal>
          <h2 id="f1">projects and tasks</h2>
          <ul>
            <li>A board per project, four columns, drag or use the menu.</li>
            <li>A move that isn’t allowed snaps back and says why.</li>
            <li>Open a task in a drawer with its thread and its portal state.</li>
          </ul>
        </div>
        <div className="feature-pic" data-reveal>
          <Frame width={1320} label="The Atlas project board"><div className="mini-app"><Board projectId="atlas" highlight="t5" /></div></Frame>
        </div>
      </section>

      <section className="container feature" aria-labelledby="f2">
        <div className="feature-text" data-reveal>
          <h2 id="f2">the client portal</h2>
          <p className="muted">Clients get their own front door, with your studio’s name on it. They see their project, their reviews and their invoices. Versions stack up with every decision kept.</p>
        </div>
        <div className="feature-pic" data-reveal>
          <Frame width={900} label="Morgan's portal"><div className="mini-portal"><PortalHome clientId="atlas" /></div></Frame>
        </div>
      </section>

      <section className="container feature feature--flip" aria-labelledby="f3">
        <div className="feature-text" data-reveal>
          <h2 id="f3">reviews with a paper trail</h2>
          <p className="muted">Approve, or ask for changes with a required note. Each decision carries a name and a time, and lands on the board as it happens.</p>
        </div>
        <div className="feature-pic" data-reveal>
          <Frame width={1000} label="A review in the portal"><ReviewPanel deliverableId="d-atlas-v3" /></Frame>
        </div>
      </section>

      <section className="container feature" aria-labelledby="f4">
        <div className="feature-text" data-reveal>
          <h2 id="f4">invoices, in Canadian dollars</h2>
          <ul>
            <li>Approved work becomes line items.</li>
            <li>HST in Ontario and the Atlantic provinces, GST and QST in Quebec, GST elsewhere.</li>
            <li>Draft, sent, paid, overdue. Print to PDF.</li>
          </ul>
        </div>
        <div className="feature-pic" data-reveal>
          <Frame width={820} label="An invoice for a Montréal client with GST and QST"><InvoiceDoc invoiceId="INV-2026-040" /></Frame>
        </div>
      </section>

      <section id="roles" className="container feature feature--flip" aria-labelledby="f5">
        <div className="feature-text" data-reveal>
          <h2 id="f5">team and roles</h2>
          <p className="muted">Owner, manager, member, client. Members move their own cards. Only the owner sends invoices or sees margins. Clients never see drafts or internal threads. One function decides, so the buttons and the rules can’t drift apart.</p>
        </div>
        <div className="feature-pic feature-pic--plain" data-reveal>
          <ul className="role-rows">
            <li><strong>Alex</strong><span>owner</span><span className="muted">everything, including fees and margins</span></li>
            <li><strong>Taylor</strong><span>manager</span><span className="muted">projects, tasks, viewing invoices</span></li>
            <li><strong>Jamie</strong><span>member</span><span className="muted">their own tasks and projects</span></li>
            <li><strong>Morgan</strong><span>client</span><span className="muted">the Atlas portal, nothing else</span></li>
          </ul>
        </div>
      </section>
    </>
  );
}
