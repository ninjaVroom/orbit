// Northstar Studio: a made-up Toronto studio. Every person, client and number here is sample data.
import type { Province } from './tax';

export const DEMO_TODAY = '2026-11-10';

export type Role = 'owner' | 'manager' | 'member' | 'client';
export type Status = 'todo' | 'progress' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export type Person = { id: string; name: string; role: Role; title: string; city: string; tone: number; clientId?: string };
export type Client = {
  id: string; name: string; legal: string; city: string; province: Province;
  address: string; contactId: string; email: string; phone: string; since: string; terms: number;
};
export type Comment = { id: string; by: string; at: string; text: string; shared?: boolean };
export type Task = {
  id: string; projectId: string; title: string; status: Status; priority: Priority;
  assignee: string; due: string; deliverableId?: string; comments: Comment[];
};
export type Line = { label: string; cents: number };
export type Decision = { version: number; state: 'sent' | 'approved' | 'changes'; at: string; by: string; note?: string };
export type Deliverable = {
  id: string; projectId: string; taskId: string; title: string; version: number;
  state: 'waiting' | 'approved' | 'changes'; summary: string; file: string; history: Decision[]; invoiceLines: Line[];
};
export type Milestone = { label: string; due: string; done: boolean };
export type Project = {
  id: string; name: string; short: string; clientId: string; lead: string; summary: string;
  due: string; feeCents: number; costCents: number; milestones: Milestone[];
};
export type InvoiceState = 'draft' | 'sent' | 'paid' | 'void';
export type Invoice = {
  id: string; clientId: string; projectId: string; state: InvoiceState;
  issued?: string; due?: string; paidOn?: string; method?: string; lines: Line[];
};
export type Activity = { id: string; at: string; who: string; text: string; projectId: string };

export const studio = {
  name: 'Northstar Studio',
  address: '180 Shaw Street, Unit 3, Toronto, ON M6J 2W5',
  phone: '416-555-0142',
  gst: '81234 5678 RT0001',
  email: 'hello@northstar.example',
};

export const people: Person[] = [
  { id: 'alex', name: 'Alex Tremblay', role: 'owner', title: 'Founder, creative director', city: 'Toronto', tone: 0 },
  { id: 'taylor', name: 'Taylor Singh', role: 'manager', title: 'Project manager', city: 'Toronto', tone: 1 },
  { id: 'jamie', name: 'Jamie Nguyen', role: 'member', title: 'Senior designer', city: 'Toronto', tone: 2 },
  { id: 'riley', name: 'Riley Okafor', role: 'member', title: 'Front-end developer', city: 'Hamilton', tone: 3 },
  { id: 'morgan', name: 'Morgan Leblanc', role: 'client', title: 'Marketing director, Atlas', city: 'Montréal', tone: 4, clientId: 'atlas' },
  { id: 'priya', name: 'Priya Sandhu', role: 'client', title: 'Head of e-commerce, Luma', city: 'Vancouver', tone: 1, clientId: 'luma' },
  { id: 'sam', name: 'Sam MacDonald', role: 'client', title: 'Brand lead, Nova', city: 'Halifax', tone: 2, clientId: 'nova' },
  { id: 'dana', name: 'Dana Whitehorse', role: 'client', title: 'Executive producer, Echo', city: 'Calgary', tone: 3, clientId: 'echo' },
];

