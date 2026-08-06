import { readdir } from 'node:fs/promises';
import path from 'node:path';

import {
  questCollectionFileSchema,
  type QuestCollectionFile,
} from '../../src/modules/quests/data/questCollectionFileSchemas';
import {
  questManifestSchema,
  type QuestItem,
} from '../../src/modules/quests/data/questSchemas';
import {
  questChainExportSchema,
  type QuestChainExport,
  type QuestExportEntry,
} from './questExportSchemas';
import { projectRoot, readJsonFile, writeJsonFile, xivapiRoot } from './paths';

type PublishedQuest = QuestCollectionFile['groups'][number]['quests'][number];

type ExportRequirement = QuestExportEntry['requirements'][number];

type ExportItemRequirement = Extract<ExportRequirement, { type: 'item' }>;

type PublishedRequirement = NonNullable<PublishedQuest['requirements']>[number];

type PublishedItemRequirement = Extract<PublishedRequirement, { type: 'item' }>;

interface QuestItemSource {
  sourceRowId?: number;
  sourceSheet?: 'item' | 'event-item';
}

interface MigrationResult<T> {
  quest: T;
  movedItemCount: number;
}

interface MigrationSummary {
  updatedFileCount: number;
  updatedQuestCount: number;
  movedItemCount: number;
}

function hasFlag(flagName: string): boolean {
  return process.argv.includes(flagName);
}

async function listJsonFiles(directoryPath: string): Promise<string[]> {
  const entries = await readdir(directoryPath, {
    withFileTypes: true,
  });

  const filePaths: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      filePaths.push(...(await listJsonFiles(entryPath)));

      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.json')) {
      filePaths.push(entryPath);
    }
  }

  return filePaths.sort();
}

function readQuestItemSource(itemId: string): QuestItemSource {
  const eventItemMatch = /^event-item-(\d+)$/.exec(itemId);

  if (eventItemMatch?.[1]) {
    return {
      sourceRowId: Number(eventItemMatch[1]),
      sourceSheet: 'event-item',
    };
  }

  const itemMatch = /^item-(\d+)$/.exec(itemId);

  if (itemMatch?.[1]) {
    return {
      sourceRowId: Number(itemMatch[1]),
      sourceSheet: 'item',
    };
  }

  return {};
}

function isExportItemRequirement(
  requirement: ExportRequirement,
): requirement is ExportItemRequirement {
  return requirement.type === 'item';
}

function isPublishedItemRequirement(
  requirement: PublishedRequirement,
): requirement is PublishedItemRequirement {
  return requirement.type === 'item';
}

function convertExportItemRequirement(
  requirement: ExportItemRequirement,
): QuestItem {
  const source = readQuestItemSource(requirement.itemId);

  return {
    itemId: requirement.itemId,
    itemName: requirement.itemName,

    ...source,

    ...(requirement.quantity !== null
      ? { quantity: requirement.quantity }
      : {}),

    ...(requirement.quality ? { quality: requirement.quality } : {}),

    usage: 'used-during-quest',
  };
}

function convertPublishedItemRequirement(
  requirement: PublishedItemRequirement,
): QuestItem {
  const source = readQuestItemSource(requirement.itemId);

  return {
    itemId: requirement.itemId,
    itemName: requirement.itemName,

    ...source,

    quantity: requirement.quantity,
    quality: requirement.quality,

    usage: 'used-during-quest',

    ...(requirement.notes ? { notes: requirement.notes } : {}),
  };
}

function questItemKey(item: QuestItem): string {
  return item.itemId;
}

/*
 * Multiple legacy requirement entries for the same item represent
 * multiple quest-script references. Their known quantities are added.
 *
 * If either quantity is unknown, the consolidated quantity remains
 * unknown rather than pretending that the known value is complete.
 */
