'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { studio } from '@/lib/data';
import { useStore } from '@/lib/store';
import { Avatar } from './ui';
import { Motion } from './Motion';
import { Logo } from './Icon';

const tabs = [
  { href: '/portal', label: 'overview' },
  { href: '/portal/reviews', label: 'reviews' },
  { href: '/portal/invoices', label: 'invoices' },
];

export function PortalShell({ children }: { children: ReactNode }) {
  const { state, dispatch, ready } = useStore();
  const path = usePathname();
  // The portal is Morgan's view. Opening it from the workspace signs you in as Morgan.
  useEffect(() => { if (ready && state.persona !== 'morgan') dispatch({ type: 'persona', id: 'morgan' }); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps -- once, on arrival
  const waiting = state.deliverables.filter((d) => d.projectId === 'atlas' && d.state === 'waiting').length;

  return (
    <div className="portal" data-theme="lavender">
      <div className="ribbon">
        <span>You’re Morgan Leblanc from Atlas, a made-up client. Sample data only.</span>
        <Link className="link-btn" href="/app" onClick={() => dispatch({ type: 'persona', id: 'alex' })}>back to the studio as Alex</Link>
      </div>
      <header className="portal-top">
        <div className="container portal-top-row">
          <p className="portal-brand"><span className="record-mark">A</span> Atlas <span className="muted">with {studio.name}</span></p>
          <nav aria-label="Portal" className="portal-tabs">
            {tabs.map((t) => (
              <Link key={t.href} href={t.href} aria-current={path === t.href ? 'page' : undefined}>
                {t.label}{t.label === 'reviews' && waiting > 0 && <span className="tab-count">{waiting}</span>}
              </Link>
            ))}
          </nav>
          <span className="portal-me"><Avatar id="morgan" size={30} /> Morgan</span>
        </div>
      </header>
      <main id="main" className="container portal-main">{children}</main>
      <footer className="container portal-foot muted small">
        <span>Questions? Email Taylor at taylor@northstar.example or call {studio.phone}.</span>
        <span className="portal-powered">runs on <Logo size={16} /></span>
      </footer>
      <Motion />
    </div>
  );
}
