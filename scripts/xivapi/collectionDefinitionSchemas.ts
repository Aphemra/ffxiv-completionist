import * as z from 'zod';

import {
  gameDataIdSchema,
  levelRangeSchema,
  nonEmptyStringSchema,
  questManifestEntrySchema,
  sortOrderSchema,
} from '../../src/modules/quests/data/questSchemas';

const uniqueQuestRowIdsSchema = z
  .array(z.number().int().positive())
  .min(1)
  .refine((rowIds) => new Set(rowIds).size === rowIds.length, {
    message: 'A group cannot contain duplicate quest row IDs.',
  });

const questCollectionGroupDefinitionSchema = z.strictObject({
  id: gameDataIdSchema,
  title: nonEmptyStringSchema,

  description: nonEmptyStringSchema.optional(),

  sortOrder: sortOrderSchema,

  levelRange: levelRangeSchema.optional(),

  questRowIds: uniqueQuestRowIdsSchema,
});

const questOverrideSchema = z.record(z.string(), z.unknown());

export const questCollectionDefinitionSchema = z.strictObject({
  schemaVersion: z.literal(1),

  manifest: questManifestEntrySchema,

  collection: z.strictObject({
    format: z.literal('linear'),

    startsAfterQuestIds: z.array(gameDataIdSchema).min(1).optional(),

    continuesToQuestIds: z.array(gameDataIdSchema).min(1).optional(),

    groups: z.array(questCollectionGroupDefinitionSchema).min(1),
  }),

  questOverrides: z
    .record(
      z.string().regex(/^\d+$/, 'Quest override keys must be XIVAPI row IDs.'),
      questOverrideSchema,
    )
    .optional(),
});

export type QuestCollectionDefinition = z.infer<
  typeof questCollectionDefinitionSchema
>;