export const clients: Client[] = [
  { id: 'atlas', name: 'Atlas', legal: 'Atlas Torréfaction inc.', city: 'Montréal', province: 'QC',
    address: '5455 avenue de Gaspé, local 610, Montréal, QC H2T 3B3', contactId: 'morgan',
    email: 'morgan@atlas.example', phone: '514-555-0188', since: '2026-03-02', terms: 30 },
  { id: 'luma', name: 'Luma Commerce', legal: 'Luma Commerce Ltd.', city: 'Vancouver', province: 'BC',
    address: '1050 Homer Street, Suite 400, Vancouver, BC V6B 2W9', contactId: 'priya',
    email: 'priya@luma.example', phone: '604-555-0117', since: '2025-09-15', terms: 30 },
  { id: 'nova', name: 'Nova Outdoor', legal: 'Nova Outdoor Co.', city: 'Halifax', province: 'NS',
    address: '1701 Hollis Street, Halifax, NS B3J 3M8', contactId: 'sam',
    email: 'sam@nova.example', phone: '902-555-0163', since: '2026-06-01', terms: 15 },
  { id: 'echo', name: 'Echo', legal: 'Echo Podcast Network Inc.', city: 'Calgary', province: 'AB',
    address: '815 10 Avenue SW, Calgary, AB T2R 0B4', contactId: 'dana',
    email: 'dana@echo.example', phone: '403-555-0129', since: '2026-01-20', terms: 30 },
];

export const projects: Project[] = [
  { id: 'atlas', name: 'Atlas brand identity', short: 'Atlas', clientId: 'atlas', lead: 'taylor',
    summary: 'A new identity for a Montréal coffee roaster opening two cafés in the Mile End.',
    due: '2026-11-20', feeCents: 1850000, costCents: 1120000,
    milestones: [
      { label: 'Discovery and moodboard', due: '2026-09-18', done: true },
      { label: 'Logo routes', due: '2026-10-09', done: true },
      { label: 'Final presentation sign-off', due: '2026-11-12', done: false },
      { label: 'Guidelines and file handover', due: '2026-11-20', done: false },
    ] },
  { id: 'luma', name: 'Luma checkout redesign', short: 'Luma', clientId: 'luma', lead: 'riley',
    summary: 'A faster, accessible checkout for a Vancouver home-goods store.',
    due: '2026-12-04', feeCents: 2600000, costCents: 1700000,
    milestones: [
      { label: 'Checkout audit', due: '2026-10-02', done: true },
      { label: 'Prototype review', due: '2026-11-13', done: false },
      { label: 'Launch on staging', due: '2026-12-04', done: false },
    ] },
  { id: 'nova', name: 'Nova first snow campaign', short: 'Nova', clientId: 'nova', lead: 'jamie',
    summary: 'Winter campaign assets for social, email and in-store across Atlantic Canada.',
    due: '2026-12-11', feeCents: 1200000, costCents: 760000,
    milestones: [
      { label: 'Campaign concept', due: '2026-10-20', done: true },
      { label: 'Social set A', due: '2026-11-17', done: false },
      { label: 'In-store posters to print', due: '2026-12-11', done: false },
    ] },
  { id: 'echo', name: 'Echo season 3 launch', short: 'Echo', clientId: 'echo', lead: 'taylor',
    summary: 'Show art, trailer cut and a launch page for a Calgary podcast network.',
    due: '2026-11-27', feeCents: 940000, costCents: 610000,
    milestones: [
      { label: 'Show art', due: '2026-10-16', done: true },
      { label: 'Trailer master cut', due: '2026-11-19', done: false },
      { label: 'Launch page live', due: '2026-11-27', done: false },
    ] },
];

let n = 0;
const t = (projectId: string, title: string, status: Status, priority: Priority, assignee: string, due: string, extra: Partial<Task> = {}): Task =>
  ({ id: `t${++n}`, projectId, title, status, priority, assignee, due, comments: [], ...extra });

