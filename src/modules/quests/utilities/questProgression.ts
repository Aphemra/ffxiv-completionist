import type { Quest } from '../data/questSchemas';

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
    previousQuestIds.push(currentQuestId);
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