function consolidateMigratedQuestItems(
  items: readonly QuestItem[],
): QuestItem[] {
  const consolidated = new Map<string, QuestItem>();

  for (const item of items) {
    const key = questItemKey(item);
    const existingItem = consolidated.get(key);

    if (!existingItem) {
      consolidated.set(key, item);
      continue;
    }

    const combinedItem: QuestItem = {
      ...existingItem,

      sourceRowId: existingItem.sourceRowId ?? item.sourceRowId,

      sourceSheet: existingItem.sourceSheet ?? item.sourceSheet,

      quality: existingItem.quality ?? item.quality,

      notes: existingItem.notes ?? item.notes,
    };

    if (existingItem.quantity !== undefined && item.quantity !== undefined) {
      combinedItem.quantity = existingItem.quantity + item.quantity;
    } else {
      delete combinedItem.quantity;
    }

    consolidated.set(key, combinedItem);
  }

  return Array.from(consolidated.values());
}

/*
 * Existing questItems take priority over migrated legacy copies.
 * This makes the migration safe to rerun and preserves later manual
 * edits made directly in questItems.
 */
function mergeQuestItems(
  existingItems: readonly QuestItem[],
  migratedItems: readonly QuestItem[],
): QuestItem[] {
  const mergedItems = [...existingItems];

  const itemIndexByKey = new Map(
    mergedItems.map((item, index) => [questItemKey(item), index]),
  );

  for (const migratedItem of consolidateMigratedQuestItems(migratedItems)) {
    const key = questItemKey(migratedItem);
    const existingIndex = itemIndexByKey.get(key);

    if (existingIndex === undefined) {
      itemIndexByKey.set(key, mergedItems.length);
      mergedItems.push(migratedItem);
      continue;
    }

    const existingItem = mergedItems[existingIndex];

    if (!existingItem) {
      continue;
    }

    mergedItems[existingIndex] = {
      ...migratedItem,
      ...existingItem,

      sourceRowId: existingItem.sourceRowId ?? migratedItem.sourceRowId,

      sourceSheet: existingItem.sourceSheet ?? migratedItem.sourceSheet,

      quantity: existingItem.quantity ?? migratedItem.quantity,

      quality: existingItem.quality ?? migratedItem.quality,

      sourceInstruction:
        existingItem.sourceInstruction ?? migratedItem.sourceInstruction,

      notes: existingItem.notes ?? migratedItem.notes,

      extensions: existingItem.extensions ?? migratedItem.extensions,
    };
  }

  return mergedItems;
}

function migrateExportQuest(
  quest: QuestExportEntry,
): MigrationResult<QuestExportEntry> {
  const itemRequirements = quest.requirements.filter(isExportItemRequirement);

  if (itemRequirements.length === 0) {
    return {
      quest,
      movedItemCount: 0,
    };
  }

  const requirements = quest.requirements.filter(
    (requirement) => !isExportItemRequirement(requirement),
  );

  const migratedItems = itemRequirements.map(convertExportItemRequirement);

  const questItems = mergeQuestItems(quest.questItems, migratedItems);

  return {
    quest: {
      ...quest,
      requirements,
      questItems,
    },

    movedItemCount: itemRequirements.length,
  };
}

function migratePublishedQuest(
  quest: PublishedQuest,
): MigrationResult<PublishedQuest> {
  const existingRequirements = quest.requirements ?? [];

  const itemRequirements = existingRequirements.filter(
    isPublishedItemRequirement,
  );

  if (itemRequirements.length === 0) {
    return {
      quest,
      movedItemCount: 0,
    };
  }

  const requirements = existingRequirements.filter(
    (requirement) => !isPublishedItemRequirement(requirement),
  );

  const migratedItems = itemRequirements.map(convertPublishedItemRequirement);

  const questItems = mergeQuestItems(quest.questItems ?? [], migratedItems);

  return {
    quest: {
      ...quest,

      requirements: requirements.length > 0 ? requirements : undefined,

      questItems,
    },

    movedItemCount: itemRequirements.length,
  };
}

