import { readdir } from 'node:fs/promises';

import path from 'node:path';

import { isSupportedCollectibleItemActionRowId } from './interpretQuestUnlocks';

import {
  projectRoot,
  readJsonFile,
  xivapiCacheRoot,
  xivapiRoot,
} from './paths';

import {
  questChainExportSchema,
  type QuestChainExport,
} from './questExportSchemas';

import { xivapiRowResponseSchema } from './schemas';

type JsonObject = Record<string, unknown>;

interface LoadedExport {
  filePath: string;
  data: QuestChainExport;
}

interface QuestReference {
  rowId: number;
  questId: string;
  questName: string;
  exportPath: string;
}

interface RewardActionEntry extends QuestReference {
  itemRowId: number;
  itemName: string;
  categoryName?: string;
  actionRowId: number;
}

const ignoredItemCategoryNames = new Set(['Meal', 'Medicine']);

/**
 * Reviewed fixed-reward actions that do not permanently unlock
 * collectibles or player features.
 */
const ignoredItemActionRowIds = new Set([
  816, // Crafting EXP manuals
  4647, // Level/weapon coffers
  9994, // Vesper Bay Aetheryte Ticket
]);

function readOption(optionName: string): string | undefined {
  const optionIndex = process.argv.indexOf(optionName);

  const value = optionIndex >= 0 ? process.argv[optionIndex + 1] : undefined;

  if (value === undefined || value.startsWith('--')) {
    return undefined;
  }

  return value;
}

function hasFlag(flagName: string): boolean {
  return process.argv.includes(flagName);
}

function asObject(value: unknown): JsonObject | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }

  return value as JsonObject;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function readInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value)
    ? value
    : undefined;
}

function readString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function relationFields(value: unknown): JsonObject | undefined {
  return asObject(asObject(value)?.fields);
}

function relationRowId(value: unknown): number | undefined {
  const relation = asObject(value);

  const rowId = readInteger(relation?.row_id) ?? readInteger(relation?.value);

  return rowId !== undefined && rowId > 0 ? rowId : undefined;
}

