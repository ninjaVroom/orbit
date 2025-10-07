'use client';
// One shared record for the board, the portal and the invoices.
// With the backend running, Postgres (through Payload) holds the record: each action shows at once
// here, goes to /api/orbit/action, and the server's answer replaces it. Without a backend, or before
// you sign in, the demo runs on its own in this browser. localStorage keeps tabs in sync either way.
import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { initial, reducer, type Action, type State } from './record';
import { DEMO_PASSWORD, demoEmail } from './data';
import { useToast } from '@/components/ui';

export * from './record';

const KEY = 'orbit-demo-v1';
/** local: no backend. guest: backend up, not signed in (local sandbox). server: Postgres holds the record. */
export type Mode = 'local' | 'guest' | 'server';
type Ctx = { state: State; dispatch: (a: Action) => void; ready: boolean; mode: Mode; refresh: () => Promise<void> };
const StoreCtx = createContext<Ctx | null>(null);

export const api = (path: string, body?: unknown) =>
  fetch(`/api${path}`, body === undefined ? { credentials: 'include' } : {
    method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, local] = useReducer(reducer, undefined, initial);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>('local');
  const loaded = useRef(false);
  const modeRef = useRef<Mode>('local');
  // Server calls run in order, so a sign-in finishes before the next action is sent.
  const chain = useRef<Promise<unknown>>(Promise.resolve());
  const toast = useToast();

  const set = (m: Mode) => { modeRef.current = m; setMode(m); };
  const pull = useCallback(async () => {
    const r = await api('/orbit/state').catch(() => null);
    if (r?.ok) { local({ type: 'load', state: await r.json() }); set('server'); }
    else set(r?.status === 401 ? 'guest' : 'local');
  }, []);
  const queue = (job: () => Promise<unknown>) => { chain.current = chain.current.then(job).catch(() => undefined); };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) local({ type: 'load', state: { ...initial(), ...JSON.parse(raw) } });
    } catch { /* private mode or bad JSON: start from the seed */ }
    loaded.current = true;
    setReady(true);
    queue(pull);
    const onFocus = () => { if (modeRef.current === 'server') queue(pull); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [pull]); // eslint-disable-line react-hooks/exhaustive-deps -- queue is stable in effect

  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
  }, [state]);

  // Keep two open tabs in sync: approve in the portal tab, watch the board tab move.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) local({ type: 'load', state: JSON.parse(e.newValue) });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const dispatch = useCallback((a: Action) => {
    local(a);
    if (a.type === 'load') return;
    queue(async () => {
      if (a.type === 'persona') {
        if (modeRef.current === 'local') return;
        // Switching people signs in as that demo account.
        const r = await api('/users/login', { email: demoEmail(a.id), password: DEMO_PASSWORD });
        if (!r.ok) toast({ text: 'Couldn’t sign in to the demo account.', tone: 'error' });
        return pull();
      }
      if (modeRef.current !== 'server') return;
      const r = await api('/orbit/action', a).catch(() => null);
      if (r?.ok) return local({ type: 'load', state: await r.json() });
      const why = r ? ((await r.json().catch(() => ({}))) as { error?: string }).error : undefined;
      toast({ text: why ?? 'The server didn’t save that. Showing the saved version.', tone: 'error' });
      return pull();
    });
  }, [pull, toast]); // eslint-disable-line react-hooks/exhaustive-deps -- queue is stable

  return <StoreCtx.Provider value={{ state, dispatch, ready, mode, refresh: pull }}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('useStore outside StoreProvider');
  return c;
}

