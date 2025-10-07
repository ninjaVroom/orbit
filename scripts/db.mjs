// A real local Postgres with nothing to install: `npm run db`, leave it running, then `npm run dev`.
// Data lives in .data/pg. For a hosted database, skip this and set DATABASE_URL instead.
import { existsSync } from 'node:fs';
import EmbeddedPostgres from 'embedded-postgres';

const pg = new EmbeddedPostgres({ databaseDir: '.data/pg', user: 'orbit', password: 'orbit', port: 54329, persistent: true });
if (!existsSync('.data/pg/PG_VERSION')) await pg.initialise();
await pg.start();
try { await pg.createDatabase('orbit'); } catch { /* already there */ }
console.log('Postgres ready at postgres://orbit:orbit@127.0.0.1:54329/orbit (Ctrl C to stop)');
const stop = async () => { await pg.stop(); process.exit(0); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
