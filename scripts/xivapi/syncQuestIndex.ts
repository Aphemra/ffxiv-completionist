import path from 'node:path';

import { compareQuestIndexes } from './questIndexComparison';

import { delayBetweenRequests, requestXivapi } from './client';

import { readXivapiPins } from './pins';

import {
  questIndexPath,
  readJsonFile,
  writeJsonFile,
  xivapiCacheRoot,
} from './paths';

import { xivapiSheetResponseSchema } from './schemas';

import {
  isFeatureQuestEventIconType,
  isSeasonalQuestJournalCategory,
} from './questClassification';

import {
  questIndexFileSchema,
  type QuestIndexEntry,
  type QuestIndexFile,
} from './questIndexSchemas';

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }

  return value as JsonObject;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function readString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function readInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value)
    ? value
    : undefined;
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function relationFields(value: unknown): JsonObject | undefined {
  return asObject(asObject(value)?.fields);
}

function relationRowId(value: unknown): number | undefined {
  const relation = asObject(value);

  const rowId = readInteger(relation?.row_id) ?? readInteger(relation?.value);

  return rowId !== undefined && rowId > 0 ? rowId : undefined;
}

function parseRelationshipRowIds(value: unknown): number[] {
  const rowIds: number[] = [];

  for (const rawRelation of asArray(value)) {
    const rowId = relationRowId(rawRelation);

    if (rowId === undefined) {
      continue;
    }

    rowIds.push(rowId);
  }

  return Array.from(new Set(rowIds));
}

function isMainScenarioCategory(
  journalCategoryName: string | undefined,
): boolean {
  if (!journalCategoryName) {
    return false;
  }

  return journalCategoryName.toLowerCase().includes('main scenario');
}

function populateReverseRelationships(quests: QuestIndexEntry[]): void {
  const questsByRowId = new Map(quests.map((quest) => [quest.rowId, quest]));

  for (const quest of quests) {
    for (const previousQuestRowId of quest.previousQuestRowIds) {
      const previousQuest = questsByRowId.get(previousQuestRowId);

      if (!previousQuest) {
        continue;
      }

      if (!previousQuest.nextQuestRowIds.includes(quest.rowId)) {
        previousQuest.nextQuestRowIds.push(quest.rowId);
      }
    }
  }

  for (const quest of quests) {
    quest.nextQuestRowIds.sort((left, right) => left - right);
  }
}

async function readExistingQuestIndex(): Promise<QuestIndexFile | undefined> {
  try {
    const rawIndex = await readJsonFile(questIndexPath);
    const rawIndexObject = asObject(rawIndex);

    if (rawIndexObject?.indexVersion === 5) {
      const upgradedQuests = asArray(rawIndexObject.quests).map((rawQuest) => {
        const questObject = asObject(rawQuest);

        return questObject
          ? {
              ...questObject,
              isSeasonalQuest: false,
            }
          : rawQuest;
      });

      return questIndexFileSchema.parse({
        ...rawIndexObject,
        indexVersion: 6,
        quests: upgradedQuests,
      });
    }

    return questIndexFileSchema.parse(rawIndex);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return undefined;
    }

    throw error;
  }
}

