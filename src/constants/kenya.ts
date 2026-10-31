import type { County } from '../types/simulation';

// ------------------------------------------------------------------
// Kenya's 47 counties with IEBC codes and 2025 registered-voter
// totals (IEBC gazette, total 22,102,532).
// ------------------------------------------------------------------

export const KENYA_COUNTIES: County[] = [
  { code: '001', name: 'Mombasa', registeredVoters: 641913 },
  { code: '002', name: 'Kwale', registeredVoters: 328253 },
  { code: '003', name: 'Kilifi', registeredVoters: 588602 },
  { code: '004', name: 'Tana River', registeredVoters: 141096 },
  { code: '005', name: 'Lamu', registeredVoters: 81453 },
  { code: '006', name: 'Taita Taveta', registeredVoters: 181827 },
  { code: '007', name: 'Garissa', registeredVoters: 201473 },
  { code: '008', name: 'Wajir', registeredVoters: 207758 },
  { code: '009', name: 'Mandera', registeredVoters: 217030 },
  { code: '010', name: 'Marsabit', registeredVoters: 166912 },
  { code: '011', name: 'Isiolo', registeredVoters: 89504 },
  { code: '012', name: 'Meru', registeredVoters: 772139 },
  { code: '013', name: 'Tharaka–Nithi', registeredVoters: 231932 },
  { code: '014', name: 'Embu', registeredVoters: 334302 },
  { code: '015', name: 'Kitui', registeredVoters: 532758 },
  { code: '016', name: 'Machakos', registeredVoters: 687565 },
  { code: '017', name: 'Makueni', registeredVoters: 479401 },
  { code: '018', name: 'Nyandarua', registeredVoters: 361165 },
  { code: '019', name: 'Nyeri', registeredVoters: 481632 },
  { code: '020', name: 'Kirinyaga', registeredVoters: 376001 },
  { code: '021', name: 'Murang’a', registeredVoters: 620929 },
  { code: '022', name: 'Kiambu', registeredVoters: 1275008 },
  { code: '023', name: 'Turkana', registeredVoters: 238528 },
  { code: '024', name: 'West Pokot', registeredVoters: 220026 },
  { code: '025', name: 'Samburu', registeredVoters: 100014 },
  { code: '026', name: 'Trans Nzoia', registeredVoters: 398981 },
  { code: '027', name: 'Uasin Gishu', registeredVoters: 506138 },
  { code: '028', name: 'Elgeyo/Marakwet', registeredVoters: 213884 },
  { code: '029', name: 'Nandi', registeredVoters: 406288 },
  { code: '030', name: 'Baringo', registeredVoters: 281053 },
  { code: '031', name: 'Laikipia', registeredVoters: 263012 },
  { code: '032', name: 'Nakuru', registeredVoters: 1054856 },
  { code: '033', name: 'Narok', registeredVoters: 398784 },
  { code: '034', name: 'Kajiado', registeredVoters: 463273 },
  { code: '035', name: 'Kericho', registeredVoters: 428067 },
  { code: '036', name: 'Bomet', registeredVoters: 376985 },
  { code: '037', name: 'Kakamega', registeredVoters: 844551 },
  { code: '038', name: 'Vihiga', registeredVoters: 310043 },
  { code: '039', name: 'Bungoma', registeredVoters: 646598 },
  { code: '040', name: 'Busia', registeredVoters: 416756 },
  { code: '041', name: 'Siaya', registeredVoters: 533595 },
  { code: '042', name: 'Kisumu', registeredVoters: 606754 },
  { code: '043', name: 'Homa Bay', registeredVoters: 551071 },
  { code: '044', name: 'Migori', registeredVoters: 469019 },
  { code: '045', name: 'Kisii', registeredVoters: 637010 },
  { code: '046', name: 'Nyamira', registeredVoters: 323283 },
  { code: '047', name: 'Nairobi City', registeredVoters: 2415310 },
];

export const NATIONAL_REGISTERED_VOTERS = KENYA_COUNTIES.reduce(
  (sum, c) => sum + c.registeredVoters,
  0
);

export const SEAT_LABELS: Record<string, string> = {
  president: 'President',
  governor: 'Governor',
  senator: 'Senator',
  women_rep: 'Women Representative',
  mp: 'Member of Parliament',
  mca: 'Member of County Assembly',
};

/** Seats that have a running mate. */
export const SEATS_WITH_RUNNING_MATE = new Set(['president', 'governor']);

export function findCounty(code: string): County | undefined {
  return KENYA_COUNTIES.find((c) => c.code === code);
}
