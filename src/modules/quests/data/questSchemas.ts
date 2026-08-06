import * as z from 'zod';

import { startingCityIdSchema } from '../../../core/game/gameSchemas';
import { grandCompanyIdSchema } from '../../../domain/grandCompanies';

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

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

export const extensionsSchema = z.record(z.string(), jsonValueSchema);

export const coordinatesSchema = z.strictObject({
  x: z.number().min(0).max(999),
  y: z.number().min(0).max(999),
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
  'side',
  'side-story',
  'tribal',
  'relic',
]);

export const questVerificationStatusSchema = z.enum([
  'incomplete',
  'partially-complete',
  'in-review',
  'verified',
]);

export const gameLanguageSchema = z.enum(['en', 'ja', 'de', 'fr']);

const uniqueGameDataIdArraySchema = z
  .array(gameDataIdSchema)
  .min(1)
  .refine((ids) => new Set(ids).size === ids.length, {
    message: 'ID arrays cannot contain duplicate values.',
  });

const uniqueGrandCompanyIdArraySchema = z
  .array(grandCompanyIdSchema)
  .min(1)
  .refine((ids) => new Set(ids).size === ids.length, {
    message: 'Grand Company arrays cannot contain duplicate values.',
  });

export const questConditionSchema = z.strictObject({
  type: gameDataIdSchema,

  targetId: gameDataIdSchema.optional(),
  name: nonEmptyStringSchema.optional(),

  operator: gameDataIdSchema.optional(),
  value: jsonValueSchema.optional(),

  notes: nonEmptyStringSchema.optional(),
  extensions: extensionsSchema.optional(),
});

export const questAvailabilitySchema = z.strictObject({
  startingCityIds: z
    .array(startingCityIdSchema)
    .min(1)
    .refine((cityIds) => new Set(cityIds).size === cityIds.length, {
      message: 'Starting-city restrictions cannot contain duplicate cities.',
    })
    .optional(),

  classJobIds: uniqueGameDataIdArraySchema.optional(),
  classJobCategoryIds: uniqueGameDataIdArraySchema.optional(),

  initialGrandCompanyIds: uniqueGrandCompanyIdArraySchema.optional(),

  currentGrandCompanyIds: uniqueGrandCompanyIdArraySchema.optional(),

  grandCompanyRankIds: uniqueGameDataIdArraySchema.optional(),

  alliedSocietyIds: uniqueGameDataIdArraySchema.optional(),

  reputationRankIds: uniqueGameDataIdArraySchema.optional(),

  festivalIds: uniqueGameDataIdArraySchema.optional(),
  featureIds: uniqueGameDataIdArraySchema.optional(),
  mountIds: uniqueGameDataIdArraySchema.optional(),

  requiresHousing: z.boolean().optional(),

  conditions: z.array(questConditionSchema).optional(),
  extensions: extensionsSchema.optional(),
});

export const itemQualitySchema = z.enum(['normal', 'high-quality', 'either']);

export const questItemUsageSchema = z.enum([
  'required-before-starting',

  'obtained-during-quest',
  'used-during-quest',

  'turn-in',
  'equip',

  'craft',
  'gather',

  'unknown',
]);

export const questItemSchema = z.strictObject({
  itemId: gameDataIdSchema,
  itemName: nonEmptyStringSchema,

  sourceRowId: z.number().int().positive().optional(),

  sourceSheet: z.enum(['item', 'event-item']).optional(),

  quantity: z.number().int().min(1).optional(),

  quality: itemQualitySchema.optional(),

  usage: questItemUsageSchema.default('unknown'),

  sourceInstruction: nonEmptyStringSchema.optional(),

  notes: nonEmptyStringSchema.optional(),

  extensions: extensionsSchema.optional(),
});

