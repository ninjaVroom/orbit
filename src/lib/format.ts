import { DEMO_TODAY, people } from './data';

const cad = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });
const cad0 = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });

export const money = (cents: number) => cad.format(cents / 100);
export const money0 = (cents: number) => cad0.format(cents / 100);

const d = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00` : iso);
export const date = (iso: string) => d(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
export const day = (iso: string) => d(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
export const time = (iso: string) =>
  `${day(iso)}, ${d(iso).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })} ET`;

export const addDays = (iso: string, n: number) => {
  const x = d(iso);
  x.setDate(x.getDate() + n);
  return x.toISOString().slice(0, 10);
};
export const daysFromToday = (iso: string) => Math.round((d(iso).getTime() - d(DEMO_TODAY).getTime()) / 864e5);

export const person = (id: string) => people.find((p) => p.id === id)!;
export const first = (id: string) => person(id).name.split(' ')[0];
export const initials = (id: string) => person(id).name.split(' ').map((w) => w[0]).join('');

export function dueLabel(iso: string) {
  const n = daysFromToday(iso);
  if (n === 0) return 'due today';
  if (n === 1) return 'due tomorrow';
  if (n < 0) return `${-n} ${n === -1 ? 'day' : 'days'} late`;
  return `due ${day(iso)}`;
}
