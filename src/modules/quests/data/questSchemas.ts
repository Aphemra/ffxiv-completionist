import * as z from 'zod';

import { startingCityIdSchema } from '../../../core/game/gameSchemas';

export const gameDataIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'IDs must use lowercase kebab-case.');

export const nonEmptyStringSchema = z.string().trim().min(1);

export const gameLevelSchema = z.number().int().min(1).max(999);

export const sortOrderSchema = z.number().int().min(0);

export const patchVersionSchema = z
  .string()
  .trim()
  .regex(/^\d+\.\d+$/, 'Patch versions must use a format such as "2.0".');

export const coordinatesSchema = z.strictObject({
  x: z.number().finite().min(0).max(999),
  y: z.number().finite().min(0).max(999),
});

export const levelRangeSchema = z
  .strictObject({
    minimum: gameLevelSchema,
    maximum: gameLevelSchema,
  })
  .refine((range) => range.minimum <= range.maximum, {
    message: 'The minimum level cannot be greater than the maximum level.',
    path: ['minimum'],
  });

export const questCategorySchema = z.enum([
  'msq',
  'class',
  'job',
  'role',
  'crafting',
  'gathering',
  'feature',
  'side-story',
  'tribal',
  'relic',
]);

export const questVerificationStatusSchema = z.enum([
  'sample',
  'partial',
  'verified',
]);

export const questAvailabilitySchema = z.strictObject({
  startingCityIds: z
    .array(startingCityIdSchema)
    .min(1)
    .refine((cityIds) => new Set(cityIds).size === cityIds.length, {
      message: 'Starting-city restrictions cannot contain duplicate cities.',
    })
    .optional(),
});

export const itemQualitySchema = z.enum(['normal', 'high-quality', 'either']);

export const questStartSchema = z.strictObject({
  npcName: nonEmptyStringSchema,
  zoneId: gameDataIdSchema,
  zoneName: nonEmptyStringSchema,
  coordinates: coordinatesSchema.optional(),
});

const classJobLevelRequirementSchema = z.strictObject({
  type: z.literal('class-job-level'),
  classJobId: gameDataIdSchema,
  classJobName: nonEmptyStringSchema,
  level: gameLevelSchema,
  notes: nonEmptyStringSchema.optional(),
});

const itemRequirementSchema = z.strictObject({
  type: z.literal('item'),
  itemId: gameDataIdSchema,
  itemName: nonEmptyStringSchema,
  quantity: z.number().int().min(1),
  quality: itemQualitySchema,
  notes: nonEmptyStringSchema.optional(),
});

const craftRequirementSchema = z.strictObject({
  type: z.literal('craft'),
  itemId: gameDataIdSchema,
  itemName: nonEmptyStringSchema,
  quantity: z.number().int().min(1),
  quality: itemQualitySchema,
  craftingJobId: gameDataIdSchema,
  craftingJobName: nonEmptyStringSchema,
  recipeLevel: gameLevelSchema.optional(),
  notes: nonEmptyStringSchema.optional(),
});

const gatheringRequirementSchema = z.strictObject({
  type: z.literal('gather'),
  itemId: gameDataIdSchema,
  itemName: nonEmptyStringSchema,
  quantity: z.number().int().min(1),
  quality: itemQualitySchema,
  gatheringJobId: gameDataIdSchema,
  gatheringJobName: nonEmptyStringSchema,
  gatheringLevel: gameLevelSchema.optional(),
  notes: nonEmptyStringSchema.optional(),
});

const featureRequirementSchema = z.strictObject({
  type: z.literal('feature'),
  featureId: gameDataIdSchema.optional(),
  name: nonEmptyStringSchema,
  notes: nonEmptyStringSchema.optional(),
});

export const questRequirementSchema = z.discriminatedUnion('type', [
  classJobLevelRequirementSchema,
  itemRequirementSchema,
  craftRequirementSchema,
  gatheringRequirementSchema,
  featureRequirementSchema,
]);

export const questRewardItemSchema = z.strictObject({
  itemId: gameDataIdSchema,
  itemName: nonEmptyStringSchema,
  quantity: z.number().int().min(1),
});

export const questRewardsSchema = z.strictObject({
  experience: z.number().int().min(0).optional(),
  gil: z.number().int().min(0).optional(),
  items: z.array(questRewardItemSchema).optional(),
});

export const dutyTypeSchema = z.enum([
  'dungeon',
  'trial',
  'solo-duty',
  'guildhest',
  'normal-raid',
  'alliance-raid',
  'field-operation',
]);

