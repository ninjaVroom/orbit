# Orbit

Samuel Vroom

A project workspace for creative studios, with a separate client portal for reviewing work and invoices.

## Case study

A task can look finished on a board while the client is still asking for changes. Orbit ties the task to its deliverable. Work that needs client approval cannot move to Done until that approval exists. A change request needs a note and returns the task to In progress.

The workspace and client portal read one workflow record. A reducer applies changes in the browser and on the server. The server checks the signed-in person's role before saving, then returns the saved record. Clients receive only their own projects, shared comments and published invoices.

The interface includes project boards, a task drawer, a command palette and invoice views. Cards have a move menu as a keyboard alternative to dragging. The browser can also run the demo without a database and keep its state in localStorage. Changes are shared between tabs.

Invoices use integer cents and province-based tax calculations. Existing checks cover rounding, workflow transitions and permission rules. The studio, people and clients are sample data. Client and project reference records are still defined in code; email delivery, multi-instance write locking and payment collection remain outside this demo.

## Run locally

Use Node.js 22.23.4 or a compatible newer release and npm.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. The browser demo works without a database. To use the Payload backend, run `npm run db` in another terminal, then restart the development server. Local database credentials are demo values in `.env.example`.

```sh
npm test
npm run build
```

For a production server, set a separate `PAYLOAD_SECRET` and `DATABASE_URL`. The local database script stores its files in `.data/`, which is excluded from Git.

## Try the workflow

Open the workspace and portal in separate tabs. Ask for changes as the client, read the note on the board, then approve the deliverable. Switch between the demo people to inspect their permissions. Demo accounts use `orbit-demo-2026`; their addresses and roles are defined in `src/lib/data.ts` and the server seed code.

## Source

`src/lib/record.ts` holds the reducer and workflow rules. `src/payload/orbit.ts` handles server actions and filtered reads. `src/payload.config.ts` defines the collections. `src/lib/tax.ts` contains the invoice calculations.

## Prototype

Figma prototype link pending.
