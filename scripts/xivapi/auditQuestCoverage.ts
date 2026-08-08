import path from 'node:path';

import { questCollectionFileSchema } from '../../src/modules/quests/data/questCollectionFileSchemas';

import { questManifestSchema } from '../../src/modules/quests/data/questSchemas';

import {
  projectRoot,
  questIndexPath,
  readJsonFile,
  writeJsonFile,
  xivapiCacheRoot,
} from './paths';

import { questIndexFileSchema } from './questIndexSchemas';

import { isExcludedQuestRowId } from './excludedQuestRows';

const QUEST_CLASSIFICATION_FIELDS = [
  'isFeatureQuest',
  'isRepeatable',
  'isSeasonalQuest',
] as const;

type QuestClassificationField = (typeof QUEST_CLASSIFICATION_FIELDS)[number];

interface PublishedOccurrence {
  rowId: number;
  questId: string;
  questName: string;
  collectionId: string;
  collectionTitle: string;

  isFeatureQuest: boolean;
  isRepeatable: boolean;
  isSeasonalQuest: boolean;
}

interface PublishedClassificationMismatch {
  rowId: number;
  questId: string;
  questName: string;
  collectionId: string;

  field: QuestClassificationField;

  indexedValue: boolean;
  publishedValue: boolean;
}

interface AllowedDuplicate {
  collectionIds: readonly string[];
  reason: string;
}

const ALLOWED_DUPLICATE_ROWS: ReadonlyMap<number, AllowedDuplicate> = new Map([
  [
    66210,
    {
      collectionIds: ['arr-2-0-gridania-opening', 'arr-2-0-limsa-opening'],
      reason:
        'Call of the Sea is shared by the Gridania and Limsa opening routes.',
    },
  ],
]);

function readQuestRowId(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string' && /^[1-9]\d*$/.test(value)) {
    return Number(value);
  }

  return undefined;
}

function matchesAllowedDuplicate(
  occurrences: readonly PublishedOccurrence[],
  allowedDuplicate: AllowedDuplicate,
): boolean {
  const actualCollectionIds = new Set(
    occurrences.map((occurrence) => occurrence.collectionId),
  );

  return (
    actualCollectionIds.size === allowedDuplicate.collectionIds.length &&
    allowedDuplicate.collectionIds.every((collectionId) =>
      actualCollectionIds.has(collectionId),
    )
  );
}

