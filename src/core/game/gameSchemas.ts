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

export const startingClassJobIdSchema = z.enum([
  'arcanist',
  'archer',
  'conjurer',
  'gladiator',
  'lancer',
  'marauder',
  'pugilist',
  'thaumaturge',
]);

export type StartingClassJobId = z.infer<typeof startingClassJobIdSchema>;

interface StartingClassJobOption {
  value: StartingClassJobId;
  label: string;
  startingCityId: StartingCityId;
}

export const STARTING_CLASS_JOB_OPTIONS = [
  {
    value: 'archer',
    label: 'Archer',
    startingCityId: 'gridania',
  },
  {
    value: 'conjurer',
    label: 'Conjurer',
    startingCityId: 'gridania',
  },
  {
    value: 'lancer',
    label: 'Lancer',
    startingCityId: 'gridania',
  },
  {
    value: 'arcanist',
    label: 'Arcanist',
    startingCityId: 'limsa-lominsa',
  },
  {
    value: 'marauder',
    label: 'Marauder',
    startingCityId: 'limsa-lominsa',
  },
  {
    value: 'gladiator',
    label: 'Gladiator',
    startingCityId: 'uldah',
  },
  {
    value: 'pugilist',
    label: 'Pugilist',
    startingCityId: 'uldah',
  },
  {
    value: 'thaumaturge',
    label: 'Thaumaturge',
    startingCityId: 'uldah',
  },
] satisfies ReadonlyArray<StartingClassJobOption>;