export const tasks: Task[] = [
  t('atlas', 'Packaging dielines for the 340 g bag', 'todo', 'medium', 'jamie', '2026-11-18'),
  t('atlas', 'Bilingual signage, French first', 'todo', 'high', 'jamie', '2026-11-19'),
  t('atlas', 'Export brand guidelines PDF', 'progress', 'medium', 'riley', '2026-11-16'),
  t('atlas', 'Café menu board layouts', 'progress', 'low', 'jamie', '2026-11-17'),
  t('atlas', 'Final presentation v3', 'review', 'high', 'jamie', '2026-11-12', {
    deliverableId: 'd-atlas-v3',
    comments: [
      { id: 'c1', by: 'taylor', at: '2026-11-09T09:24', text: 'v3 is in the portal. Morgan said she would look before her Thursday board meeting.' },
      { id: 'c2', by: 'jamie', at: '2026-11-09T10:02', text: 'Swapped the wordmark kerning on slide 14 like she asked on v2.' },
    ],
  }),
  t('atlas', 'Logo routes A, B and C', 'done', 'high', 'jamie', '2026-10-09'),
  t('atlas', 'Moodboard and discovery notes', 'done', 'medium', 'alex', '2026-09-18'),
  t('atlas', 'Colour system with print specs', 'done', 'medium', 'jamie', '2026-10-23'),

  t('luma', 'Address autocomplete with Canada Post lookup', 'progress', 'high', 'riley', '2026-11-14'),
  t('luma', 'Checkout prototype v2', 'review', 'high', 'riley', '2026-11-13', { deliverableId: 'd-luma-v2' }),
  t('luma', 'Error states for declined cards', 'todo', 'medium', 'riley', '2026-11-20'),
  t('luma', 'Checkout audit report', 'done', 'medium', 'taylor', '2026-10-02'),
  t('luma', 'French copy pass for Quebec shoppers', 'todo', 'low', 'taylor', '2026-11-25'),

  t('nova', 'Social set A, six frames', 'progress', 'high', 'jamie', '2026-11-17', { deliverableId: 'd-nova-a' }),
  t('nova', 'Email header for the launch send', 'todo', 'medium', 'jamie', '2026-11-24'),
  t('nova', 'Campaign concept deck', 'done', 'high', 'alex', '2026-10-20'),

  t('echo', 'Trailer master cut', 'review', 'high', 'taylor', '2026-11-19', { deliverableId: 'd-echo-cut' }),
  t('echo', 'Launch page build', 'progress', 'medium', 'riley', '2026-11-25'),
  t('echo', 'Season 3 show art', 'done', 'medium', 'jamie', '2026-10-16'),
];

export const deliverables: Deliverable[] = [
  { id: 'd-atlas-v3', projectId: 'atlas', taskId: 't5', title: 'Final presentation', version: 3, state: 'waiting',
    summary: '18 slides, the chosen route B applied to cups, bags, signage and the website.',
    file: 'atlas-final-presentation-v3.pdf',
    history: [
      { version: 1, state: 'sent', at: '2026-10-21T15:10', by: 'taylor' },
      { version: 1, state: 'changes', at: '2026-10-23T11:40', by: 'morgan', note: 'Route B, but warmer. Can we try the cream from the bags?' },
      { version: 2, state: 'sent', at: '2026-11-02T16:05', by: 'taylor' },
      { version: 2, state: 'changes', at: '2026-11-06T14:32', by: 'morgan', note: 'Love it. The wordmark spacing on slide 14 feels loose.' },
      { version: 3, state: 'sent', at: '2026-11-09T09:20', by: 'taylor' },
    ],
    invoiceLines: [
      { label: 'Brand identity, final stage', cents: 480000 },
      { label: 'Final file preparation and export', cents: 120000 },
    ] },
  { id: 'd-luma-v2', projectId: 'luma', taskId: 't10', title: 'Checkout prototype', version: 2, state: 'waiting',
    summary: 'Clickable prototype, three steps to two, with Apple Pay and Interac Debit.',
    file: 'luma-checkout-prototype-v2.fig',
    history: [{ version: 2, state: 'sent', at: '2026-11-08T12:00', by: 'riley' }],
    invoiceLines: [{ label: 'Checkout prototype milestone', cents: 650000 }] },
  { id: 'd-nova-a', projectId: 'nova', taskId: 't14', title: 'Social set A', version: 1, state: 'changes',
    summary: 'Six frames for Instagram and TikTok, first snow on the Halifax waterfront.',
    file: 'nova-social-set-a-v1.zip',
    history: [
      { version: 1, state: 'sent', at: '2026-11-03T10:00', by: 'jamie' },
      { version: 1, state: 'changes', at: '2026-11-05T09:15', by: 'sam', note: 'Frame 4 needs the French tagline for New Brunswick.' },
    ],
    invoiceLines: [{ label: 'Social set A', cents: 300000 }] },
  { id: 'd-echo-cut', projectId: 'echo', taskId: 't17', title: 'Trailer master cut', version: 1, state: 'waiting',
    summary: '90 seconds, mixed to -16 LUFS for podcast apps.',
    file: 'echo-s3-trailer-master.mp4',
    history: [{ version: 1, state: 'sent', at: '2026-11-07T17:30', by: 'taylor' }],
    invoiceLines: [{ label: 'Trailer edit and mix', cents: 280000 }] },
];

