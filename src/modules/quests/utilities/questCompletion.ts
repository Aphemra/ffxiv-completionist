import type { Quest } from '../data/questSchemas';

export function isQuestCompletionEligible(
  quest: Pick<Quest, 'isRepeatable' | 'isSeasonalQuest'>,
): boolean {
  return !quest.isRepeatable && !quest.isSeasonalQuest;
}
