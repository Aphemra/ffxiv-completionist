import * as z from 'zod';

const positiveRowIdSchema = z.number().int().positive();

export const questIndexEntrySchema = z.strictObject({
  rowId: positiveRowIdSchema,
  name: z.string().trim().min(1),

  gameId: z.string().trim().min(1).optional(),

  journalGenreName: z.string().trim().min(1).optional(),
  journalCategoryName: z.string().trim().min(1).optional(),

  classJobName: z.string().trim().min(1).optional(),
  classJobAbbreviation: z.string().trim().min(1).optional(),

  eventIconTypeRowId: positiveRowIdSchema.optional(),

  beastTribeName: z.string().trim().min(1).optional(),

  isMainScenario: z.boolean(),
  isFeatureQuest: z.boolean(),
  isRepeatable: z.boolean(),

  previousQuestRowIds: z.array(positiveRowIdSchema),
  nextQuestRowIds: z.array(positiveRowIdSchema),
});

export const questIndexFileSchema = z.strictObject({
  indexVersion: z.literal(5),

  source: z.strictObject({
    provider: z.literal('xivapi'),
    sheet: z.literal('Quest'),

    version: z.string().trim().min(1),
    schema: z.string().trim().min(1),

    language: z.literal('en'),
    generatedAt: z.string().trim().min(1),
  }),

  quests: z.array(questIndexEntrySchema),
});

export type QuestIndexEntry = z.infer<typeof questIndexEntrySchema>;

export type QuestIndexFile = z.infer<typeof questIndexFileSchema>;