export const questStartSchema = z
  .strictObject({
    npcId: gameDataIdSchema.optional(),
    npcName: nonEmptyStringSchema,

    sourceRowId: z.number().int().min(0).optional(),

    zoneId: gameDataIdSchema.optional(),
    zoneName: nonEmptyStringSchema.optional(),

    territoryId: gameDataIdSchema.optional(),
    mapId: gameDataIdSchema.optional(),

    coordinates: coordinatesSchema.optional(),

    notes: nonEmptyStringSchema.optional(),
    extensions: extensionsSchema.optional(),
  })
  .superRefine((start, context) => {
    const hasZoneId = start.zoneId !== undefined;
    const hasZoneName = start.zoneName !== undefined;

    if (hasZoneId === hasZoneName) {
      return;
    }

    context.addIssue({
      code: 'custom',
      path: hasZoneId ? ['zoneName'] : ['zoneId'],
      message:
        'A quest location must provide both zoneId and zoneName, or neither.',
    });
  });

export const questObjectiveLocationSchema = z.strictObject({
  zoneId: gameDataIdSchema.optional(),
  zoneName: nonEmptyStringSchema.optional(),

  territoryId: gameDataIdSchema.optional(),
  mapId: gameDataIdSchema.optional(),

  sourceLevelRowId: z.number().int().min(0).optional(),

  coordinates: coordinatesSchema.optional(),

  notes: nonEmptyStringSchema.optional(),
  extensions: extensionsSchema.optional(),
});

export const questObjectiveSchema = z.strictObject({
  id: gameDataIdSchema,
  sortOrder: sortOrderSchema,

  type: gameDataIdSchema,

  text: nonEmptyStringSchema.optional(),

  quantity: z.number().int().min(0).optional(),

  targetId: gameDataIdSchema.optional(),
  targetName: nonEmptyStringSchema.optional(),

  itemId: gameDataIdSchema.optional(),
  itemName: nonEmptyStringSchema.optional(),

  dutyId: gameDataIdSchema.optional(),
  dutyName: nonEmptyStringSchema.optional(),

  locations: z.array(questObjectiveLocationSchema).optional(),

  notes: nonEmptyStringSchema.optional(),

  sourceData: extensionsSchema.optional(),
  extensions: extensionsSchema.optional(),
});

export const questRepeatabilitySchema = z.strictObject({
  type: gameDataIdSchema,

  intervalHours: z.number().min(0).optional(),
  allowanceCost: z.number().int().min(0).optional(),

  resetNotes: nonEmptyStringSchema.optional(),
  notes: nonEmptyStringSchema.optional(),

  extensions: extensionsSchema.optional(),
});

export const questLocalizationTextSchema = z.strictObject({
  name: nonEmptyStringSchema.optional(),

  journalSummary: nonEmptyStringSchema.optional(),
  journalText: nonEmptyStringSchema.optional(),

  extensions: extensionsSchema.optional(),
});

export const questLocalizationsSchema = z.strictObject({
  en: questLocalizationTextSchema.optional(),
  ja: questLocalizationTextSchema.optional(),
  de: questLocalizationTextSchema.optional(),
  fr: questLocalizationTextSchema.optional(),
});

export const questSourceReferenceSchema = z.strictObject({
  provider: gameDataIdSchema,

  reference: nonEmptyStringSchema.optional(),

  sheet: nonEmptyStringSchema.optional(),
  rowId: z.number().int().min(0).optional(),

  gameVersion: nonEmptyStringSchema.optional(),
  schema: nonEmptyStringSchema.optional(),
  language: gameLanguageSchema.optional(),

  importedAt: nonEmptyStringSchema.optional(),
  checkedAt: nonEmptyStringSchema.optional(),

  notes: nonEmptyStringSchema.optional(),
  extensions: extensionsSchema.optional(),
});

export const externalIdValueSchema = z.union([z.string(), z.number().int()]);

export const externalIdsSchema = z.record(
  gameDataIdSchema,
  externalIdValueSchema,
);

export const questRawRelationsSchema = z.strictObject({
  previousQuestRowIds: z.array(z.number().int().min(0)).optional(),

  lockedByQuestRowIds: z.array(z.number().int().min(0)).optional(),

  instanceContentRowIds: z.array(z.number().int().min(0)).optional(),

  previousQuestJoin: z.number().int().optional(),
  questLockJoin: z.number().int().optional(),
  instanceContentJoin: z.number().int().optional(),

  extensions: extensionsSchema.optional(),
});

