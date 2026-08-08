/**
 * EventIconType rows that use the blue unlock-style quest marker.
 *
 * 8  - Standard blue feature quests
 * 10 - Class and job unlock quests
 * 33 - Special delivery quest variant
 * 34 - Newer special delivery quest variant
 */
export const FEATURE_QUEST_EVENT_ICON_TYPE_ROW_IDS: ReadonlySet<number> =
  new Set([8, 10, 33, 34]);

export function isFeatureQuestEventIconType(
  eventIconTypeRowId: number | undefined,
): boolean {
  return (
    eventIconTypeRowId !== undefined &&
    FEATURE_QUEST_EVENT_ICON_TYPE_ROW_IDS.has(eventIconTypeRowId)
  );
}

export const SEASONAL_QUEST_JOURNAL_CATEGORY_NAME = 'Seasonal Events';

export function isSeasonalQuestJournalCategory(
  journalCategoryName: string | undefined,
): boolean {
  return (
    journalCategoryName?.trim().toLowerCase() ===
    SEASONAL_QUEST_JOURNAL_CATEGORY_NAME.toLowerCase()
  );
}