async function main(): Promise<void> {
  const requireComplete = process.argv.includes('--require-complete');

  const questIndex = questIndexFileSchema.parse(
    await readJsonFile(questIndexPath),
  );

  const manifestPath = path.join(
    projectRoot,
    'public',
    'data',
    'quests',
    'manifest.json',
  );

  const manifest = questManifestSchema.parse(await readJsonFile(manifestPath));

  const occurrencesByRowId = new Map<number, PublishedOccurrence[]>();

  const questsMissingRowIds: Array<{
    questId: string;
    questName: string;
    collectionId: string;
  }> = [];

  for (const manifestEntry of manifest.collections) {
    if (!manifestEntry.enabled) {
      continue;
    }

    const collectionPath = path.join(projectRoot, 'public', manifestEntry.path);

    const collection = questCollectionFileSchema.parse(
      await readJsonFile(collectionPath),
    );

    for (const group of collection.groups) {
      for (const quest of group.quests) {
        const rowId = readQuestRowId(quest.externalIds?.['xivapi-quest-row']);

        if (rowId === undefined) {
          questsMissingRowIds.push({
            questId: quest.id,
            questName: quest.name,
            collectionId: manifestEntry.id,
          });

          continue;
        }

        const occurrence: PublishedOccurrence = {
          rowId,
          questId: quest.id,
          questName: quest.name,
          collectionId: manifestEntry.id,
          collectionTitle: manifestEntry.title,

          isFeatureQuest: quest.isFeatureQuest,
          isRepeatable: quest.isRepeatable,
          isSeasonalQuest: quest.isSeasonalQuest,
        };

        const existingOccurrences = occurrencesByRowId.get(rowId);

        if (existingOccurrences) {
          existingOccurrences.push(occurrence);
        } else {
          occurrencesByRowId.set(rowId, [occurrence]);
        }
      }
    }
  }

  const allowedDuplicates: Array<{
    rowId: number;
    reason: string;
    occurrences: PublishedOccurrence[];
  }> = [];

  const unexpectedDuplicates: Array<{
    rowId: number;
    occurrences: PublishedOccurrence[];
  }> = [];

  for (const [rowId, occurrences] of occurrencesByRowId) {
    if (occurrences.length < 2) {
      continue;
    }

    const allowedDuplicate = ALLOWED_DUPLICATE_ROWS.get(rowId);

    if (
      allowedDuplicate &&
      matchesAllowedDuplicate(occurrences, allowedDuplicate)
    ) {
      allowedDuplicates.push({
        rowId,
        reason: allowedDuplicate.reason,
        occurrences,
      });

      continue;
    }

    unexpectedDuplicates.push({
      rowId,
      occurrences,
    });
  }

  const indexRowsById = new Map(
    questIndex.quests.map((quest) => [quest.rowId, quest]),
  );

  const excludedIndexQuests = questIndex.quests.filter((quest) =>
    isExcludedQuestRowId(quest.rowId),
  );

  const publishedExcludedRows = Array.from(
    occurrencesByRowId,
    ([rowId, occurrences]) => ({
      rowId,
      occurrences,
    }),
  ).filter(({ rowId }) => isExcludedQuestRowId(rowId));

  const publishedRowsMissingFromIndex = Array.from(
    occurrencesByRowId.keys(),
  ).filter((rowId) => !indexRowsById.has(rowId));

  const publishedClassificationMismatches: PublishedClassificationMismatch[] =
    [];

  for (const [rowId, occurrences] of occurrencesByRowId) {
    const indexedQuest = indexRowsById.get(rowId);

    if (!indexedQuest) {
      continue;
    }

    for (const occurrence of occurrences) {
      for (const field of QUEST_CLASSIFICATION_FIELDS) {
        const indexedValue = indexedQuest[field];
        const publishedValue = occurrence[field];

        if (indexedValue === publishedValue) {
          continue;
        }

        publishedClassificationMismatches.push({
          rowId,
          questId: occurrence.questId,
          questName: occurrence.questName,
          collectionId: occurrence.collectionId,

          field,

          indexedValue,
          publishedValue,
        });
      }
    }
  }

  const unpublishedQuests = questIndex.quests.filter(
    (quest) =>
      !isExcludedQuestRowId(quest.rowId) &&
      !occurrencesByRowId.has(quest.rowId),
  );

  const missingCountsByJournalCategory = new Map<string, number>();

  for (const quest of unpublishedQuests) {
    const category = quest.journalCategoryName ?? 'Uncategorized';

    missingCountsByJournalCategory.set(
      category,
      (missingCountsByJournalCategory.get(category) ?? 0) + 1,
    );
  }

  const missingByJournalCategory = Array.from(
    missingCountsByJournalCategory,
    ([journalCategoryName, questCount]) => ({
      journalCategoryName,
      questCount,
    }),
  ).sort(
    (left, right) =>
      right.questCount - left.questCount ||
      left.journalCategoryName.localeCompare(right.journalCategoryName),
  );

  const publishedOccurrenceCount = Array.from(
    occurrencesByRowId.values(),
  ).reduce((total, occurrences) => total + occurrences.length, 0);

  const report = {
    generatedAt: new Date().toISOString(),

    indexSource: questIndex.source,

    summary: {
      indexedQuestRows: questIndex.quests.length,
      excludedQuestRows: excludedIndexQuests.length,

      publishedQuestOccurrences: publishedOccurrenceCount,
      publishedUniqueQuestRows: occurrencesByRowId.size,
      unpublishedQuestRows: unpublishedQuests.length,

      allowedDuplicateRows: allowedDuplicates.length,
      unexpectedDuplicateRows: unexpectedDuplicates.length,

      questsMissingXivapiRowIds: questsMissingRowIds.length,
      publishedRowsMissingFromIndex: publishedRowsMissingFromIndex.length,
      publishedExcludedRows: publishedExcludedRows.length,

      publishedClassificationMismatches:
        publishedClassificationMismatches.length,
    },

    missingByJournalCategory,
    unpublishedQuests,

    allowedDuplicates,
    unexpectedDuplicates,

    questsMissingRowIds,
    publishedRowsMissingFromIndex,
    publishedExcludedRows,

    publishedClassificationMismatches,
  };

  const reportPath = path.join(xivapiCacheRoot, 'quest-coverage.json');

  await writeJsonFile(reportPath, report);

  console.log('');
  console.log('Quest coverage audit');
  console.log('');
  console.log(`Indexed quest rows: ${report.summary.indexedQuestRows}`);
  console.log(`Curated excluded rows: ${report.summary.excludedQuestRows}`);
  console.log(
    `Published occurrences: ${report.summary.publishedQuestOccurrences}`,
  );
  console.log(
    `Published unique rows: ${report.summary.publishedUniqueQuestRows}`,
  );
  console.log(`Unpublished rows: ${report.summary.unpublishedQuestRows}`);
  console.log(`Allowed duplicate rows: ${report.summary.allowedDuplicateRows}`);
  console.log(
    `Unexpected duplicate rows: ${report.summary.unexpectedDuplicateRows}`,
  );
  console.log(
    `Published quests without XIVAPI rows: ${report.summary.questsMissingXivapiRowIds}`,
  );
  console.log(
    `Published rows absent from index: ${report.summary.publishedRowsMissingFromIndex}`,
  );
  console.log(
    `Published excluded rows: ${report.summary.publishedExcludedRows}`,
  );
  console.log(
    `Published classification mismatches: ${report.summary.publishedClassificationMismatches}`,
  );

  console.log('');
  if (publishedClassificationMismatches.length > 0) {
    console.log('');
    console.log('Published classification mismatches');

    for (const mismatch of publishedClassificationMismatches) {
      console.log(
        [
          `- Row ${mismatch.rowId}`,
          mismatch.questName,
          mismatch.collectionId,
          mismatch.field,
          `index=${mismatch.indexedValue}`,
          `published=${mismatch.publishedValue}`,
        ].join(' | '),
      );
    }
  }
  console.log('Largest unpublished journal categories');

  for (const category of missingByJournalCategory.slice(0, 15)) {
    console.log(`- ${category.journalCategoryName}: ${category.questCount}`);
  }

  console.log('');
  console.log(`Full report: ${reportPath}`);

  const hasIntegrityErrors =
    unexpectedDuplicates.length > 0 ||
    questsMissingRowIds.length > 0 ||
    publishedRowsMissingFromIndex.length > 0 ||
    publishedExcludedRows.length > 0 ||
    publishedClassificationMismatches.length > 0;

  if (hasIntegrityErrors || (requireComplete && unpublishedQuests.length > 0)) {
    process.exitCode = 1;
  }
}

await main();
