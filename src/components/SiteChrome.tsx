'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from './Icon';

const links = [
  { href: '/features', label: 'features' },
  { href: '/solutions', label: 'solutions' },
  { href: '/pricing', label: 'pricing' },
  { href: '/about', label: 'about' },
];

export function SiteNav() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(scrollY > 8);
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);
  return (
    <header className={`snav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container snav-row">
        <Link href="/" className="snav-logo" aria-label="orbit home"><Logo size={26} /></Link>
        <nav aria-label="Main" className="snav-links">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={path === l.href ? 'page' : undefined}>{l.label}</Link>
          ))}
        </nav>
        <div className="snav-actions">
          <Link href="/login" className="snav-login">log in</Link>
          <Link href="/login" className="btn btn--primary btn--sm">try the demo</Link>
        </div>
        <details className="snav-menu">
          <summary aria-label="Menu">menu</summary>
          <nav aria-label="Mobile">
            {links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
            <Link href="/login">log in</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="sfoot">
      <div className="container">
        <p className="sfoot-statement" data-reveal>projects, people, clients, payments. from first brief to final invoice.</p>
        <div className="sfoot-cols">
          <nav aria-label="Product">
            <h2>product</h2>
            <Link href="/features">features</Link><Link href="/solutions">solutions</Link>
            <Link href="/pricing">pricing</Link>
          </nav>
          <nav aria-label="Company">
            <h2>company</h2>
            <Link href="/about">why orbit exists</Link><Link href="/contact">get in touch</Link>
          </nav>
          <div className="sfoot-made">
            <Logo size={30} />
            <p className="muted small">Built in Toronto.</p>
          </div>
        </div>
        <div className="sfoot-legal">
          <p>© 2026 orbit. A portfolio project. The demo studio and its numbers are made up.</p>
        </div>
      </div>
    </footer>
  );
}
