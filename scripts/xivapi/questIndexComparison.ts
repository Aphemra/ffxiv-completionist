import type { QuestIndexEntry, QuestIndexFile } from './questIndexSchemas';

import { isDeepStrictEqual } from 'node:util';

interface ChangedQuestIndexEntry {
  rowId: number;
  before: QuestIndexEntry;
  after: QuestIndexEntry;
}

export interface QuestIndexComparison {
  generatedAt: string;

  previousSource: QuestIndexFile['source'] | null;
  currentSource: QuestIndexFile['source'];

  summary: {
    previousQuestCount: number;
    currentQuestCount: number;

    addedQuestCount: number;
    removedQuestCount: number;
    changedQuestCount: number;

    sourceChanged: boolean;
  };

  addedQuests: QuestIndexEntry[];
  removedQuests: QuestIndexEntry[];
  changedQuests: ChangedQuestIndexEntry[];
}

function entriesMatch(left: QuestIndexEntry, right: QuestIndexEntry): boolean {
  return isDeepStrictEqual(left, right);
}

export function compareQuestIndexes(
  previousIndex: QuestIndexFile | undefined,
  currentIndex: QuestIndexFile,
): QuestIndexComparison {
  const previousQuestsByRowId = new Map(
    previousIndex?.quests.map((quest) => [quest.rowId, quest]) ?? [],
  );

  const currentQuestsByRowId = new Map(
    currentIndex.quests.map((quest) => [quest.rowId, quest]),
  );

  const addedQuests = currentIndex.quests.filter(
    (quest) => !previousQuestsByRowId.has(quest.rowId),
  );

  const removedQuests =
    previousIndex?.quests.filter(
      (quest) => !currentQuestsByRowId.has(quest.rowId),
    ) ?? [];

  const changedQuests: ChangedQuestIndexEntry[] = [];

  for (const currentQuest of currentIndex.quests) {
    const previousQuest = previousQuestsByRowId.get(currentQuest.rowId);

    if (previousQuest && !entriesMatch(previousQuest, currentQuest)) {
      changedQuests.push({
        rowId: currentQuest.rowId,
        before: previousQuest,
        after: currentQuest,
      });
    }
  }

  const sourceChanged =
    previousIndex === undefined ||
    previousIndex.source.version !== currentIndex.source.version ||
    previousIndex.source.schema !== currentIndex.source.schema;

  return {
    generatedAt: new Date().toISOString(),

    previousSource: previousIndex?.source ?? null,
    currentSource: currentIndex.source,

    summary: {
      previousQuestCount: previousIndex?.quests.length ?? 0,
      currentQuestCount: currentIndex.quests.length,

      addedQuestCount: addedQuests.length,
      removedQuestCount: removedQuests.length,
      changedQuestCount: changedQuests.length,

      sourceChanged,
    },

    addedQuests,
    removedQuests,
    changedQuests,
  };
}
