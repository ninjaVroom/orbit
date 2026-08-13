// Run: npm test
import assert from 'node:assert/strict';
import { totals, taxRates } from './tax.ts';

const lines = [{ cents: 240000 }, { cents: 60000 }]; // $3,000.00

const on = totals(lines, 'ON');
assert.equal(on.subtotal, 300000);
assert.deepEqual(on.taxes, [{ label: 'HST 13%', cents: 39000 }]);
assert.equal(on.total, 339000);

const qc = totals(lines, 'QC');
assert.deepEqual(qc.taxes.map((t) => t.cents), [15000, 29925]);
assert.equal(qc.total, 344925);

assert.equal(totals(lines, 'NS').total, 342000);
assert.equal(totals(lines, 'AB').total, 315000);
assert.equal(taxRates('BC').length, 1);

// half-up rounding on odd cents: $0.10 * 9.975% = 0.9975 cents -> 1
assert.equal(totals([{ cents: 10 }], 'QC').taxes[1].cents, 1);
assert.equal(totals([], 'ON').total, 0);

console.log('tax: all checks pass');