async function main(): Promise<void> {
  const previousIndex = await readExistingQuestIndex();

  const pins = await readXivapiPins();

  const questEntries: QuestIndexEntry[] = [];

  let after: number | undefined;
  let pageNumber = 1;

  while (true) {
    console.log(`Fetching quest index page ${pageNumber}...`);

    const response = await requestXivapi({
      path: '/sheet/Quest',

      query: {
        fields: [
          'Name',
          'Id',

          'JournalGenre.Name',
          'JournalGenre.JournalCategory.Name',

          'ClassJobRequired.NameEnglish',
          'ClassJobRequired.Abbreviation',

          'EventIconType',

          'BeastTribe.Name',

          'IsRepeatable',

          'PreviousQuest[].Name',
          'PreviousQuest[].Id',
        ].join(','),

        language: 'en',

        version: pins.version,
        schema: pins.schema,

        limit: 500,
        after,
      },

      responseSchema: xivapiSheetResponseSchema,
    });

    if (response.rows.length === 0) {
      break;
    }

    for (const row of response.rows) {
      const name = readString(row.fields.Name);

      if (!name) {
        continue;
      }

      const journalGenreFields = relationFields(row.fields.JournalGenre);

      const journalGenreName = readString(journalGenreFields?.Name);

      const journalCategoryName = readString(
        relationFields(journalGenreFields?.JournalCategory)?.Name,
      );

      const classJobFields = relationFields(row.fields.ClassJobRequired);

      const classJobName =
        readString(classJobFields?.NameEnglish) ??
        readString(classJobFields?.Name);

      const classJobAbbreviation = readString(classJobFields?.Abbreviation);

      const eventIconTypeRowId = relationRowId(row.fields.EventIconType);

      const beastTribeName = readString(
        relationFields(row.fields.BeastTribe)?.Name,
      );

      const isSeasonalQuest =
        isSeasonalQuestJournalCategory(journalCategoryName);

      const isRepeatable = readBoolean(row.fields.IsRepeatable) ?? false;

      const questEntry: QuestIndexEntry = {
        rowId: row.row_id,
        name,

        isMainScenario: isMainScenarioCategory(journalCategoryName),

        isFeatureQuest: isFeatureQuestEventIconType(eventIconTypeRowId),

        isSeasonalQuest,

        isRepeatable,

        previousQuestRowIds: parseRelationshipRowIds(row.fields.PreviousQuest),

        nextQuestRowIds: [],
      };

      const gameId = readString(row.fields.Id);

      if (gameId !== undefined) {
        questEntry.gameId = gameId;
      }

      if (journalGenreName !== undefined) {
        questEntry.journalGenreName = journalGenreName;
      }

      if (classJobName !== undefined) {
        questEntry.classJobName = classJobName;
      }

      if (classJobAbbreviation !== undefined) {
        questEntry.classJobAbbreviation = classJobAbbreviation;
      }

      if (eventIconTypeRowId !== undefined) {
        questEntry.eventIconTypeRowId = eventIconTypeRowId;
      }

      if (beastTribeName !== undefined) {
        questEntry.beastTribeName = beastTribeName;
      }

      if (journalCategoryName !== undefined) {
        questEntry.journalCategoryName = journalCategoryName;
      }

      questEntries.push(questEntry);
    }

    after = response.rows[response.rows.length - 1]?.row_id;

    if (after === undefined) {
      break;
    }

    pageNumber += 1;

    await delayBetweenRequests();
  }

  populateReverseRelationships(questEntries);

  questEntries.sort((left, right) => left.rowId - right.rowId);

  const mainScenarioCount = questEntries.filter(
    (quest) => quest.isMainScenario,
  ).length;

  const repeatableCount = questEntries.filter(
    (quest) => quest.isRepeatable,
  ).length;

  const seasonalCount = questEntries.filter(
    (quest) => quest.isSeasonalQuest,
  ).length;

  const output: QuestIndexFile = {
    indexVersion: 6,

    source: {
      provider: 'xivapi',
      sheet: 'Quest',

      version: pins.version,
      schema: pins.schema,

      language: 'en',

      generatedAt: new Date().toISOString(),
    },

    quests: questEntries,
  };

  const comparison = compareQuestIndexes(previousIndex, output);

  const comparisonPath = path.join(xivapiCacheRoot, 'quest-index-diff.json');

  await writeJsonFile(comparisonPath, comparison);

  const hasSemanticChanges =
    comparison.summary.addedQuestCount > 0 ||
    comparison.summary.removedQuestCount > 0 ||
    comparison.summary.changedQuestCount > 0;

  if (
    previousIndex === undefined ||
    comparison.summary.sourceChanged ||
    hasSemanticChanges
  ) {
    await writeJsonFile(questIndexPath, output);
  }

  console.log('');
  console.log(
    ['Indexed', questEntries.length.toLocaleString(), 'named quest rows.'].join(
      ' ',
    ),
  );

  console.log(
    [
      'Classified',
      mainScenarioCount.toLocaleString(),
      'main-scenario quest rows.',
    ].join(' '),
  );

  console.log(
    [
      'Classified',
      repeatableCount.toLocaleString(),
      'repeatable quest rows.',
    ].join(' '),
  );

  console.log(
    ['Classified', seasonalCount.toLocaleString(), 'seasonal quest rows.'].join(
      ' ',
    ),
  );

  console.log('Calculated reverse next-quest relationships.');

  console.log('');
  console.log('Quest index comparison');
  console.log(`Added quest rows: ${comparison.summary.addedQuestCount}`);
  console.log(`Removed quest rows: ${comparison.summary.removedQuestCount}`);
  console.log(`Changed quest rows: ${comparison.summary.changedQuestCount}`);
  console.log(
    `Source changed: ${comparison.summary.sourceChanged ? 'yes' : 'no'}`,
  );

  console.log('');
  console.log(`Comparison report: ${comparisonPath}`);

  if (
    previousIndex === undefined ||
    comparison.summary.sourceChanged ||
    hasSemanticChanges
  ) {
    console.log(`Updated index: ${questIndexPath}`);
  } else {
    console.log('The tracked quest index is already current.');
  }
}

await main();
