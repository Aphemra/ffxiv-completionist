import * as z from 'zod';

export const GRAND_COMPANY_IDS = [
  'twin-adder',
  'maelstrom',
  'immortal-flames',
] as const;

export const grandCompanyIdSchema = z.enum(GRAND_COMPANY_IDS);

export type GrandCompanyId = z.infer<typeof grandCompanyIdSchema>;

export interface GrandCompanyOption {
  id: GrandCompanyId;
  name: string;
}

export const GRAND_COMPANY_OPTIONS: readonly GrandCompanyOption[] = [
  {
    id: 'twin-adder',
    name: 'Order of the Twin Adder',
  },
  {
    id: 'maelstrom',
    name: 'Maelstrom',
  },
  {
    id: 'immortal-flames',
    name: 'Immortal Flames',
  },
];
