// Canadian sales tax on services, by the client's province (place of supply).
// provincial PST on services (BC, SK, MB) is skipped; most design and dev services are exempt there.

export type Province =
  | 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NS' | 'NT' | 'NU' | 'ON' | 'PE' | 'QC' | 'SK' | 'YT';

export const provinceName: Record<Province, string> = {
  AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador', NS: 'Nova Scotia', NT: 'Northwest Territories',
  NU: 'Nunavut', ON: 'Ontario', PE: 'Prince Edward Island', QC: 'Quebec',
  SK: 'Saskatchewan', YT: 'Yukon',
};

type Rate = { label: string; rate: number };

const HST: Partial<Record<Province, Rate>> = {
  ON: { label: 'HST 13%', rate: 0.13 },
  NS: { label: 'HST 14%', rate: 0.14 },
  NB: { label: 'HST 15%', rate: 0.15 },
  NL: { label: 'HST 15%', rate: 0.15 },
  PE: { label: 'HST 15%', rate: 0.15 },
};

export function taxRates(p: Province): Rate[] {
  const hst = HST[p];
  if (hst) return [hst];
  if (p === 'QC') return [{ label: 'GST 5%', rate: 0.05 }, { label: 'QST 9.975%', rate: 0.09975 }];
  return [{ label: 'GST 5%', rate: 0.05 }];
}

/** All money is integer cents. Each tax is rounded half-up on its own, as it is printed. */
export function totals(lines: { cents: number }[], p: Province) {
  const subtotal = lines.reduce((s, l) => s + l.cents, 0);
  const taxes = taxRates(p).map((t) => ({ label: t.label, cents: Math.round(subtotal * t.rate) }));
  const total = subtotal + taxes.reduce((s, t) => s + t.cents, 0);
  return { subtotal, taxes, total };
}
