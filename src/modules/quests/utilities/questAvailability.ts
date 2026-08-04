import type { StartingCityId } from '../../../core/game/gameSchemas';

import type {
  Quest,
  QuestAvailability,
  QuestCollection,
} from '../data/questSchemas';

import type { QuestCatalog } from '../data/questRepository';

export interface QuestAvailabilityContext {
  startingCity: StartingCityId | null;
}

function matchesAvailability(
  availability: QuestAvailability | undefined,
  context: QuestAvailabilityContext,
): boolean {
  const startingCityIds = availability?.startingCityIds;

  if (!startingCityIds || startingCityIds.length === 0) {
    return true;
  }

  if (!context.startingCity) {
    return false;
  }

  return startingCityIds.includes(context.startingCity);
}

export function isQuestCollectionAvailable(
  collection: QuestCollection,
  context: QuestAvailabilityContext,
): boolean {
  return matchesAvailability(collection.availability, context);
}

export function isQuestAvailable(
  quest: Quest,
  collection: QuestCollection,
  context: QuestAvailabilityContext,
): boolean {
  return (
    isQuestCollectionAvailable(collection, context) &&
    matchesAvailability(quest.availability, context)
  );
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

      quests: group.quests.map((quest) => ({
        ...quest,

        prerequisiteQuestIds: quest.prerequisiteQuestIds?.filter((questId) =>
          availableQuestIds.has(questId),
        ),

        nextQuestIds: quest.nextQuestIds?.filter((questId) =>
          availableQuestIds.has(questId),
        ),
      })),
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
