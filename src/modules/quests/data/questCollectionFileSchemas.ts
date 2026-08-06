import * as z from 'zod';

import {
  gameDataIdSchema,
  questCollectionSchema,
  questGroupSchema,
  questSchema,
  sortOrderSchema,
  type QuestCollection,
  type QuestManifestEntry,
} from './questSchemas';

const questContentBaseSchema = questSchema.omit({
  category: true,
  expansionId: true,
  patch: true,
  sortOrder: true,
});

const standardQuestContentSchema = questContentBaseSchema.extend({
  sortOrder: sortOrderSchema,
});

const linearQuestContentSchema = questContentBaseSchema.extend({
  sortOrder: sortOrderSchema.optional(),
});

const questGroupBaseSchema = questGroupSchema.omit({
  quests: true,
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

    filterFacets: manifestEntry.filterFacets,

    availability: manifestEntry.availability,

    sortOrder: manifestEntry.sortOrder,

    verificationStatus: manifestEntry.verificationStatus,

    extensions: manifestEntry.extensions,
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
    format: 'standard',

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
    ...group,

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
    format: 'linear',

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
