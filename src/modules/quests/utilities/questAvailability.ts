import type {
  StartingCityId,
  StartingClassJobId,
} from '../../../core/game/gameSchemas';

import type { GrandCompanyId } from '../../../domain/grandCompanies';

import type {
  Quest,
  QuestAvailability,
  QuestCollection,
} from '../data/questSchemas';

import type { QuestCatalog } from '../data/questRepository';

export interface QuestAvailabilityContext {
  startingCity: StartingCityId | null;

  startingClassJob: StartingClassJobId | null;

  initialGrandCompany: GrandCompanyId | null;

  currentGrandCompany: GrandCompanyId | null;
}

export type QuestApplicability =
  | 'applicable'
  | 'alternate-route'
  | 'undecided-route';

type RestrictionResult = 'matches' | 'mismatch' | 'undecided';

function evaluateRestriction<TValue extends string>(
  allowedValues: readonly TValue[] | undefined,
  selectedValue: TValue | null,
): RestrictionResult {
  if (!allowedValues || allowedValues.length === 0) {
    return 'matches';
  }

  if (selectedValue === null) {
    return 'undecided';
  }

  return allowedValues.includes(selectedValue) ? 'matches' : 'mismatch';
}

function evaluateExcludedRestriction<TValue extends string>(
  excludedValues: readonly TValue[] | undefined,
  selectedValue: TValue | null,
): RestrictionResult {
  if (!excludedValues || excludedValues.length === 0) {
    return 'matches';
  }

  if (selectedValue === null) {
    return 'undecided';
  }

  return excludedValues.includes(selectedValue) ? 'mismatch' : 'matches';
}

function evaluateAvailability(
  availability: QuestAvailability | undefined,
  context: QuestAvailabilityContext,
): QuestApplicability {
  if (!availability) {
    return 'applicable';
  }

  const restrictionResults: RestrictionResult[] = [
    evaluateRestriction(availability.startingCityIds, context.startingCity),

    evaluateRestriction(
      availability.startingClassJobIds,
      context.startingClassJob,
    ),

    evaluateExcludedRestriction(
      availability.excludedStartingClassJobIds,
      context.startingClassJob,
    ),

    evaluateRestriction(
      availability.initialGrandCompanyIds,
      context.initialGrandCompany,
    ),

    evaluateRestriction(
      availability.currentGrandCompanyIds,
      context.currentGrandCompany,
    ),
  ];

  if (restrictionResults.includes('mismatch')) {
    return 'alternate-route';
  }

  if (restrictionResults.includes('undecided')) {
    return 'undecided-route';
  }

  return 'applicable';
}

function combineApplicability(
  ...results: readonly QuestApplicability[]
): QuestApplicability {
  if (results.includes('alternate-route')) {
    return 'alternate-route';
  }

  if (results.includes('undecided-route')) {
    return 'undecided-route';
  }

  return 'applicable';
}

export function getQuestCollectionApplicability(
  collection: QuestCollection,
  context: QuestAvailabilityContext,
): QuestApplicability {
  return evaluateAvailability(collection.availability, context);
}

export function getQuestApplicability(
  quest: Quest,
  collection: QuestCollection,
  context: QuestAvailabilityContext,
): QuestApplicability {
  return combineApplicability(
    getQuestCollectionApplicability(collection, context),
    evaluateAvailability(quest.availability, context),
  );
}

export function isQuestCollectionAvailable(
  collection: QuestCollection,
  context: QuestAvailabilityContext,
): boolean {
  return getQuestCollectionApplicability(collection, context) === 'applicable';
}

export function isQuestAvailable(
  quest: Quest,
  collection: QuestCollection,
  context: QuestAvailabilityContext,
): boolean {
  return getQuestApplicability(quest, collection, context) === 'applicable';
}

export function createAvailableQuestCatalog(
  catalog: QuestCatalog,
  context: QuestAvailabilityContext,
): QuestCatalog {
  const filteredCollections = catalog.collections
    .filter((collection) => isQuestCollectionAvailable(collection, context))
    .map((collection) => {
      const groups = collection.groups
        .map((group) => ({
          ...group,

          quests: group.quests.filter((quest) =>
            isQuestAvailable(quest, collection, context),
          ),
        }))
        .filter((group) => group.quests.length > 0);

      return {
        ...collection,
        groups,
      };
    })
    .filter((collection) => collection.groups.length > 0);

  const availableQuestIds = new Set(
    filteredCollections.flatMap((collection) =>
      collection.groups.flatMap((group) =>
        group.quests.map((quest) => quest.id),
      ),
    ),
  );

  const collections = filteredCollections.map((collection) => ({
    ...collection,

    groups: collection.groups.map((group) => ({
      ...group,

      quests: group.quests.map((quest) => {
        const prerequisiteQuestIds = quest.prerequisiteQuestIds?.filter(
          (questId) => availableQuestIds.has(questId),
        );

        const nextQuestIds = quest.nextQuestIds?.filter((questId) =>
          availableQuestIds.has(questId),
        );

        const prerequisiteRelationshipsChanged =
          quest.prerequisiteQuestIds !== undefined &&
          prerequisiteQuestIds?.length !== quest.prerequisiteQuestIds.length;

        const nextRelationshipsChanged =
          quest.nextQuestIds !== undefined &&
          nextQuestIds?.length !== quest.nextQuestIds.length;

        if (!prerequisiteRelationshipsChanged && !nextRelationshipsChanged) {
          return quest;
        }

        return {
          ...quest,

          ...(prerequisiteQuestIds === undefined
            ? {}
            : {
                prerequisiteQuestIds,
              }),

          ...(nextQuestIds === undefined
            ? {}
            : {
                nextQuestIds,
              }),
        };
      }),
    })),
  }));

  const questsById = new Map<string, Quest>();

  for (const collection of collections) {
    for (const group of collection.groups) {
      for (const quest of group.quests) {
        questsById.set(quest.id, quest);
      }
    }
  }

  return {
    ...catalog,
    collections,
    questsById,
    questCount: questsById.size,
  };
}
