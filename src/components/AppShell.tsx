'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { clients, people, personas, projects, studio } from '@/lib/data';
import { person } from '@/lib/format';
import { useStore } from '@/lib/store';
import { Icon, Logo, type IconName } from './Icon';
import { Avatar } from './ui';
import { Motion } from './Motion';

const nav: { href: string; label: string; icon: IconName }[] = [
  { href: '/app', label: 'overview', icon: 'home' },
  { href: '/app/projects', label: 'projects', icon: 'folder' },
  { href: '/app/clients', label: 'clients', icon: 'users' },
  { href: '/app/invoices', label: 'invoices', icon: 'receipt' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { state, dispatch } = useStore();
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const me = person(state.persona);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(true); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  const crumb = nav.slice().reverse().find((n) => path.startsWith(n.href))?.label ?? 'overview';

  return (
    <div className="shell">
      <aside className="side" aria-label="Workspace">
        <Link href="/" className="side-logo" aria-label="orbit home"><Logo size={26} /></Link>
        <p className="side-studio">{studio.name}<span>Toronto, ON</span></p>
        <nav className="side-nav" aria-label="Workspace sections">
          {nav.map((n) => {
            const on = n.href === '/app' ? path === '/app' : path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} aria-current={on ? 'page' : undefined}>
                <Icon name={n.icon} /> <span>{n.label}</span>
              </Link>
            );
          })}
          <Link href="/portal" className="side-portal"><Icon name="portal" /> <span>open Morgan’s portal</span></Link>
        </nav>
        <label className="side-me">
          <Avatar id={me.id} size={32} />
          <span className="visually-hidden">Signed in as</span>
          <select value={state.persona} onChange={(e) => {
            const p = personas.find((x) => x.id === e.target.value)!;
            dispatch({ type: 'persona', id: p.id });
            if (p.home !== '/app') router.push(p.home);
          }}>
            {personas.map((p) => <option key={p.id} value={p.id}>{person(p.id).name}</option>)}
          </select>
        </label>
      </aside>

      <div className="shell-main" data-theme="lavender">
        <div className="ribbon">
          <span>Demo workspace. Northstar Studio and everyone in it are made up; every number is sample data.</span>
          <button className="link-btn" onClick={() => dispatch({ type: 'reset' })}>reset demo</button>
        </div>
        <header className="topbar">
          <p className="crumb"><span className="muted">{studio.name} /</span> {crumb}</p>
          <button className="search" onClick={() => setOpen(true)}>
            <Icon name="search" size={18} /> <span>Search or jump to</span> <kbd>Ctrl K</kbd>
          </button>
          <span className="role-chip">{me.name.split(' ')[0]}, {me.role}</span>
        </header>
        <main id="main" className="app-main">
          {me.role === 'client' ? (
            <div className="empty">
              <h1>you don’t have access to this</h1>
              <p className="muted">Morgan is a client, so the agency workspace is off limits. The server would refuse it too.</p>
              <div className="actions">
                <Link className="btn btn--primary" href="/portal">go to the Atlas portal</Link>
                <button className="btn btn--ghost" onClick={() => dispatch({ type: 'persona', id: 'alex' })}>switch to Alex, the owner</button>
              </div>
            </div>
          ) : children}
        </main>
      </div>
      {open && <Palette onClose={() => setOpen(false)} />}
      <Motion />
    </div>
  );
}

function Palette({ onClose }: { onClose: () => void }) {
  const { state } = useStore();
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);

  const items = useMemo(() => [
    ...nav.map((n) => ({ label: n.label, hint: 'page', href: n.href })),
    { label: 'Morgan’s portal', hint: 'page', href: '/portal' },
    ...projects.map((p) => ({ label: p.name, hint: 'project', href: `/app/projects/${p.id}` })),
    ...clients.map((c) => ({ label: `${c.legal}, ${c.city}`, hint: 'client', href: '/app/clients' })),
    ...state.invoices.map((i) => ({ label: i.id, hint: 'invoice', href: `/app/invoices/${i.id}` })),
    ...people.filter((p) => p.role !== 'client').map((p) => ({ label: p.name, hint: 'team', href: '/app' })),
  ], [state.invoices]);
  const list = items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase())).slice(0, 8);

  // Closing is explicit (button, Esc, backdrop) and unmounts the dialog; no reliance on the close event.
  useEffect(() => { const d = ref.current!; if (!d.open) d.showModal(); }, []);
  const go = (href: string) => { onClose(); router.push(href); };

  return (
    <dialog ref={ref} className="palette" onCancel={(e) => { e.preventDefault(); onClose(); }} onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } }} onClick={(e) => { if (e.target === ref.current) onClose(); }} aria-label="Search">
      <input autoFocus className="palette-input" placeholder="Search projects, clients, invoices" value={q}
        role="combobox" aria-expanded="true" aria-controls="palette-list" aria-activedescendant={list[sel] ? `pi-${sel}` : undefined}
        onChange={(e) => { setQ(e.target.value); setSel(0); }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, list.length - 1)); }
          if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
          if (e.key === 'Enter' && list[sel]) go(list[sel].href);
        }} />
      <ul id="palette-list" role="listbox" className="palette-list">
        {list.map((i, n) => (
          <li key={i.hint + i.label} id={`pi-${n}`} role="option" aria-selected={n === sel}
            onMouseEnter={() => setSel(n)} onClick={() => go(i.href)}>
            <span>{i.label}</span><span className="muted small">{i.hint}</span>
          </li>
        ))}
        {!list.length && <li className="muted">Nothing matches “{q}”.</li>}
      </ul>
    </dialog>
  );
}