function migrateExportIssues(
  issues: QuestChainExport['issues'],
): QuestChainExport['issues'] {
  return issues.map((issue) => {
    if (issue.field === 'requirements.item.name') {
      return {
        ...issue,
        field: 'questItems.itemName',
      };
    }

    if (issue.field === 'requirements.item.quantity') {
      return {
        ...issue,
        field: 'questItems.quantity',

        message: issue.message.replace(
          'Confirm the required quantity for',
          'Confirm the quest item quantity for',
        ),
      };
    }

    return issue;
  });
}

async function migrateExports(shouldWrite: boolean): Promise<MigrationSummary> {
  const exportDirectory = path.join(xivapiRoot, 'exports');

  const exportPaths = await listJsonFiles(exportDirectory);

  const summary: MigrationSummary = {
    updatedFileCount: 0,
    updatedQuestCount: 0,
    movedItemCount: 0,
  };

  for (const filePath of exportPaths) {
    const exportData = questChainExportSchema.parse(
      await readJsonFile(filePath),
    );

    let fileChanged = false;

    const quests = exportData.quests.map((quest) => {
      const result = migrateExportQuest(quest);

      if (result.movedItemCount > 0) {
        fileChanged = true;

        summary.updatedQuestCount += 1;
        summary.movedItemCount += result.movedItemCount;
      }

      return result.quest;
    });

    if (!fileChanged) {
      continue;
    }

    summary.updatedFileCount += 1;

    const updatedExport = questChainExportSchema.parse({
      ...exportData,

      issues: migrateExportIssues(exportData.issues),

      quests,
    });

    console.log(`Export: ${path.relative(projectRoot, filePath)}`);

    if (shouldWrite) {
      await writeJsonFile(filePath, updatedExport);
    }
  }

  return summary;
}

async function migratePublishedCollections(
  shouldWrite: boolean,
): Promise<MigrationSummary> {
  const manifestPath = path.join(
    projectRoot,
    'public',
    'data',
    'quests',
    'manifest.json',
  );

  const manifest = questManifestSchema.parse(await readJsonFile(manifestPath));

  const summary: MigrationSummary = {
    updatedFileCount: 0,
    updatedQuestCount: 0,
    movedItemCount: 0,
  };

  for (const manifestEntry of manifest.collections) {
    const collectionPath = path.join(projectRoot, 'public', manifestEntry.path);

    const collection = questCollectionFileSchema.parse(
      await readJsonFile(collectionPath),
    );

    let fileChanged = false;

    const groups = collection.groups.map((group) => ({
      ...group,

      quests: group.quests.map((quest) => {
        const result = migratePublishedQuest(quest);

        if (result.movedItemCount > 0) {
          fileChanged = true;

          summary.updatedQuestCount += 1;
          summary.movedItemCount += result.movedItemCount;
        }

        return result.quest;
      }),
    }));

    if (!fileChanged) {
      continue;
    }

    summary.updatedFileCount += 1;

    const updatedCollection: QuestCollectionFile =
      questCollectionFileSchema.parse({
        ...collection,
        groups,
      });

    console.log(`Published: ${manifestEntry.path}`);

    if (shouldWrite) {
      await writeJsonFile(collectionPath, updatedCollection);
    }
  }

  return summary;
}

function printSummary(label: string, summary: MigrationSummary): void {
  console.log('');
  console.log(label);
  console.log(`Files updated: ${summary.updatedFileCount}`);
  console.log(`Quests updated: ${summary.updatedQuestCount}`);
  console.log(`Item entries moved: ${summary.movedItemCount}`);
}

async function main(): Promise<void> {
  const shouldWrite = hasFlag('--write');

  const exportSummary = await migrateExports(shouldWrite);

  const publishedSummary = await migratePublishedCollections(shouldWrite);

  printSummary('Exports', exportSummary);
  printSummary('Published collections', publishedSummary);

  console.log('');

  console.log(
    shouldWrite
      ? 'Quest item migration completed.'
      : 'Dry run only; rerun with --write to apply these changes.',
  );
}

await main();