function relationName(value: unknown): string | undefined {
  const fields = relationFields(value);

  return readString(fields?.Name) ?? readString(fields?.Singular);
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

async function loadExports(): Promise<LoadedExport[]> {
  const exportDirectory = path.join(xivapiRoot, 'exports');

  const exportPaths = await listJsonFiles(exportDirectory);

  return Promise.all(
    exportPaths.map(async (filePath) => ({
      filePath,

      data: questChainExportSchema.parse(await readJsonFile(filePath)),
    })),
  );
}

function collectQuestReferences(
  loadedExports: readonly LoadedExport[],
  category: string,
): Map<number, QuestReference> {
  const referencesByRowId = new Map<number, QuestReference>();

  for (const loadedExport of loadedExports) {
    if (loadedExport.data.category !== category) {
      continue;
    }

    const exportPath = path
      .relative(projectRoot, loadedExport.filePath)
      .split(path.sep)
      .join('/');

    for (const quest of loadedExport.data.quests) {
      referencesByRowId.set(quest.xivapiRowId, {
        rowId: quest.xivapiRowId,
        questId: quest.id,
        questName: quest.name,
        exportPath,
      });
    }
  }

  return referencesByRowId;
}

function createRewardActionEntry(
  rawRewardItem: unknown,
  reference: QuestReference,
): RewardActionEntry | undefined {
  const itemRowId = relationRowId(rawRewardItem);

  const itemName = relationName(rawRewardItem);

  const itemFields = relationFields(rawRewardItem);

  if (itemRowId === undefined || !itemName || !itemFields) {
    return undefined;
  }

  const itemActionFields = relationFields(itemFields.ItemAction);

  const actionRowId = relationRowId(itemActionFields?.Action);

  if (actionRowId === undefined) {
    return undefined;
  }

  return {
    ...reference,
    itemRowId,
    itemName,

    categoryName: relationName(itemFields.ItemUICategory),

    actionRowId,
  };
}

function isReviewedNonCollectibleAction(entry: RewardActionEntry): boolean {
  return (
    ignoredItemActionRowIds.has(entry.actionRowId) ||
    (entry.categoryName !== undefined &&
      ignoredItemCategoryNames.has(entry.categoryName))
  );
}

async function auditRewardActions(
  referencesByRowId: ReadonlyMap<number, QuestReference>,
): Promise<{
  supportedEntries: RewardActionEntry[];
  ignoredEntries: RewardActionEntry[];
  unreviewedEntries: RewardActionEntry[];
  missingCacheEntries: QuestReference[];
}> {
  const supportedEntries: RewardActionEntry[] = [];

  const ignoredEntries: RewardActionEntry[] = [];

  const unreviewedEntries: RewardActionEntry[] = [];

  const missingCacheEntries: QuestReference[] = [];

  for (const reference of referencesByRowId.values()) {
    const focusedPath = path.join(
      xivapiCacheRoot,
      'inspection',
      `quest-${reference.rowId}.focused.json`,
    );

    try {
      const response = xivapiRowResponseSchema.parse(
        await readJsonFile(focusedPath),
      );

      const fields = response.fields as JsonObject;

      for (const rawRewardItem of asArray(fields.Reward)) {
        const entry = createRewardActionEntry(rawRewardItem, reference);

        if (!entry) {
          continue;
        }

        if (isSupportedCollectibleItemActionRowId(entry.actionRowId)) {
          supportedEntries.push(entry);
          continue;
        }

        if (isReviewedNonCollectibleAction(entry)) {
          ignoredEntries.push(entry);
          continue;
        }

        unreviewedEntries.push(entry);
      }
    } catch (error) {
      const errorCode =
        error instanceof Error && 'code' in error
          ? String(error.code)
          : undefined;

      if (errorCode === 'ENOENT') {
        missingCacheEntries.push(reference);
        continue;
      }

      throw new Error(
        `Could not inspect cached Quest row ${reference.rowId}.`,
        {
          cause: error,
        },
      );
    }
  }

  return {
    supportedEntries,
    ignoredEntries,
    unreviewedEntries,
    missingCacheEntries,
  };
}

function printEntry(status: string, entry: RewardActionEntry): void {
  console.log(
    [
      `[${status}]`,
      `Quest row ${entry.rowId}`,
      entry.questName,
      `Item row ${entry.itemRowId}`,
      entry.itemName,
      `Action ${entry.actionRowId}`,
      entry.categoryName ?? 'Unknown category',
      entry.exportPath,
    ].join(' | '),
  );
}

async function main(): Promise<void> {
  const category = readOption('--category') ?? 'msq';

  const requireComplete = hasFlag('--require-complete');

  const loadedExports = await loadExports();

  const referencesByRowId = collectQuestReferences(loadedExports, category);

  if (referencesByRowId.size === 0) {
    throw new Error(
      `No exported quests were found for category "${category}".`,
    );
  }

  const {
    supportedEntries,
    ignoredEntries,
    unreviewedEntries,
    missingCacheEntries,
  } = await auditRewardActions(referencesByRowId);

  console.log(`${category} fixed-reward item-action audit`);

  console.log('');

  for (const entry of unreviewedEntries) {
    printEntry('UNREVIEWED', entry);
  }

  for (const entry of missingCacheEntries) {
    console.log(
      [
        '[MISSING CACHE]',
        `Quest row ${entry.rowId}`,
        entry.questName,
        entry.questId,
        entry.exportPath,
      ].join(' | '),
    );
  }

  if (unreviewedEntries.length === 0 && missingCacheEntries.length === 0) {
    console.log('No unreviewed fixed-reward item actions were found.');
  }

  console.log('');
  console.log(`Quest rows examined: ${referencesByRowId.size}`);

  console.log(`Supported collectible rewards: ${supportedEntries.length}`);

  console.log(`Reviewed non-collectible rewards: ${ignoredEntries.length}`);

  console.log(`Unreviewed reward actions: ${unreviewedEntries.length}`);

  console.log(`Missing focused caches: ${missingCacheEntries.length}`);

  if (
    requireComplete &&
    (unreviewedEntries.length > 0 || missingCacheEntries.length > 0)
  ) {
    process.exitCode = 1;
  }
}

await main();
