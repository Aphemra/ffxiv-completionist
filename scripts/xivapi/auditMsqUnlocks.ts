import { readdir } from 'node:fs/promises';

import path from 'node:path';

import {
  isReviewedSystemReward,
  readSystemRewardValues,
} from './questUnlockCatalog';

import {
  questChainExportSchema,
  type QuestChainExport,
} from './questExportSchemas';

import {
  projectRoot,
  readJsonFile,
  xivapiCacheRoot,
  xivapiRoot,
} from './paths';

import { xivapiRowResponseSchema } from './schemas';

interface LoadedExport {
  filePath: string;
  data: QuestChainExport;
}

interface ExportQuestReference {
  exportPath: string;
  questId: string;
  questName: string;
  rowId: number;
}

interface SystemRewardAuditEntry extends ExportQuestReference {
  systemReward: number;
  reviewed: boolean;
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

function collectMsqQuestReferences(
  loadedExports: readonly LoadedExport[],
): Map<number, ExportQuestReference> {
  const referencesByRowId = new Map<number, ExportQuestReference>();

  for (const loadedExport of loadedExports) {
    if (loadedExport.data.category !== 'msq') {
      continue;
    }

    const exportPath = path
      .relative(projectRoot, loadedExport.filePath)
      .split(path.sep)
      .join('/');

    for (const quest of loadedExport.data.quests) {
      referencesByRowId.set(quest.xivapiRowId, {
        exportPath,
        questId: quest.id,
        questName: quest.name,
        rowId: quest.xivapiRowId,
      });
    }
  }

  return referencesByRowId;
}

async function auditSystemRewards(
  questReferences: ReadonlyMap<number, ExportQuestReference>,
): Promise<{
  auditEntries: SystemRewardAuditEntry[];
  missingCacheEntries: ExportQuestReference[];
}> {
  const auditEntries: SystemRewardAuditEntry[] = [];

  const missingCacheEntries: ExportQuestReference[] = [];

  for (const reference of questReferences.values()) {
    const focusedPath = path.join(
      xivapiCacheRoot,
      'inspection',
      `quest-${reference.rowId}.focused.json`,
    );

    try {
      const response = xivapiRowResponseSchema.parse(
        await readJsonFile(focusedPath),
      );

      const fields = response.fields as Record<string, unknown>;

      const systemRewards = readSystemRewardValues(fields.SystemReward);

      for (const systemReward of systemRewards) {
        auditEntries.push({
          ...reference,
          systemReward,
          reviewed: isReviewedSystemReward(reference.rowId, systemReward),
        });
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

  auditEntries.sort(
    (left, right) =>
      left.systemReward - right.systemReward || left.rowId - right.rowId,
  );

  missingCacheEntries.sort((left, right) => left.rowId - right.rowId);

  return {
    auditEntries,
    missingCacheEntries,
  };
}

function printAuditEntry(entry: SystemRewardAuditEntry): void {
  const status = entry.reviewed ? 'REVIEWED' : 'UNREVIEWED';

  console.log(
    [
      `[${status}]`,
      `Quest row ${entry.rowId}`,
      `SystemReward ${entry.systemReward}`,
      entry.questName,
      entry.questId,
      entry.exportPath,
    ].join(' | '),
  );
}

async function main(): Promise<void> {
  const loadedExports = await loadExports();

  const questReferences = collectMsqQuestReferences(loadedExports);

  const { auditEntries, missingCacheEntries } =
    await auditSystemRewards(questReferences);

  const reviewedEntries = auditEntries.filter((entry) => entry.reviewed);

  const unreviewedEntries = auditEntries.filter((entry) => !entry.reviewed);

  console.log('MSQ SystemReward audit');
  console.log('');

  if (auditEntries.length === 0) {
    console.log('No nonzero MSQ SystemReward values were found.');
  } else {
    for (const entry of auditEntries) {
      printAuditEntry(entry);
    }
  }

  if (missingCacheEntries.length > 0) {
    console.log('');
    console.log('Missing focused Quest caches:');

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
  }

  console.log('');
  console.log(`MSQ quest rows examined: ${questReferences.size}`);
  console.log(`Nonzero SystemReward rows: ${auditEntries.length}`);
  console.log(`Reviewed SystemReward rows: ${reviewedEntries.length}`);
  console.log(`Unreviewed SystemReward rows: ${unreviewedEntries.length}`);
  console.log(`Missing focused caches: ${missingCacheEntries.length}`);
}

await main();
