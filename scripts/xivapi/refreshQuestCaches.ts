import { readdir } from 'node:fs/promises';

import path from 'node:path';

import { delayBetweenRequests, requestXivapi } from './client';

import { readXivapiPins } from './pins';

import {
  projectRoot,
  readJsonFile,
  writeJsonFile,
  xivapiCacheRoot,
  xivapiRoot,
} from './paths';

import {
  questChainExportSchema,
  type QuestChainExport,
} from './questExportSchemas';

import { QUEST_REVIEW_FIELDS } from './questReviewFields';

import { xivapiRowResponseSchema } from './schemas';

interface LoadedExport {
  filePath: string;
  data: QuestChainExport;
}

interface QuestReference {
  rowId: number;
  questName: string;
}

function readOption(optionName: string): string | undefined {
  const optionIndex = process.argv.indexOf(optionName);

  const value = optionIndex >= 0 ? process.argv[optionIndex + 1] : undefined;

  if (value === undefined || value.startsWith('--')) {
    return undefined;
  }

  return value;
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
): QuestReference[] {
  const referencesByRowId = new Map<number, QuestReference>();

  for (const loadedExport of loadedExports) {
    if (loadedExport.data.category !== category) {
      continue;
    }

    for (const quest of loadedExport.data.quests) {
      referencesByRowId.set(quest.xivapiRowId, {
        rowId: quest.xivapiRowId,
        questName: quest.name,
      });
    }
  }

  return Array.from(referencesByRowId.values()).sort(
    (left, right) => left.rowId - right.rowId,
  );
}

async function main(): Promise<void> {
  const category = readOption('--category') ?? 'msq';

  const loadedExports = await loadExports();

  const questReferences = collectQuestReferences(loadedExports, category);

  if (questReferences.length === 0) {
    throw new Error(
      `No exported quests were found for category "${category}".`,
    );
  }

  const pins = await readXivapiPins();

  console.log(
    `Refreshing ${questReferences.length} ${category} Quest caches...`,
  );

  for (let index = 0; index < questReferences.length; index += 1) {
    const reference = questReferences[index];

    if (!reference) {
      continue;
    }

    console.log(
      [
        `[${index + 1}/${questReferences.length}]`,
        `Quest row ${reference.rowId}`,
        reference.questName,
      ].join(' | '),
    );

    const response = await requestXivapi({
      path: `/sheet/Quest/${reference.rowId}`,

      query: {
        language: 'en',
        version: pins.version,
        schema: pins.schema,
        fields: QUEST_REVIEW_FIELDS,
      },

      responseSchema: xivapiRowResponseSchema,
    });

    const outputPath = path.join(
      xivapiCacheRoot,
      'inspection',
      `quest-${reference.rowId}.focused.json`,
    );

    await writeJsonFile(outputPath, response);

    if (index < questReferences.length - 1) {
      await delayBetweenRequests();
    }
  }

  console.log('');
  console.log(`Refreshed ${questReferences.length} ${category} Quest caches.`);

  console.log(`Cache root: ${path.relative(projectRoot, xivapiCacheRoot)}`);
}

await main();
