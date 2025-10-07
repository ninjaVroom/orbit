import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConfig, type Access, type CollectionConfig, type Field } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { endpoints, seedIfEmpty } from './payload/orbit';
import { migrations } from './migrations/index';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const role = (...roles: string[]): Access => ({ req }) => !!req.user && roles.includes(req.user.role as string);
const staff = role('owner', 'manager', 'member');

// The workflow record. Clients read it only through /api/orbit/state, which filters it for them.
// Writes go through /api/orbit/action, which runs the same reducer and rules as the browser.
// The owner can also edit records by hand in /admin.
const record = (slug: string, title: string, fields: Field[]): CollectionConfig => ({
  slug,
  admin: { useAsTitle: title, group: 'record' },
  access: { read: staff, create: role('owner'), update: role('owner'), delete: role('owner') },
  fields: [{ name: 'id', type: 'text', required: true }, ...fields],
});
const text = (name: string, required = false): Field => ({ name, type: 'text', required });
const select = (name: string, options: string[]): Field => ({ name, type: 'select', options, required: true });
const json = (name: string): Field => ({ name, type: 'json', required: true, defaultValue: [] });

export default buildConfig({
  // A running production server must have its own secret; dev and the build itself can use a placeholder.
  secret: process.env.PAYLOAD_SECRET || (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build'
    ? (() => { throw new Error('Set PAYLOAD_SECRET'); })()
    : 'orbit-dev-only-secret'),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || 'postgres://orbit:orbit@127.0.0.1:54329/orbit' },
    prodMigrations: migrations,
  }),
  admin: { user: 'users', meta: { titleSuffix: ' · orbit admin' } },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  endpoints,
  onInit: seedIfEmpty,
  collections: [
    {
      slug: 'users',
      auth: true,
      admin: { useAsTitle: 'name' },
      // Demo accounts are seeded and fixed: nobody can change them, so nobody can lock the demo out.
      access: {
        admin: ({ req }) => ['owner', 'manager'].includes(req.user?.role as string),
        read: ({ req }) => (req.user ? (req.user.role === 'client' ? { id: { equals: req.user.id } } : true) : false),
        create: () => false, update: () => false, delete: () => false,
      },
      fields: [
        { name: 'personId', type: 'text', required: true, unique: true },
        text('name', true),
        select('role', ['owner', 'manager', 'member', 'client']),
      ],
    },
    record('tasks', 'title', [
      text('projectId', true), text('title', true),
      select('status', ['todo', 'progress', 'review', 'done']),
      select('priority', ['low', 'medium', 'high']),
      text('assignee', true), text('due', true), text('deliverableId'), json('comments'),
    ]),
    record('deliverables', 'title', [
      text('projectId', true), text('taskId', true), text('title', true),
      { name: 'version', type: 'number', required: true },
      select('state', ['waiting', 'approved', 'changes']),
      text('summary', true), text('file', true), json('history'), json('invoiceLines'),
    ]),
    record('invoices', 'id', [
      text('clientId', true), text('projectId', true),
      select('state', ['draft', 'sent', 'paid', 'void']),
      text('issued'), text('due'), text('paidOn'), text('method'), json('lines'),
    ]),
    record('activity', 'text', [text('at', true), text('who', true), text('text', true), text('projectId', true)]),
  ],
});
