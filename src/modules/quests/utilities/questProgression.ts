import type { Quest } from '../data/questSchemas';

export function getPreviousQuestIds(
  questId: string,
  questsById: ReadonlyMap<string, Quest>,
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

    for (const prerequisiteQuestId of currentQuest.prerequisiteQuestIds ?? []) {
      visitQuest(prerequisiteQuestId);
    }

    activeTraversal.delete(currentQuestId);
    completedTraversal.add(currentQuestId);
    previousQuestIds.push(currentQuestId);
  }

  for (const prerequisiteQuestId of quest.prerequisiteQuestIds ?? []) {
    visitQuest(prerequisiteQuestId);
  }

  return previousQuestIds;
}
