import type { Quest } from '../data/questSchemas';

type QuestCompletionData = Pick<
  Quest,
  'id' | 'isRepeatable' | 'isSeasonalQuest' | 'alternativeCompletionGroupId'
>;

export interface QuestCompletionSummary {
  completed: number;
  total: number;
}

export function isQuestCompletionEligible(
  quest: Pick<Quest, 'isRepeatable' | 'isSeasonalQuest'>,
): boolean {
  return !quest.isRepeatable && !quest.isSeasonalQuest;
}

export function getQuestCompletionUnitId(
  quest: Pick<QuestCompletionData, 'id' | 'alternativeCompletionGroupId'>,
): string {
  return quest.alternativeCompletionGroupId ?? quest.id;
}

export function createSatisfiedQuestIdSet(
  quests: readonly Quest[],
  completedQuestIds: readonly string[],
): Set<string> {
  const completedQuestIdSet = new Set(completedQuestIds);

  const completedAlternativeGroupIds = new Set<string>();

  for (const quest of quests) {
    if (
      !isQuestCompletionEligible(quest) ||
      !completedQuestIdSet.has(quest.id) ||
      !quest.alternativeCompletionGroupId
    ) {
      continue;
    }

    completedAlternativeGroupIds.add(quest.alternativeCompletionGroupId);
  }

  const satisfiedQuestIdSet = new Set(completedQuestIdSet);

  for (const quest of quests) {
    if (
      quest.alternativeCompletionGroupId &&
      completedAlternativeGroupIds.has(quest.alternativeCompletionGroupId)
    ) {
      satisfiedQuestIdSet.add(quest.id);
    }
  }

  return satisfiedQuestIdSet;
}

export function getQuestCompletionSummary(
  quests: readonly Quest[],
  satisfiedQuestIds: ReadonlySet<string>,
): QuestCompletionSummary {
  const completionUnitIds = new Set<string>();
  const completedUnitIds = new Set<string>();

  for (const quest of quests) {
    if (!isQuestCompletionEligible(quest)) {
      continue;
    }

    const completionUnitId = getQuestCompletionUnitId(quest);

    completionUnitIds.add(completionUnitId);

    if (satisfiedQuestIds.has(quest.id)) {
      completedUnitIds.add(completionUnitId);
    }
  }

  return {
    completed: completedUnitIds.size,
    total: completionUnitIds.size,
  };
}