export const invoices: Invoice[] = [
  { id: 'INV-2026-036', clientId: 'luma', projectId: 'luma', state: 'paid', issued: '2026-09-15', due: '2026-10-15', paidOn: '2026-10-09', method: 'EFT',
    lines: [{ label: 'Deposit, 30%', cents: 780000 }] },
  { id: 'INV-2026-037', clientId: 'atlas', projectId: 'atlas', state: 'paid', issued: '2026-09-01', due: '2026-10-01', paidOn: '2026-09-24', method: 'Interac e-Transfer',
    lines: [{ label: 'Deposit', cents: 730000 }] },
  { id: 'INV-2026-038', clientId: 'echo', projectId: 'echo', state: 'sent', issued: '2026-10-05', due: '2026-11-04',
    lines: [{ label: 'Season 3 show art', cents: 320000 }, { label: 'Usage licence, 2 years', cents: 80000 }] },
  { id: 'INV-2026-039', clientId: 'nova', projectId: 'nova', state: 'sent', issued: '2026-10-28', due: '2026-11-12',
    lines: [{ label: 'Campaign concept', cents: 450000 }] },
  { id: 'INV-2026-040', clientId: 'atlas', projectId: 'atlas', state: 'sent', issued: '2026-10-12', due: '2026-11-11',
    lines: [{ label: 'Logo routes and colour system', cents: 520000 }] },
  { id: 'INV-2026-041', clientId: 'luma', projectId: 'luma', state: 'draft',
    lines: [{ label: 'Checkout audit report', cents: 300000 }] },
];

export const activity: Activity[] = [
  { id: 'a1', at: '2026-11-09T09:20', who: 'taylor', text: 'published Final presentation v3 to the Atlas portal', projectId: 'atlas' },
  { id: 'a2', at: '2026-11-08T12:00', who: 'riley', text: 'published Checkout prototype v2 to the Luma portal', projectId: 'luma' },
  { id: 'a3', at: '2026-11-07T17:30', who: 'taylor', text: 'published Trailer master cut to the Echo portal', projectId: 'echo' },
  { id: 'a4', at: '2026-11-05T09:15', who: 'sam', text: 'asked for changes on Social set A', projectId: 'nova' },
];

export const personas = [
  { id: 'alex', label: 'Alex, the owner', home: '/app' },
  { id: 'taylor', label: 'Taylor, a project manager', home: '/app' },
  { id: 'jamie', label: 'Jamie, a designer', home: '/app' },
  { id: 'morgan', label: 'Morgan, a client', home: '/portal' },
] as const;

// Demo sign-ins. The password is public on purpose: these accounts exist so anyone can try each role.
export const DEMO_PASSWORD = 'orbit-demo-2026';
export const demoEmail = (id: string) =>
  clients.find((c) => c.contactId === id)?.email ?? `${id}@northstar.example`;