export const questDutySchema = z.strictObject({
  id: gameDataIdSchema,
  name: nonEmptyStringSchema,
  type: dutyTypeSchema,
  level: gameLevelSchema,
  minimumItemLevel: z.number().int().min(0).optional(),
  dutySupportAvailable: z.boolean().optional(),
  notes: nonEmptyStringSchema.optional(),
});

export const unlockTypeSchema = z.enum([
  'class',
  'job',
  'dungeon',
  'trial',
  'raid',
  'feature',
  'system',
  'mount',
  'mount-speed',
  'flight',
  'zone',
  'vendor',
  'emote',
]);

export const questUnlockSchema = z.strictObject({
  type: unlockTypeSchema,
  targetId: gameDataIdSchema.optional(),
  name: nonEmptyStringSchema,
  notes: nonEmptyStringSchema.optional(),
});

export const questNoteSchema = z.strictObject({
  type: z.enum(['info', 'tip', 'warning', 'spoiler']),
  text: nonEmptyStringSchema,
});

export const questSchema = z.strictObject({
  id: gameDataIdSchema,
  name: nonEmptyStringSchema,
  category: questCategorySchema,

  expansionId: gameDataIdSchema,
  patch: patchVersionSchema,

  level: gameLevelSchema,
  sortOrder: sortOrderSchema,

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

export const questGroupSchema = z.strictObject({
  id: gameDataIdSchema,
  title: nonEmptyStringSchema,
  description: nonEmptyStringSchema.optional(),
  sortOrder: sortOrderSchema,
  levelRange: levelRangeSchema.optional(),
  quests: z.array(questSchema),
});

export const questCollectionSchema = z
  .strictObject({
    schemaVersion: z.literal(1),

    id: gameDataIdSchema,
    title: nonEmptyStringSchema,
    description: nonEmptyStringSchema,

    category: questCategorySchema,
    expansionId: gameDataIdSchema.optional(),
    patch: patchVersionSchema.optional(),
    classJobId: gameDataIdSchema.optional(),

    availability: questAvailabilitySchema.optional(),

    sortOrder: sortOrderSchema,
    verificationStatus: questVerificationStatusSchema,

    groups: z.array(questGroupSchema).min(1),
  })
  .superRefine((collection, context) => {
    const groupIds = new Set<string>();
    const questIds = new Set<string>();

    collection.groups.forEach((group, groupIndex) => {
      if (groupIds.has(group.id)) {
        context.addIssue({
          code: 'custom',
          path: ['groups', groupIndex, 'id'],
          message: `Duplicate quest group ID "${group.id}".`,
        });
      }

      groupIds.add(group.id);

      group.quests.forEach((quest, questIndex) => {
        if (questIds.has(quest.id)) {
          context.addIssue({
            code: 'custom',
            path: ['groups', groupIndex, 'quests', questIndex, 'id'],
            message: `Duplicate quest ID "${quest.id}" within this collection.`,
          });
        }

        questIds.add(quest.id);
      });
    });
  });

export const questManifestEntrySchema = z.strictObject({
  id: gameDataIdSchema,
  title: nonEmptyStringSchema,
  category: questCategorySchema,
  path: nonEmptyStringSchema,
  sortOrder: sortOrderSchema,
  enabled: z.boolean().default(true),
});

export const questManifestSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    datasetVersion: nonEmptyStringSchema,
    collections: z.array(questManifestEntrySchema),
  })
  .superRefine((manifest, context) => {
    const collectionIds = new Set<string>();
    const collectionPaths = new Set<string>();

    manifest.collections.forEach((collection, index) => {
      if (collectionIds.has(collection.id)) {
        context.addIssue({
          code: 'custom',
          path: ['collections', index, 'id'],
          message: `Duplicate manifest collection ID "${collection.id}".`,
        });
      }

      if (collectionPaths.has(collection.path)) {
        context.addIssue({
          code: 'custom',
          path: ['collections', index, 'path'],
          message: `Duplicate manifest path "${collection.path}".`,
        });
      }

      collectionIds.add(collection.id);
      collectionPaths.add(collection.path);
    });
  });

export type QuestCategory = z.infer<typeof questCategorySchema>;
export type QuestRequirement = z.infer<typeof questRequirementSchema>;
export type QuestRewards = z.infer<typeof questRewardsSchema>;
export type QuestDuty = z.infer<typeof questDutySchema>;
export type QuestUnlock = z.infer<typeof questUnlockSchema>;
export type QuestAvailability = z.infer<typeof questAvailabilitySchema>;
export type Quest = z.infer<typeof questSchema>;
export type QuestGroup = z.infer<typeof questGroupSchema>;
export type QuestCollection = z.infer<typeof questCollectionSchema>;
export type QuestManifestEntry = z.infer<typeof questManifestEntrySchema>;
export type QuestManifest = z.infer<typeof questManifestSchema>;
