import type { Quest, QuestCollection } from '../data/questSchemas';

import { isQuestCompletionEligible } from './questCompletion';

function getTraversablePrerequisiteQuestIds(
  quest: Quest,
  completedQuestIds: ReadonlySet<string>,
): readonly string[] {
  const prerequisiteQuestIds = quest.prerequisiteQuestIds ?? [];

  if (
    quest.prerequisiteQuestMode !== 'any' ||
    prerequisiteQuestIds.length <= 1
  ) {
    return prerequisiteQuestIds;
  }

  /*
   * Prefer the route the player has already completed.
   *
   * When profile filtering has selected one mutually exclusive route,
   * only that route remains in prerequisiteQuestIds and the earlier
   * single-prerequisite return handles it.
   */
  const completedPrerequisiteQuestId = prerequisiteQuestIds.find((questId) =>
    completedQuestIds.has(questId),
  );

  if (completedPrerequisiteQuestId) {
    return [completedPrerequisiteQuestId];
  }

  /*
   * Do not arbitrarily complete every branch or choose a random branch
   * when several valid alternatives remain visible.
   */
  return [];
}

export function getPreviousQuestIds(
  questId: string,
  questsById: ReadonlyMap<string, Quest>,
  completedQuestIds: ReadonlySet<string>,
): string[] {
  const quest = questsById.get(questId);

  if (!quest) {
    return [];
  }

  const completedTraversal = new Set<string>();
  const activeTraversal = new Set<string>();
  const previousQuestIds: string[] = [];

  function visitQuest(currentQuestId: string): void {
    if (
      completedTraversal.has(currentQuestId) ||
      activeTraversal.has(currentQuestId)
    ) {
      return;
    }

    const currentQuest = questsById.get(currentQuestId);

    if (!currentQuest) {
      return;
    }

    activeTraversal.add(currentQuestId);

    const prerequisiteQuestIds = getTraversablePrerequisiteQuestIds(
      currentQuest,
      completedQuestIds,
    );

    for (const prerequisiteQuestId of prerequisiteQuestIds) {
      visitQuest(prerequisiteQuestId);
    }

    activeTraversal.delete(currentQuestId);
    completedTraversal.add(currentQuestId);

    if (isQuestCompletionEligible(currentQuest)) {
      previousQuestIds.push(currentQuestId);
    }
  }

  const prerequisiteQuestIds = getTraversablePrerequisiteQuestIds(
    quest,
    completedQuestIds,
  );

  for (const prerequisiteQuestId of prerequisiteQuestIds) {
    visitQuest(prerequisiteQuestId);
  }

  return previousQuestIds;
}

export function getAutomaticCurrentQuestId(
  collections: readonly QuestCollection[],
  completedQuestIds: readonly string[],
): string | null {
  const orderedLinearQuests = collections
    .filter((collection) => collection.format === 'linear')
    .flatMap((collection) =>
      collection.groups.flatMap((group) => group.quests),
    );

  if (orderedLinearQuests.length === 0) {
    return null;
  }

  const linearQuestIds = new Set(orderedLinearQuests.map((quest) => quest.id));

  const adjacencyByQuestId = new Map<string, Set<string>>();

  for (const quest of orderedLinearQuests) {
    adjacencyByQuestId.set(quest.id, new Set());
  }

  for (const quest of orderedLinearQuests) {
    const relatedQuestIds = [
      ...(quest.prerequisiteQuestIds ?? []),
      ...(quest.nextQuestIds ?? []),
    ];

    for (const relatedQuestId of relatedQuestIds) {
      if (!linearQuestIds.has(relatedQuestId)) {
        continue;
      }

      adjacencyByQuestId.get(quest.id)?.add(relatedQuestId);
      adjacencyByQuestId.get(relatedQuestId)?.add(quest.id);
    }
  }

  const questOrderById = new Map<string, number>();

  orderedLinearQuests.forEach((quest, index) => {
    questOrderById.set(quest.id, index);
  });

  const pathIndexByQuestId = new Map<string, number>();
  const paths: string[][] = [];

  for (const quest of orderedLinearQuests) {
    if (pathIndexByQuestId.has(quest.id)) {
      continue;
    }

    const pathIndex = paths.length;
    const pathQuestIds: string[] = [];
    const pendingQuestIds = [quest.id];

    while (pendingQuestIds.length > 0) {
      const questId = pendingQuestIds.pop();

      if (!questId || pathIndexByQuestId.has(questId)) {
        continue;
      }

      pathIndexByQuestId.set(questId, pathIndex);
      pathQuestIds.push(questId);

      for (const relatedQuestId of adjacencyByQuestId.get(questId) ?? []) {
        if (!pathIndexByQuestId.has(relatedQuestId)) {
          pendingQuestIds.push(relatedQuestId);
        }
      }
    }

    pathQuestIds.sort(
      (leftQuestId, rightQuestId) =>
        (questOrderById.get(leftQuestId) ?? 0) -
        (questOrderById.get(rightQuestId) ?? 0),
    );

    paths.push(pathQuestIds);
  }

  let activePathIndex: number | undefined;

  for (const completedQuestId of completedQuestIds) {
    const completedPathIndex = pathIndexByQuestId.get(completedQuestId);

    if (completedPathIndex !== undefined) {
      activePathIndex = completedPathIndex;
    }
  }

  const activePath = paths[activePathIndex ?? 0];

  if (!activePath) {
    return null;
  }

  const completedQuestIdSet = new Set(completedQuestIds);

  const linearQuestsById = new Map(
    orderedLinearQuests.map((quest) => [quest.id, quest]),
  );

  return (
    activePath.find((questId) => {
      const quest = linearQuestsById.get(questId);

      return (
        quest !== undefined &&
        isQuestCompletionEligible(quest) &&
        !completedQuestIdSet.has(questId)
      );
    }) ?? null
  );
}
