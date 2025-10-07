'use client';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { initials, person } from '@/lib/format';
import type { InvoiceState, Priority, Status } from '@/lib/data';
import { statusName } from '@/lib/store';
import { Icon } from './Icon';

export function Avatar({ id, size = 28 }: { id: string; size?: number }) {
  const p = person(id);
  return (
    <span className={`avatar tone-${p.tone}`} style={{ width: size, height: size, fontSize: size * 0.38 }} title={p.name}>
      {initials(id)}
    </span>
  );
}

export function StatusPill({ status }: { status: Status }) {
  return <span className={`pill pill--${status}`}>{statusName[status]}</span>;
}
export function PriorityPill({ p }: { p: Priority }) {
  return <span className={`pill pill--p-${p}`}>{p}</span>;
}
export function InvoicePill({ state, overdue }: { state: InvoiceState; overdue?: boolean }) {
  const s = overdue ? 'overdue' : state;
  return <span className={`pill pill--inv-${s}`}>{s}</span>;
}

/* Toasts: one live region, newest on top, auto-dismiss after 5s. */
type Toast = { id: number; text: string; tone?: 'error' | 'ok'; action?: { label: string; run: () => void } };
const ToastCtx = createContext<(t: Omit<Toast, 'id'>) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setList((l) => [{ ...t, id }, ...l].slice(0, 3));
    setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 5000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {list.map((t) => (
          <div key={t.id} className={`toast ${t.tone === 'error' ? 'toast--error' : ''}`}>
            {t.tone === 'error' ? <Icon name="x" size={16} /> : <Icon name="check" size={16} />}
            <span>{t.text}</span>
            {t.action && (
              <button className="link-btn" onClick={() => { t.action!.run(); setList((l) => l.filter((x) => x.id !== t.id)); }}>
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/** Renders a full-size screen and scales it to fit its box. Used for product pictures on the marketing pages. */
export function Frame({ width = 1200, children, label }: { width?: number; children: ReactNode; label: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [h, setH] = useState<number>();
  useLayoutEffect(() => {
    const o = outer.current!, i = inner.current!;
    const fit = () => {
      const s = o.clientWidth / width;
      setScale(s);
      setH(i.offsetHeight * s);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={outer} className="frame" style={{ height: h }} role="img" aria-label={label}>
      <div ref={inner} className="frame-inner" data-theme="lavender" style={{ width, transform: `scale(${scale})` }} inert>
        {children}
      </div>
    </div>
  );
}

/** Count up to a number when it first comes into view, and tween on later changes. */
export function Tween({ value, format = (n: number) => String(Math.round(n)) }: { value: number; format?: (n: number) => string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(value); from.current = value; return; }
    const start = performance.now(), a = from.current;
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / 600);
      const e = 1 - Math.pow(1 - k, 3);
      setShown(a + (value - a) * e);
      if (k < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="num">{format(shown)}</span>;
}
