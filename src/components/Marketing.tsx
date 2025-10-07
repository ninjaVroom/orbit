'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { personas } from '@/lib/data';
import { useStore } from '@/lib/store';
import { Avatar } from './ui';

export function Personas({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const { dispatch } = useStore();
  const router = useRouter();
  return (
    <ul className={`personas personas--${size}`} aria-label="Demo accounts">
      {personas.map((p) => (
        <li key={p.id}>
          <button className="persona" onClick={() => { dispatch({ type: 'persona', id: p.id }); router.push(p.home); }}>
            <Avatar id={p.id} size={size === 'lg' ? 40 : 28} />
            <span>as {p.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

const plans = [
  { name: 'studio', who: 'For a freelancer or a small studio.', month: 0, year: 0,
    gets: ['3 team members', '2 projects'] },
  { name: 'agency', who: 'Most teams start here.', month: 19, year: 16,
    gets: ['Unlimited projects', 'Your logo on the portal'] },
  { name: 'network', who: 'For groups with several studios.', month: 29, year: 24,
    gets: ['Several workspaces', 'Single sign-on'] },
];

export function Plans({ heading = 'plans', as = 'h2' }: { heading?: string; as?: 'h1' | 'h2' }) {
  const [yearly, setYearly] = useState(false);
  const H = as;
  return (
    <section className="plans container" aria-labelledby="plans-h">
      <div className="plans-head">
        <H id="plans-h">{heading}</H>
        <fieldset className="segmented segmented--radio">
          <legend className="visually-hidden">Billing period</legend>
          <label><input type="radio" name="period" checked={!yearly} onChange={() => setYearly(false)} /> monthly</label>
          <label><input type="radio" name="period" checked={yearly} onChange={() => setYearly(true)} /> yearly, two months free</label>
        </fieldset>
      </div>
      <ul className="plan-rows">
        {plans.map((p) => (
          <li key={p.name} className={p.name === 'agency' ? 'is-featured' : ''} data-reveal>
            <h3>{p.name}</h3>
            <div>
              <p>{p.who}</p>
              <ul className="plan-gets">{p.gets.map((g) => <li key={g}>{g}</li>)}</ul>
            </div>
            <p className="plan-price">
              <span className="num">${yearly ? p.year : p.month}</span>
              <span className="muted small">{p.month ? 'a seat, monthly' : 'free'}</span>
            </p>
            <Link className={`btn ${p.name === 'agency' ? 'btn--primary' : 'btn--ghost'}`} href="/login">try it</Link>
          </li>
        ))}
      </ul>
      <p className="muted small plans-note">
        Proposed prices in CAD, plus tax. Clients are free. Nothing is billed.
      </p>
    </section>
  );
}
