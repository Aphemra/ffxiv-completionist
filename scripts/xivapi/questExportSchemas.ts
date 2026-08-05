import * as z from 'zod';

import { GRAND_COMPANY_IDS } from '../../src/domain/grandCompanies';
import { questCategorySchema } from '../../src/modules/quests/data/questSchemas';

const nonEmptyStringSchema = z.string().trim().min(1);

const nullableNonEmptyStringSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmedValue = value.trim();

    return trimmedValue.length === 0 ? null : trimmedValue;
  },

  nonEmptyStringSchema.nullable(),
);

const gameDataIdSchema = nonEmptyStringSchema.regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  'IDs must use lowercase kebab-case.',
);

const grandCompanyIdSchema = z.enum(GRAND_COMPANY_IDS);

const coordinateSchema = z.number().finite().min(0).max(100);

const questActorSchema = z.strictObject({
  name: nullableNonEmptyStringSchema,

  title: nullableNonEmptyStringSchema.optional(),

  xivapiRowId: z.number().int().positive().optional(),
});

const questLocationSchema = z.strictObject({
  zone: nullableNonEmptyStringSchema,

  area: nullableNonEmptyStringSchema.optional(),

  x: coordinateSchema.nullable(),
  y: coordinateSchema.nullable(),
});

const questEndpointSchema = z.strictObject({
  npc: questActorSchema.nullable(),
  location: questLocationSchema.nullable(),
});

const questAvailabilitySchema = z.strictObject({
  startingCityIds: z.array(gameDataIdSchema).optional(),

  initialGrandCompanyIds: z.array(grandCompanyIdSchema).optional(),

  currentGrandCompanyIds: z.array(grandCompanyIdSchema).optional(),

  classJobIds: z.array(gameDataIdSchema).optional(),
});

const questRequirementSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('level'),
    level: z.number().int().min(1),
  }),

  z.strictObject({
    type: z.literal('class-job'),

    classJobId: gameDataIdSchema,
    classJobName: nonEmptyStringSchema,

    level: z.number().int().min(1).optional(),
  }),

  z.strictObject({
    type: z.literal('quest'),

    questId: gameDataIdSchema,
    questName: nonEmptyStringSchema.optional(),
  }),

  z.strictObject({
    type: z.literal('item'),

    itemId: gameDataIdSchema,
    itemName: nonEmptyStringSchema,

    quantity: z.number().int().min(1).nullable(),

    quality: z.enum(['normal', 'high-quality']).optional(),
  }),

  z.strictObject({
    type: z.literal('feature'),

    id: gameDataIdSchema,
    name: nonEmptyStringSchema,
  }),
]);

const questUnlockSchema = z.strictObject({
  type: nonEmptyStringSchema,

  id: gameDataIdSchema,
  name: nonEmptyStringSchema,

  details: nonEmptyStringSchema.optional(),
});

const questRewardItemSchema = z.strictObject({
  itemId: gameDataIdSchema,
  itemName: nonEmptyStringSchema,

  quantity: z.number().int().min(1).nullable(),

  quality: z.enum(['normal', 'high-quality']).optional(),

  stainId: gameDataIdSchema.optional(),

  stainName: nonEmptyStringSchema.optional(),
});

const questRewardsSchema = z.strictObject({
  experience: z.number().int().min(0).nullable(),

  gil: z.number().int().min(0).nullable(),

  items: z.array(questRewardItemSchema),

  choices: z.array(questRewardItemSchema),
});

export const questExportEntrySchema = z.strictObject({
  id: gameDataIdSchema,

  xivapiRowId: z.number().int().positive(),

  sortOrder: z.number().int().min(1),

  name: nonEmptyStringSchema,

  level: z.number().int().min(1),

  expansionId: gameDataIdSchema,
  patch: nonEmptyStringSchema,
  category: questCategorySchema,

  availability: questAvailabilitySchema.nullable(),

  requirements: z.array(questRequirementSchema),

  previousQuestIds: z.array(gameDataIdSchema),

  previousQuestMode: z.enum(['all', 'any']).default('all'),

  nextQuestIds: z.array(gameDataIdSchema),

  unlocks: z.array(questUnlockSchema),

  rewards: questRewardsSchema,

  start: questEndpointSchema,

  graphRole: z
    .enum(['linear', 'branch', 'convergence', 'branch-and-convergence'])
    .default('linear'),
});

const questGraphPointSchema = z.strictObject({
  questId: gameDataIdSchema,
  questName: nonEmptyStringSchema,

  relatedQuestIds: z.array(gameDataIdSchema),
});

const questExportIssueSchema = z.strictObject({
  questId: gameDataIdSchema,
  questName: nonEmptyStringSchema,

  field: nonEmptyStringSchema,
  message: nonEmptyStringSchema,
});

export const questChainExportSchema = z.strictObject({
  schemaVersion: z.literal(1),

  id: gameDataIdSchema,
  title: nonEmptyStringSchema,

  expansionId: gameDataIdSchema,
  patch: nonEmptyStringSchema,
  category: questCategorySchema,

  generatedAt: nonEmptyStringSchema,

  source: z.strictObject({
    provider: z.literal('xivapi'),

    version: nonEmptyStringSchema,

    schema: nonEmptyStringSchema,
  }),

  summary: z.strictObject({
    questCount: z.number().int().min(1),

    branchCount: z.number().int().min(0),

    convergenceCount: z.number().int().min(0),

    unresolvedIssueCount: z.number().int().min(0),
  }),

  branches: z.array(questGraphPointSchema),

  convergences: z.array(questGraphPointSchema),

  issues: z.array(questExportIssueSchema),

  quests: z.array(questExportEntrySchema).min(1),
});

export type QuestExportEntry = z.infer<typeof questExportEntrySchema>;

export type QuestChainExport = z.infer<typeof questChainExportSchema>;
