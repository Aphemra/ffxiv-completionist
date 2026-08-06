import { readdir } from 'node:fs/promises';
import path from 'node:path';

import {
  questCollectionFileSchema,
  type QuestCollectionFile,
} from '../../src/modules/quests/data/questCollectionFileSchemas';
import {
  questManifestSchema,
  type QuestDuty,
  type QuestUnlock,
} from '../../src/modules/quests/data/questSchemas';
import {
  interpretQuestDutyReferences,
  interpretQuestUnlocks,
  type InterpretedQuestDutyReference,
} from './interpretQuestUnlocks';
import {
  resolveQuestDutyReferences,
  type ResolvedQuestDuty,
} from './questDutyResolver';
import {
  questChainExportSchema,
  type QuestChainExport,
  type QuestExportEntry,
} from './questExportSchemas';
import {
  projectRoot,
  readJsonFile,
  writeJsonFile,
  xivapiCacheRoot,
  xivapiRoot,
} from './paths';
import { xivapiRowResponseSchema } from './schemas';

type ExportUnlock = QuestExportEntry['unlocks'][number];

type ExportDuty = QuestExportEntry['duties'][number];

interface LoadedExport {
  filePath: string;
  data: QuestChainExport;
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

function unlockKey(unlock: {
  type: string;
  targetId?: string;
  sourceRowId?: number;
  name: string;
}): string {
  return [
    unlock.type,
    unlock.targetId ??
      (unlock.sourceRowId !== undefined
        ? `row-${unlock.sourceRowId}`
        : unlock.name.toLocaleLowerCase('en-US')),
  ].join('|');
}

function mergeExportUnlocks(
  existingUnlocks: readonly ExportUnlock[],
  discoveredUnlocks: readonly ReturnType<
    typeof interpretQuestUnlocks
  >[number][],
): ExportUnlock[] {
  const mergedUnlocks = [...existingUnlocks];

  const unlockIndexByKey = new Map(
    mergedUnlocks.map((unlock, index) => [
      unlockKey({
        type: unlock.type,
        targetId: unlock.id,
        sourceRowId: unlock.sourceRowId,
        name: unlock.name,
      }),
      index,
    ]),
  );

  for (const discoveredUnlock of discoveredUnlocks) {
    const exportUnlock: ExportUnlock = {
      type: discoveredUnlock.type,
      id: discoveredUnlock.targetId,
      sourceRowId: discoveredUnlock.sourceRowId,
      name: discoveredUnlock.name,
      details: discoveredUnlock.notes,
    };

    const key = unlockKey({
      type: exportUnlock.type,
      targetId: exportUnlock.id,
      sourceRowId: exportUnlock.sourceRowId,
      name: exportUnlock.name,
    });

    const existingIndex = unlockIndexByKey.get(key);

    if (existingIndex === undefined) {
      unlockIndexByKey.set(key, mergedUnlocks.length);
      mergedUnlocks.push(exportUnlock);
      continue;
    }

    const existingUnlock = mergedUnlocks[existingIndex];

    if (!existingUnlock) {
      continue;
    }

    mergedUnlocks[existingIndex] = {
      ...exportUnlock,
      ...existingUnlock,
      sourceRowId: existingUnlock.sourceRowId ?? exportUnlock.sourceRowId,
      details: existingUnlock.details ?? exportUnlock.details,
    };
  }

  return mergedUnlocks;
}

function mergePublishedUnlocks(
  existingUnlocks: readonly QuestUnlock[],
  discoveredUnlocks: readonly ReturnType<
    typeof interpretQuestUnlocks
  >[number][],
): QuestUnlock[] {
  const mergedUnlocks = [...existingUnlocks];

  const unlockIndexByKey = new Map(
    mergedUnlocks.map((unlock, index) => [unlockKey(unlock), index]),
  );

  for (const discoveredUnlock of discoveredUnlocks) {
    const publishedUnlock: QuestUnlock = {
      type: discoveredUnlock.type,
      targetId: discoveredUnlock.targetId,
      sourceRowId: discoveredUnlock.sourceRowId,
      name: discoveredUnlock.name,
      notes: discoveredUnlock.notes,
    };

    const key = unlockKey(publishedUnlock);
    const existingIndex = unlockIndexByKey.get(key);

    if (existingIndex === undefined) {
      unlockIndexByKey.set(key, mergedUnlocks.length);
      mergedUnlocks.push(publishedUnlock);
      continue;
    }

    const existingUnlock = mergedUnlocks[existingIndex];

    if (!existingUnlock) {
      continue;
    }

    mergedUnlocks[existingIndex] = {
      ...publishedUnlock,
      ...existingUnlock,
      sourceRowId: existingUnlock.sourceRowId ?? publishedUnlock.sourceRowId,
      notes: existingUnlock.notes ?? publishedUnlock.notes,
    };
  }

  return mergedUnlocks;
}

function exportDutyKey(duty: Pick<ExportDuty, 'id' | 'sourceRowId'>): string {
  return [duty.sourceRowId, duty.id].join('|');
}

function publishedDutyKey(duty: Pick<QuestDuty, 'id' | 'sourceRowId'>): string {
  return [duty.sourceRowId ?? 'unknown', duty.id].join('|');
}

function mergeExportDuties(
  existingDuties: readonly ExportDuty[],
  discoveredDuties: readonly ResolvedQuestDuty[],
): ExportDuty[] {
  const mergedDuties = [...existingDuties];

  const dutyIndexByKey = new Map(
    mergedDuties.map((duty, index) => [exportDutyKey(duty), index]),
  );

  for (const discoveredDuty of discoveredDuties) {
    const exportDuty: ExportDuty = {
      id: discoveredDuty.id,

      sourceRowId: discoveredDuty.contentFinderConditionRowId,

      contentRowId: discoveredDuty.contentRowId,

      name: discoveredDuty.name,

      type: discoveredDuty.type,

      relationship: discoveredDuty.relationship,

      level: discoveredDuty.level,

      minimumItemLevel: discoveredDuty.minimumItemLevel,

      partySize: discoveredDuty.partySize,

      levelSync: discoveredDuty.levelSync,

      highEnd: discoveredDuty.highEnd,
    };

    const key = exportDutyKey(exportDuty);
    const existingIndex = dutyIndexByKey.get(key);

    if (existingIndex === undefined) {
      dutyIndexByKey.set(key, mergedDuties.length);
      mergedDuties.push(exportDuty);
      continue;
    }

    const existingDuty = mergedDuties[existingIndex];

    if (!existingDuty) {
      continue;
    }

    /*
     * Preserve any manually edited values while filling fields
     * that were previously unavailable.
     */
    mergedDuties[existingIndex] = {
      ...exportDuty,
      ...existingDuty,

      contentRowId: existingDuty.contentRowId ?? exportDuty.contentRowId,

      minimumItemLevel:
        existingDuty.minimumItemLevel ?? exportDuty.minimumItemLevel,

      partySize: existingDuty.partySize ?? exportDuty.partySize,

      levelSync: existingDuty.levelSync ?? exportDuty.levelSync,
    };
  }

  return mergedDuties;
}

function mergePublishedDuties(
  existingDuties: readonly QuestDuty[],
  discoveredDuties: readonly ResolvedQuestDuty[],
): QuestDuty[] {
  const mergedDuties = [...existingDuties];

  const dutyIndexByKey = new Map(
    mergedDuties.map((duty, index) => [publishedDutyKey(duty), index]),
  );

  for (const discoveredDuty of discoveredDuties) {
    const publishedDuty: QuestDuty = {
      id: discoveredDuty.id,

      sourceRowId: discoveredDuty.contentFinderConditionRowId,

      name: discoveredDuty.name,

      type: discoveredDuty.type,

      relationship: discoveredDuty.relationship,

      level: discoveredDuty.level,

      minimumItemLevel: discoveredDuty.minimumItemLevel,

      partySize: discoveredDuty.partySize,

      levelSync: discoveredDuty.levelSync,

      extensions: {
        'xivapi-instance-content-row': discoveredDuty.contentRowId,

        'xivapi-high-end-duty': discoveredDuty.highEnd,
      },
    };

    const key = publishedDutyKey(publishedDuty);
    const existingIndex = dutyIndexByKey.get(key);

    if (existingIndex === undefined) {
      dutyIndexByKey.set(key, mergedDuties.length);
      mergedDuties.push(publishedDuty);
      continue;
    }

    const existingDuty = mergedDuties[existingIndex];

    if (!existingDuty) {
      continue;
    }

    mergedDuties[existingIndex] = {
      ...publishedDuty,
      ...existingDuty,

      sourceRowId: existingDuty.sourceRowId ?? publishedDuty.sourceRowId,

      minimumItemLevel:
        existingDuty.minimumItemLevel ?? publishedDuty.minimumItemLevel,

      partySize: existingDuty.partySize ?? publishedDuty.partySize,

      levelSync: existingDuty.levelSync ?? publishedDuty.levelSync,

      extensions: {
        ...publishedDuty.extensions,
        ...existingDuty.extensions,
      },
    };
  }

  return mergedDuties;
}

function createDutyUnlocks(
  duties: readonly ResolvedQuestDuty[],
): ReturnType<typeof interpretQuestUnlocks> {
  return duties
    .filter((duty) => duty.relationship === 'unlocked')
    .map((duty) => ({
      type: duty.type,

      targetId: duty.id,

      sourceRowId: duty.contentFinderConditionRowId,

      name: duty.name,
    }));
}

function resolveDutiesForQuest(
  questRowId: number,
  dutyReferencesByRowId: ReadonlyMap<
    number,
    readonly InterpretedQuestDutyReference[]
  >,
  dutyMetadataByRowId: ReadonlyMap<number, ResolvedQuestDuty>,
): ResolvedQuestDuty[] {
  const references = dutyReferencesByRowId.get(questRowId) ?? [];

  const resolvedDuties: ResolvedQuestDuty[] = [];

  for (const reference of references) {
    const duty = dutyMetadataByRowId.get(reference.instanceContentRowId);

    /*
     * A missing metadata entry means the InstanceContent
     * row represents a non-Duty-Finder quest instance.
     */
    if (!duty) {
      continue;
    }

    resolvedDuties.push({
      ...duty,
      relationship: reference.relationship,
    });
  }

  return resolvedDuties;
}

function readQuestRowId(
  value: string | number | undefined,
): number | undefined {
  const rowId = typeof value === 'number' ? value : Number(value);

  return Number.isInteger(rowId) && rowId > 0 ? rowId : undefined;
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

async function loadQuestReferences(rowIds: ReadonlySet<number>): Promise<{
  unlocksByRowId: Map<number, ReturnType<typeof interpretQuestUnlocks>>;

  dutyReferencesByRowId: Map<number, InterpretedQuestDutyReference[]>;

  missingCacheCount: number;
}> {
  const unlocksByRowId = new Map<
    number,
    ReturnType<typeof interpretQuestUnlocks>
  >();

  const dutyReferencesByRowId = new Map<
    number,
    InterpretedQuestDutyReference[]
  >();

  let missingCacheCount = 0;

  for (const rowId of rowIds) {
    const focusedPath = path.join(
      xivapiCacheRoot,
      'inspection',
      `quest-${rowId}.focused.json`,
    );

    try {
      const response = xivapiRowResponseSchema.parse(
        await readJsonFile(focusedPath),
      );

      const fields = response.fields as Record<string, unknown>;

      unlocksByRowId.set(rowId, interpretQuestUnlocks(fields, rowId));

      dutyReferencesByRowId.set(rowId, interpretQuestDutyReferences(fields));
    } catch (error) {
      const errorCode =
        error instanceof Error && 'code' in error
          ? String(error.code)
          : undefined;

      if (errorCode === 'ENOENT') {
        missingCacheCount += 1;
        continue;
      }

      throw new Error(`Could not interpret cached Quest row ${rowId}.`, {
        cause: error,
      });
    }
  }

  return {
    unlocksByRowId,
    dutyReferencesByRowId,
    missingCacheCount,
  };
}

async function backfillExports(
  loadedExports: readonly LoadedExport[],

  unlocksByRowId: ReadonlyMap<number, ReturnType<typeof interpretQuestUnlocks>>,

  dutyReferencesByRowId: ReadonlyMap<
    number,
    readonly InterpretedQuestDutyReference[]
  >,

  dutyMetadataByRowId: ReadonlyMap<number, ResolvedQuestDuty>,

  shouldWrite: boolean,
): Promise<number> {
  let updatedQuestCount = 0;

  for (const loadedExport of loadedExports) {
    let fileChanged = false;

    const quests = loadedExport.data.quests.map((quest) => {
      const directUnlocks = unlocksByRowId.get(quest.xivapiRowId) ?? [];

      const discoveredDuties = resolveDutiesForQuest(
        quest.xivapiRowId,
        dutyReferencesByRowId,
        dutyMetadataByRowId,
      );

      const discoveredUnlocks = [
        ...directUnlocks,
        ...createDutyUnlocks(discoveredDuties),
      ];

      const duties = mergeExportDuties(quest.duties, discoveredDuties);

      const unlocks = mergeExportUnlocks(quest.unlocks, discoveredUnlocks);

      const dutiesChanged =
        JSON.stringify(duties) !== JSON.stringify(quest.duties);

      const unlocksChanged =
        JSON.stringify(unlocks) !== JSON.stringify(quest.unlocks);

      if (!dutiesChanged && !unlocksChanged) {
        return quest;
      }

      fileChanged = true;
      updatedQuestCount += 1;

      return {
        ...quest,
        duties,
        unlocks,
      };
    });

    if (!fileChanged) {
      continue;
    }

    const updatedExport = questChainExportSchema.parse({
      ...loadedExport.data,
      quests,
    });

    console.log(`Export: ${path.relative(projectRoot, loadedExport.filePath)}`);

    if (shouldWrite) {
      await writeJsonFile(loadedExport.filePath, updatedExport);
    }
  }

  return updatedQuestCount;
}

async function backfillPublishedCollections(
  unlocksByRowId: ReadonlyMap<number, ReturnType<typeof interpretQuestUnlocks>>,

  dutyReferencesByRowId: ReadonlyMap<
    number,
    readonly InterpretedQuestDutyReference[]
  >,

  dutyMetadataByRowId: ReadonlyMap<number, ResolvedQuestDuty>,

  shouldWrite: boolean,
): Promise<number> {
  const manifestPath = path.join(
    projectRoot,
    'public',
    'data',
    'quests',
    'manifest.json',
  );

  const manifest = questManifestSchema.parse(await readJsonFile(manifestPath));

  let updatedQuestCount = 0;

  for (const manifestEntry of manifest.collections) {
    const collectionPath = path.join(projectRoot, 'public', manifestEntry.path);

    const collection = questCollectionFileSchema.parse(
      await readJsonFile(collectionPath),
    );

    let fileChanged = false;

    const groups = collection.groups.map((group) => ({
      ...group,

      quests: group.quests.map((quest) => {
        const rowId = readQuestRowId(quest.externalIds?.['xivapi-quest-row']);

        if (rowId === undefined) {
          return quest;
        }

        const directUnlocks = unlocksByRowId.get(rowId) ?? [];

        const discoveredDuties = resolveDutiesForQuest(
          rowId,
          dutyReferencesByRowId,
          dutyMetadataByRowId,
        );

        const discoveredUnlocks = [
          ...directUnlocks,
          ...createDutyUnlocks(discoveredDuties),
        ];

        const existingDuties = quest.duties ?? [];

        const existingUnlocks = quest.unlocks ?? [];

        const duties = mergePublishedDuties(existingDuties, discoveredDuties);

        const unlocks = mergePublishedUnlocks(
          existingUnlocks,
          discoveredUnlocks,
        );

        const dutiesChanged =
          JSON.stringify(duties) !== JSON.stringify(existingDuties);

        const unlocksChanged =
          JSON.stringify(unlocks) !== JSON.stringify(existingUnlocks);

        if (!dutiesChanged && !unlocksChanged) {
          return quest;
        }

        fileChanged = true;
        updatedQuestCount += 1;

        return {
          ...quest,
          duties,
          unlocks,
        };
      }),
    }));

    if (!fileChanged) {
      continue;
    }

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

  return updatedQuestCount;
}

async function main(): Promise<void> {
  const shouldWrite = hasFlag('--write');

  const loadedExports = await loadExports();

  const rowIds = new Set(
    loadedExports.flatMap((loadedExport) =>
      loadedExport.data.quests.map((quest) => quest.xivapiRowId),
    ),
  );

  const { unlocksByRowId, dutyReferencesByRowId, missingCacheCount } =
    await loadQuestReferences(rowIds);

  const allDutyReferences = Array.from(dutyReferencesByRowId.values()).flat();

  const resolvedDutyMetadata =
    await resolveQuestDutyReferences(allDutyReferences);

  const dutyMetadataByRowId = new Map(
    resolvedDutyMetadata.map((duty) => [duty.instanceContentRowId, duty]),
  );

  const exportUpdateCount = await backfillExports(
    loadedExports,
    unlocksByRowId,
    dutyReferencesByRowId,
    dutyMetadataByRowId,
    shouldWrite,
  );

  const publishedUpdateCount = await backfillPublishedCollections(
    unlocksByRowId,
    dutyReferencesByRowId,
    dutyMetadataByRowId,
    shouldWrite,
  );

  console.log('');
  console.log(`Quest rows examined: ${rowIds.size}`);
  console.log(`Missing focused caches: ${missingCacheCount}`);
  console.log(`Duty rows resolved: ${dutyMetadataByRowId.size}`);
  console.log(`Export quests updated: ${exportUpdateCount}`);
  console.log(`Published quest entries updated: ${publishedUpdateCount}`);

  console.log(
    shouldWrite
      ? 'Unlock backfill completed.'
      : 'Dry run only; rerun with --write to apply these changes.',
  );
}

await main();
