import * as z from 'zod';

import {
  gameDataIdSchema,
  gameLevelSchema,
  nonEmptyStringSchema,
  patchVersionSchema,
  questAvailabilitySchema,
  questCategorySchema,
  questCollectionSchema,
  questDutySchema,
  questNoteSchema,
  questRequirementSchema,
  questRewardsSchema,
  questStartSchema,
  questUnlockSchema,
  questVerificationStatusSchema,
  sortOrderSchema,
  type QuestCollection,
} from './questSchemas';

const linearQuestSchema = z.strictObject({
  id: gameDataIdSchema,
  name: nonEmptyStringSchema,
  level: gameLevelSchema,

  sortOrder: sortOrderSchema.optional(),

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

const linearQuestGroupSchema = z.strictObject({
  id: gameDataIdSchema,
  title: nonEmptyStringSchema,
  description: nonEmptyStringSchema.optional(),
  sortOrder: sortOrderSchema,

  levelRange: z
    .strictObject({
      minimum: gameLevelSchema,
      maximum: gameLevelSchema,
    })
    .refine((range) => range.minimum <= range.maximum, {
      message: 'The minimum level cannot be greater than the maximum level.',
      path: ['minimum'],
    })
    .optional(),

  quests: z.array(linearQuestSchema).min(1),
});

const linearQuestCollectionSchema = z.strictObject({
  schemaVersion: z.literal(1),
  format: z.literal('linear'),

  id: gameDataIdSchema,
  title: nonEmptyStringSchema,
  description: nonEmptyStringSchema,

  category: questCategorySchema,
  expansionId: gameDataIdSchema,
  patch: patchVersionSchema,
  classJobId: gameDataIdSchema.optional(),

  availability: questAvailabilitySchema.optional(),

  sortOrder: sortOrderSchema,
  verificationStatus: questVerificationStatusSchema,

  startsAfterQuestIds: z.array(gameDataIdSchema).min(1).optional(),
  continuesToQuestIds: z.array(gameDataIdSchema).min(1).optional(),

  groups: z.array(linearQuestGroupSchema).min(1),
});

type LinearQuestCollection = z.infer<typeof linearQuestCollectionSchema>;

function normalizeLinearCollection(
  source: LinearQuestCollection,
): QuestCollection {
  const flattenedQuests = source.groups.flatMap((group) => group.quests);

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

        category: source.category,
        expansionId: source.expansionId,
        patch: source.patch,

        sortOrder: quest.sortOrder ?? groupQuestIndex + 1,

        prerequisiteQuestIds,
        nextQuestIds,
      };
    }),
  }));

  return questCollectionSchema.parse({
    schemaVersion: source.schemaVersion,

    id: source.id,
    title: source.title,
    description: source.description,

    category: source.category,
    expansionId: source.expansionId,
    patch: source.patch,
    classJobId: source.classJobId,

    availability: source.availability,

    sortOrder: source.sortOrder,
    verificationStatus: source.verificationStatus,

    groups,
  });
}

export const questCollectionFileSchema = z
  .union([questCollectionSchema, linearQuestCollectionSchema])
  .transform((collection): QuestCollection => {
    if ('format' in collection) {
      return normalizeLinearCollection(collection);
    }

    return collection;
  });