const classJobLevelRequirementSchema = z.strictObject({
  type: z.literal('class-job-level'),

  classJobId: gameDataIdSchema,
  classJobName: nonEmptyStringSchema,

  level: gameLevelSchema,

  notes: nonEmptyStringSchema.optional(),
  extensions: extensionsSchema.optional(),
});

const itemRequirementSchema = z.strictObject({
  type: z.literal('item'),

  itemId: gameDataIdSchema,
  itemName: nonEmptyStringSchema,

  quantity: z.number().int().min(1),
  quality: itemQualitySchema,

  notes: nonEmptyStringSchema.optional(),
  extensions: extensionsSchema.optional(),
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
  extensions: extensionsSchema.optional(),
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
  extensions: extensionsSchema.optional(),
});

const featureRequirementSchema = z.strictObject({
  type: z.literal('feature'),

  featureId: gameDataIdSchema.optional(),
  name: nonEmptyStringSchema,

  notes: nonEmptyStringSchema.optional(),
  extensions: extensionsSchema.optional(),
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

  quality: itemQualitySchema.optional(),

  choiceGroup: z.number().int().min(0).optional(),
  stainId: gameDataIdSchema.optional(),

  notes: nonEmptyStringSchema.optional(),
  extensions: extensionsSchema.optional(),
});

export const questRewardReferenceSchema = z.strictObject({
  type: gameDataIdSchema,

  targetId: gameDataIdSchema.optional(),
  name: nonEmptyStringSchema,

  quantity: z.number().int().min(0).optional(),

  notes: nonEmptyStringSchema.optional(),
  extensions: extensionsSchema.optional(),
});

export const questRewardsSchema = z.strictObject({
  experience: z.number().int().min(0).optional(),
  experienceFactor: z.number().min(0).optional(),

  gil: z.number().int().min(0).optional(),

  items: z.array(questRewardItemSchema).optional(),

  optionalItems: z.array(questRewardItemSchema).optional(),

  currencies: z.array(questRewardReferenceSchema).optional(),

  other: z.array(questRewardReferenceSchema).optional(),

  tomestoneAmount: z.number().int().min(0).optional(),
  reputationAmount: z.number().int().optional(),

  extensions: extensionsSchema.optional(),
});

export const dutyTypeSchema = gameDataIdSchema;

export const questDutySchema = z.strictObject({
  id: gameDataIdSchema,
  name: nonEmptyStringSchema,

  sourceRowId: z.number().int().min(0).optional(),

  type: dutyTypeSchema,

  relationship: z.enum(['required', 'unlocked', 'related']).optional(),

  level: gameLevelSchema,

  minimumItemLevel: z.number().int().min(0).optional(),

  partySize: z.number().int().min(1).optional(),
  levelSync: gameLevelSchema.optional(),

  dutySupportAvailable: z.boolean().optional(),
  trustAvailable: z.boolean().optional(),

  notes: nonEmptyStringSchema.optional(),
  extensions: extensionsSchema.optional(),
});

export const unlockTypeSchema = gameDataIdSchema;

export const questUnlockSchema = z.strictObject({
  type: unlockTypeSchema,

  targetId: gameDataIdSchema.optional(),
  sourceRowId: z.number().int().min(0).optional(),

  name: nonEmptyStringSchema,

  notes: nonEmptyStringSchema.optional(),
  extensions: extensionsSchema.optional(),
});

export const questNoteSchema = z.strictObject({
  type: gameDataIdSchema,
  text: nonEmptyStringSchema,

  source: nonEmptyStringSchema.optional(),
  extensions: extensionsSchema.optional(),
});

