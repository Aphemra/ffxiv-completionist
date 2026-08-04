import * as z from 'zod';

export const startingCityIdSchema = z.enum([
  'gridania',
  'limsa-lominsa',
  'uldah',
]);

export type StartingCityId = z.infer<typeof startingCityIdSchema>;

interface StartingCityOption {
  value: StartingCityId;
  label: string;
}

export const STARTING_CITY_OPTIONS = [
  {
    value: 'gridania',
    label: 'Gridania',
  },
  {
    value: 'limsa-lominsa',
    label: 'Limsa Lominsa',
  },
  {
    value: 'uldah',
    label: "Ul'dah",
  },
] satisfies ReadonlyArray<StartingCityOption>;
