import type { Metadata } from 'next';
import { Plans } from '@/components/Marketing';

export const metadata: Metadata = { title: 'pricing', description: 'Proposed plans in Canadian dollars. Pay for your team; clients are always free.' };

const groups: [string, [string, string, string, string][]][] = [
  ['work', [['active projects', '2', 'unlimited', 'unlimited'], ['board, list and drawer', 'yes', 'yes', 'yes'], ['file storage', '5 GB', '250 GB', '1 TB']]],
  ['clients', [['client portal users', 'unlimited', 'unlimited', 'unlimited'], ['your logo on the portal', 'no', 'yes', 'yes'], ['reviews with history', 'yes', 'yes', 'yes']]],
  ['money', [['invoices with GST, HST and QST', 'yes', 'yes', 'yes'], ['PDF export', 'yes', 'yes', 'yes'], ['multiple currencies', 'no', 'no', 'CAD and USD']]],
  ['team', [['team members', 'up to 3', 'unlimited', 'unlimited'], ['roles', 'owner, member', 'all four', 'all four'], ['audit log', 'no', '30 days', 'forever']]],
  ['support', [['help', 'email', 'email, next business day', 'a named person'], ['data hosted in', 'Canada', 'Canada', 'Canada']]],
];

const billing = [
  ['period', 'Monthly, or yearly with two months free. Seats are counted on the first of each month.'],
  ['renewal', 'Plans renew on the same date. We email you seven days before a yearly renewal.'],
  ['cancelling', 'Cancel from settings any time. You keep access to the end of the period and can export everything.'],
  ['taxes', 'Prices are in Canadian dollars. GST, HST or QST is added for your province and shown on every receipt.'],
];

export default function Pricing() {
  return (
    <>
      <Plans heading="pricing" as="h1" />
      <section className="container" aria-labelledby="cmp-h">
        <h2 id="cmp-h">compare plans</h2>
        <div className="table-scroll">
          <table className="compare">
            <thead><tr><th scope="col"><span className="visually-hidden">feature</span></th><th scope="col">studio</th><th scope="col">agency</th><th scope="col">network</th></tr></thead>
            {groups.map(([g, rows]) => (
              <tbody key={g}>
                <tr className="group"><th scope="rowgroup" colSpan={4}>{g}</th></tr>
                {rows.map(([f, ...v]) => <tr key={f}><th scope="row">{f}</th>{v.map((x, i) => <td key={i}>{x}</td>)}</tr>)}
              </tbody>
            ))}
          </table>
        </div>
      </section>
      <section className="container billing" aria-label="Billing terms">
        {billing.map(([h, p]) => <div key={h} data-reveal><h3>{h}</h3><p>{p}</p></div>)}
      </section>
    </>
  );
}