export const questSchema = z.strictObject({
  id: gameDataIdSchema,
  name: nonEmptyStringSchema,

  category: questCategorySchema,

  expansionId: gameDataIdSchema,
  patch: patchVersionSchema,

  level: gameLevelSchema,
  sortOrder: sortOrderSchema,

  externalIds: externalIdsSchema.optional(),

  sources: z.array(questSourceReferenceSchema).optional(),

  localizations: questLocalizationsSchema.optional(),

  start: questStartSchema.optional(),

  availability: questAvailabilitySchema.optional(),

  repeatability: questRepeatabilitySchema.optional(),

  prerequisiteQuestMode: z.enum(['all', 'any']).default('all'),

  prerequisiteQuestIds: z.array(gameDataIdSchema).optional(),

  nextQuestIds: z.array(gameDataIdSchema).optional(),

  rawRelations: questRawRelationsSchema.optional(),

  requirements: z.array(questRequirementSchema).optional(),

  conditions: z.array(questConditionSchema).optional(),

  questItems: z.array(questItemSchema).optional(),

  objectives: z.array(questObjectiveSchema).optional(),

  rewards: questRewardsSchema.optional(),

  duties: z.array(questDutySchema).optional(),

  unlocks: z.array(questUnlockSchema).optional(),

  notes: z.array(questNoteSchema).optional(),

  tags: z.array(gameDataIdSchema).optional(),

  lastVerifiedAt: nonEmptyStringSchema.optional(),

  sourceData: extensionsSchema.optional(),
  extensions: extensionsSchema.optional(),
});

export const questGroupSchema = z.strictObject({
  id: gameDataIdSchema,
  title: nonEmptyStringSchema,

  description: nonEmptyStringSchema.optional(),

  sortOrder: sortOrderSchema,
  levelRange: levelRangeSchema.optional(),

  quests: z.array(questSchema),

  extensions: extensionsSchema.optional(),
});

export const questCollectionFilterFacetSchema = z.strictObject({
  id: gameDataIdSchema,
  name: nonEmptyStringSchema,
});

export const questCollectionFilterFacetsSchema = z.strictObject({
  primary: questCollectionFilterFacetSchema,
  secondary: questCollectionFilterFacetSchema,
});

export const questCollectionSchema = z
  .strictObject({
    schemaVersion: z.literal(1),

    format: z.enum(['standard', 'linear']),

    id: gameDataIdSchema,
    title: nonEmptyStringSchema,
    description: nonEmptyStringSchema,

    category: questCategorySchema,

    expansionId: gameDataIdSchema.optional(),
    patch: patchVersionSchema.optional(),
    classJobId: gameDataIdSchema.optional(),

    filterFacets: questCollectionFilterFacetsSchema.optional(),

    availability: questAvailabilitySchema.optional(),

    sortOrder: sortOrderSchema,

    verificationStatus: questVerificationStatusSchema,

    groups: z.array(questGroupSchema).min(1),

    extensions: extensionsSchema.optional(),
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
  description: nonEmptyStringSchema,

  category: questCategorySchema,
  expansionId: gameDataIdSchema,
  patch: patchVersionSchema,
  classJobId: gameDataIdSchema.optional(),

  filterFacets: questCollectionFilterFacetsSchema.optional(),

  availability: questAvailabilitySchema.optional(),

  sortOrder: sortOrderSchema,

  verificationStatus: questVerificationStatusSchema,

  path: nonEmptyStringSchema,
  enabled: z.boolean().default(true),

  extensions: extensionsSchema.optional(),
});

export const questManifestSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    datasetVersion: nonEmptyStringSchema,

    collections: z.array(questManifestEntrySchema),

    extensions: extensionsSchema.optional(),
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

export type QuestItem = z.infer<typeof questItemSchema>;

export type QuestRewards = z.infer<typeof questRewardsSchema>;

export type QuestDuty = z.infer<typeof questDutySchema>;

export type QuestUnlock = z.infer<typeof questUnlockSchema>;

export type QuestAvailability = z.infer<typeof questAvailabilitySchema>;

export type QuestObjective = z.infer<typeof questObjectiveSchema>;

export type QuestSourceReference = z.infer<typeof questSourceReferenceSchema>;

export type Quest = z.infer<typeof questSchema>;

export type QuestGroup = z.infer<typeof questGroupSchema>;

export type QuestCollection = z.infer<typeof questCollectionSchema>;

export type QuestManifestEntry = z.infer<typeof questManifestEntrySchema>;

export type QuestManifest = z.infer<typeof questManifestSchema>;
