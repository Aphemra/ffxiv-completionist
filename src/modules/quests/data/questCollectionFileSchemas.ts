import * as z from 'zod';

import {
  gameDataIdSchema,
  gameLevelSchema,
  nonEmptyStringSchema,
  questAvailabilitySchema,
  questCollectionSchema,
  questDutySchema,
  questNoteSchema,
  questRequirementSchema,
  questRewardsSchema,
  questStartSchema,
  questUnlockSchema,
  sortOrderSchema,
  type QuestCollection,
  type QuestManifestEntry,
} from './questSchemas';

const levelRangeSchema = z
  .strictObject({
    minimum: gameLevelSchema,
    maximum: gameLevelSchema,
  })
  .refine((range) => range.minimum <= range.maximum, {
    message: 'The minimum level cannot be greater than the maximum level.',
    path: ['minimum'],
  });

const questContentBaseSchema = z.strictObject({
  id: gameDataIdSchema,
  name: nonEmptyStringSchema,
  level: gameLevelSchema,

  start: questStartSchema.optional(),
  availability: questAvailabilitySchema.optional(),

  prerequisiteQuestIds: z.array(gameDataIdSchema).optional(),

  nextQuestIds: z.array(gameDataIdSchema).optional(),

  requirements: z.array(questRequirementSchema).optional(),

  rewards: questRewardsSchema.optional(),

  duties: z.array(questDutySchema).optional(),

  unlocks: z.array(questUnlockSchema).optional(),

  notes: z.array(questNoteSchema).optional(),
});

const standardQuestContentSchema = questContentBaseSchema.extend({
  sortOrder: sortOrderSchema,
});

const linearQuestContentSchema = questContentBaseSchema.extend({
  sortOrder: sortOrderSchema.optional(),
});

const questGroupBaseSchema = z.strictObject({
  id: gameDataIdSchema,
  title: nonEmptyStringSchema,
  description: nonEmptyStringSchema.optional(),
  sortOrder: sortOrderSchema,
  levelRange: levelRangeSchema.optional(),
});

const standardQuestGroupContentSchema = questGroupBaseSchema.extend({
  quests: z.array(standardQuestContentSchema).min(1),
});

const linearQuestGroupContentSchema = questGroupBaseSchema.extend({
  quests: z.array(linearQuestContentSchema).min(1),
});

const standardQuestCollectionContentSchema = z.strictObject({
  schemaVersion: z.literal(1),

  groups: z.array(standardQuestGroupContentSchema).min(1),
});

const linearQuestCollectionContentSchema = z.strictObject({
  schemaVersion: z.literal(1),
  format: z.literal('linear'),

  startsAfterQuestIds: z.array(gameDataIdSchema).min(1).optional(),

  continuesToQuestIds: z.array(gameDataIdSchema).min(1).optional(),

  groups: z.array(linearQuestGroupContentSchema).min(1),
});

export const questCollectionFileSchema = z.union([
  linearQuestCollectionContentSchema,
  standardQuestCollectionContentSchema,
]);

export type QuestCollectionFile = z.infer<typeof questCollectionFileSchema>;

type StandardQuestCollectionContent = z.infer<
  typeof standardQuestCollectionContentSchema
>;

type LinearQuestCollectionContent = z.infer<
  typeof linearQuestCollectionContentSchema
>;

function createCollectionMetadata(manifestEntry: QuestManifestEntry) {
  return {
    id: manifestEntry.id,
    title: manifestEntry.title,
    description: manifestEntry.description,

    category: manifestEntry.category,
    expansionId: manifestEntry.expansionId,
    patch: manifestEntry.patch,
    classJobId: manifestEntry.classJobId,

    availability: manifestEntry.availability,

    sortOrder: manifestEntry.sortOrder,
    verificationStatus: manifestEntry.verificationStatus,
  };
}

function createQuestMetadata(manifestEntry: QuestManifestEntry) {
  return {
    category: manifestEntry.category,
    expansionId: manifestEntry.expansionId,
    patch: manifestEntry.patch,
  };
}

function normalizeStandardCollection(
  manifestEntry: QuestManifestEntry,
  source: StandardQuestCollectionContent,
): QuestCollection {
  const questMetadata = createQuestMetadata(manifestEntry);

  return questCollectionSchema.parse({
    schemaVersion: source.schemaVersion,

    ...createCollectionMetadata(manifestEntry),

    groups: source.groups.map((group) => ({
      ...group,

      quests: group.quests.map((quest) => ({
        ...quest,
        ...questMetadata,
      })),
    })),
  });
}

function normalizeLinearCollection(
  manifestEntry: QuestManifestEntry,
  source: LinearQuestCollectionContent,
): QuestCollection {
  const flattenedQuests = source.groups.flatMap((group) => group.quests);

  const questMetadata = createQuestMetadata(manifestEntry);

  let globalQuestIndex = 0;

  const groups = source.groups.map((group) => ({
    id: group.id,
    title: group.title,
    description: group.description,
    sortOrder: group.sortOrder,
    levelRange: group.levelRange,

    quests: group.quests.map((quest, groupQuestIndex) => {
      const questIndex = globalQuestIndex;

      globalQuestIndex += 1;

      const previousQuest =
        questIndex > 0 ? flattenedQuests[questIndex - 1] : undefined;

      const nextQuest =
        questIndex < flattenedQuests.length - 1
          ? flattenedQuests[questIndex + 1]
          : undefined;

      const prerequisiteQuestIds =
        quest.prerequisiteQuestIds ??
        (previousQuest ? [previousQuest.id] : source.startsAfterQuestIds);

      const nextQuestIds =
        quest.nextQuestIds ??
        (nextQuest ? [nextQuest.id] : source.continuesToQuestIds);

      return {
        ...quest,
        ...questMetadata,

        sortOrder: quest.sortOrder ?? groupQuestIndex + 1,

        prerequisiteQuestIds,
        nextQuestIds,
      };
    }),
  }));

  return questCollectionSchema.parse({
    schemaVersion: source.schemaVersion,

    ...createCollectionMetadata(manifestEntry),

    groups,
  });
}

export function createQuestCollection(
  manifestEntry: QuestManifestEntry,
  source: QuestCollectionFile,
): QuestCollection {
  if ('format' in source) {
    return normalizeLinearCollection(manifestEntry, source);
  }

  return normalizeStandardCollection(manifestEntry, source);
}
