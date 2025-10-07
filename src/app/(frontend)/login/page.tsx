'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Logo } from '@/components/Icon';
import { Personas } from '@/components/Marketing';
import { api, useStore } from '@/lib/store';
import { person } from '@/lib/format';

export default function Login() {
  const { mode, refresh } = useStore();
  const router = useRouter();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (mode === 'local') return setNote('The backend isn’t running in this preview. Use a demo account above.');
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const r = await api('/users/login', { email: f.get('email'), password: f.get('password') }).catch(() => null);
    setBusy(false);
    if (!r?.ok) return setNote('That email and password don’t match a demo account.');
    const { user } = (await r.json()) as { user: { personId: string } };
    await refresh();
    router.push(person(user.personId).role === 'client' ? '/portal' : '/app');
  }

  return (
    <main id="main" className="auth site">
      <div className="hero-orbit" aria-hidden="true"><span /><span /></div>
      <div className="auth-card">
        <Link href="/" aria-label="orbit home"><Logo size={30} /></Link>
        <h1>log in</h1>
        <p className="muted">Pick a demo account. Each one sees Northstar Studio differently.</p>
        <Personas size="lg" />
        <p className="auth-or">or with an email</p>
        <form className="auth-form" onSubmit={submit}>
          <div className="field"><label htmlFor="em">email</label><input id="em" name="email" type="email" autoComplete="email" required /></div>
          <div className="field"><label htmlFor="pw">password</label><input id="pw" name="password" type="password" autoComplete="current-password" required /></div>
          <button className="btn btn--ghost" disabled={busy}>{busy ? 'logging in' : 'log in'}</button>
          {note && <p className="muted small" role="status">{note}</p>}
          {mode !== 'local' && <p className="muted small">Demo accounts use the password orbit-demo-2026, for example taylor@northstar.example.</p>}
        </form>
      </div>
    </main>
  );
}
