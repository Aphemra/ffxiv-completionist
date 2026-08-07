import { access, mkdir, readFile, readdir } from 'node:fs/promises';

import { constants } from 'node:fs';

import { spawn } from 'node:child_process';

import path from 'node:path';

import * as z from 'zod';

import { delayBetweenRequests, requestXivapi } from './client';

import { readXivapiPins } from './pins';

import { xivapiSheetResponseSchema } from './schemas';

import {
  isReviewedSystemReward,
  readSystemRewardValues,
} from './questUnlockCatalog';

import {
  questChainExportSchema,
  questExportEntrySchema,
  type QuestChainExport,
  type QuestExportEntry,
} from './questExportSchemas';

import {
  projectRoot,
  questIndexPath,
  writeJsonFile,
  xivapiCacheRoot,
} from './paths';

import type { InterpretedQuestDutyReference } from './interpretQuestUnlocks';

import {
  resolveQuestDutyReferences,
  type ResolvedQuestDuty,
} from './questDutyResolver';

type JsonObject = Record<string, unknown>;

interface ExportIssue {
  questId: string;
  questName: string;
  field: string;
  message: string;
}

interface ParamGrowExperienceData {
  scaledQuestXp: number;
  questExpModifier: number;
}

const positiveRowIdSchema = z.number().int().positive();

const questIndexEntrySchema = z.looseObject({
  rowId: positiveRowIdSchema,

  name: z.string().min(1),

  gameId: z.string().min(1).optional(),

  journalGenreName: z.string().min(1).optional(),

  journalCategoryName: z.string().min(1).optional(),

  classJobName: z.string().min(1).optional(),

  classJobAbbreviation: z.string().min(1).optional(),

  eventIconTypeRowId: positiveRowIdSchema.optional(),

  beastTribeName: z.string().min(1).optional(),

  isMainScenario: z.boolean(),

  isRepeatable: z.boolean(),

  previousQuestRowIds: z.array(positiveRowIdSchema),

  nextQuestRowIds: z.array(positiveRowIdSchema),
});

type QuestIndexEntry = z.infer<typeof questIndexEntrySchema>;

interface QuestSelectionFilter {
  category: string;

  journalGenreNames: readonly string[];
  journalCategoryNames: readonly string[];
  classJobIds: readonly string[];
}

const questIndexFileSchema = z.looseObject({
  indexVersion: z.number().int().min(4),

  source: z.looseObject({
    version: z.string().min(1),
    schema: z.string().min(1),
  }),

  quests: z.array(questIndexEntrySchema),
});

const resolvedReviewSchema = z.looseObject({
  identity: z.looseObject({
    rowId: positiveRowIdSchema,
    name: z.string().min(1),
  }),

  questDraft: z.record(z.string(), z.unknown()),
});

type ResolvedReview = z.infer<typeof resolvedReviewSchema>;

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

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

function normalizeDutyReference(
  rawReference: unknown,
): InterpretedQuestDutyReference | undefined {
  const reference = asObject(rawReference);

  if (!reference) {
    return undefined;
  }

  const instanceContentRowId =
    readInteger(reference.instanceContentRowId) ??
    /*
     * Compatibility with reviews created before
     * QuestParams references were correctly identified
     * as InstanceContent row IDs.
     */
    readInteger(reference.contentFinderConditionRowId);

  const sourceInstruction = readString(reference.sourceInstruction);

  const relationship = readString(reference.relationship);

  if (
    instanceContentRowId === undefined ||
    instanceContentRowId <= 0 ||
    !sourceInstruction ||
    (relationship !== 'required' && relationship !== 'unlocked')
  ) {
    return undefined;
  }

  return {
    instanceContentRowId,
    sourceInstruction,
    relationship,
  };
}

function extractDutyReferences(
  review: JsonObject,
  draft: JsonObject,
): InterpretedQuestDutyReference[] {
  const unresolvedReferences = asObject(review.unresolvedReferences);

  const draftSourceData = asObject(draft.sourceData);

  const draftXivapiSource = asObject(draftSourceData?.xivapi);

  const rawReferences = [
    ...asArray(review.dutyReferences),

    ...asArray(unresolvedReferences?.duties),

    ...asArray(draftXivapiSource?.dutyReferences),
  ];

  const referencesByRowId = new Map<number, InterpretedQuestDutyReference>();

  for (const rawReference of rawReferences) {
    const reference = normalizeDutyReference(rawReference);

    if (!reference) {
      continue;
    }

    const existingReference = referencesByRowId.get(
      reference.instanceContentRowId,
    );

    if (!existingReference || reference.relationship === 'unlocked') {
      referencesByRowId.set(reference.instanceContentRowId, reference);
    }
  }

  return Array.from(referencesByRowId.values());
}

function createExportDuty(duty: ResolvedQuestDuty): JsonObject {
  return {
    id: duty.id,

    sourceRowId: duty.contentFinderConditionRowId,

    contentRowId: duty.contentRowId,

    name: duty.name,

    type: duty.type,

    relationship: duty.relationship,

    level: duty.level,

    minimumItemLevel: duty.minimumItemLevel,

    partySize: duty.partySize,

    levelSync: duty.levelSync,

    highEnd: duty.highEnd,
  };
}

function chunkValues<T>(values: readonly T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += chunkSize) {
    chunks.push(values.slice(index, index + chunkSize));
  }

  return chunks;
}

function readQuestExperienceInputs(review: ResolvedReview): {
  level: number;
  experienceFactor: number;
} | null {
  const draft = asObject(review.questDraft);

  const rewards = asObject(draft?.rewards);

  const level = readInteger(draft?.level);

  const experienceFactor = readInteger(rewards?.experienceFactor);

  if (
    level === undefined ||
    level < 1 ||
    experienceFactor === undefined ||
    experienceFactor < 0
  ) {
    return null;
  }

  return {
    level,
    experienceFactor,
  };
}

function calculateQuestExperience(
  experienceFactor: number,
  paramGrow: ParamGrowExperienceData,
): number {
  return Math.floor(
    (experienceFactor * paramGrow.scaledQuestXp * paramGrow.questExpModifier) /
      100,
  );
}

async function fetchParamGrowExperienceData(
  levels: readonly number[],
  offline: boolean,
): Promise<Map<number, ParamGrowExperienceData>> {
  if (offline && levels.length > 0) {
    throw new Error(
      [
        'ParamGrow EXP data is not available in offline mode.',
        '',
        'Run this export once without "--offline" to calculate quest EXP.',
      ].join('\n'),
    );
  }
  const uniqueLevels = Array.from(new Set(levels)).sort(
    (left, right) => left - right,
  );

  const pins = await readXivapiPins();

  const result = new Map<number, ParamGrowExperienceData>();

  for (const chunk of chunkValues(uniqueLevels, 20)) {
    const response = await requestXivapi({
      path: '/sheet/ParamGrow',

      query: {
        rows: chunk.join(','),

        fields: 'ScaledQuestXP,QuestExpModifier',

        version: pins.version,
        schema: pins.schema,
      },

      responseSchema: xivapiSheetResponseSchema,
    });

    for (const row of response.rows) {
      const scaledQuestXp = readInteger(row.fields.ScaledQuestXP);

      const questExpModifier = readInteger(row.fields.QuestExpModifier);

      if (scaledQuestXp === undefined || questExpModifier === undefined) {
        throw new Error(
          [
            `ParamGrow row ${row.row_id} is missing EXP data.`,
            `ScaledQuestXP: ${String(scaledQuestXp)}`,
            `QuestExpModifier: ${String(questExpModifier)}`,
          ].join('\n'),
        );
      }

      result.set(row.row_id, {
        scaledQuestXp,
        questExpModifier,
      });
    }

    await delayBetweenRequests();
  }

  for (const level of uniqueLevels) {
    if (!result.has(level)) {
      throw new Error(`XIVAPI returned no ParamGrow row for level ${level}.`);
    }
  }

  return result;
}

function unwrapRelation(value: unknown): JsonObject | undefined {
  const object = asObject(value);

  if (!object) {
    return undefined;
  }

  return asObject(object.fields) ?? object;
}

function readOption(optionName: string): string | undefined {
  const optionIndex = process.argv.indexOf(optionName);

  if (optionIndex < 0) {
    return undefined;
  }

  const optionValue = process.argv[optionIndex + 1];

  if (optionValue === undefined || optionValue.startsWith('--')) {
    throw new Error(`Option "${optionName}" requires a value.`);
  }

  return optionValue;
}

function readOptions(optionName: string): string[] {
  const values: string[] = [];

  for (let index = 0; index < process.argv.length; index += 1) {
    if (process.argv[index] !== optionName) {
      continue;
    }

    const value = process.argv[index + 1];

    if (value === undefined || value.startsWith('--')) {
      throw new Error(`Option "${optionName}" requires a value.`);
    }

    values.push(value);
  }

  return values;
}

function requireOption(optionName: string): string {
  const value = readOption(optionName);

  if (!value) {
    throw new Error(`Missing required option: ${optionName}`);
  }

  return value;
}

function readPositiveIntegerOption(optionName: string): number | undefined {
  const value = readOption(optionName);

  if (value === undefined) {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(
      `Option "${optionName}" requires a positive integer, received "${value}".`,
    );
  }

  return parsedValue;
}

function readRowIdsOption(optionName: string): number[] {
  const value = readOption(optionName);

  if (value === undefined) {
    return [];
  }

  const rowIds = value.split(',').map((rawRowId) => {
    const rowId = Number(rawRowId.trim());

    if (!Number.isInteger(rowId) || rowId <= 0) {
      throw new Error(
        `Option "${optionName}" contains invalid row ID "${rawRowId}".`,
      );
    }

    return rowId;
  });

  return Array.from(new Set(rowIds));
}

function hasFlag(flagName: string): boolean {
  return process.argv.includes(flagName);
}

function normalizeQuestName(value: string): string {
  return value.trim().toLocaleLowerCase('en-US');
}

function slugify(value: string): string {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en-US')
    .replace(/['’]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'unknown';
}

function humanizeId(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((segment) =>
      segment.length > 0
        ? segment[0]?.toUpperCase() + segment.slice(1)
        : segment,
    )
    .join(' ');
}

function toProjectRelativePath(filePath: string): string {
  return path.relative(projectRoot, filePath).split(path.sep).join('/');
}

async function readJsonFile(filePath: string): Promise<unknown> {
  const fileText = await readFile(filePath, 'utf8');

  return JSON.parse(fileText) as unknown;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);

    return true;
  } catch {
    return false;
  }
}

async function runNpmScript(
  scriptName: string,
  argumentsList: readonly string[] = [],
): Promise<void> {
  const npmEntryPoint = process.env.npm_execpath;

  if (!npmEntryPoint) {
    throw new Error(
      [
        'The npm entry point could not be determined.',
        '',
        'Launch this command through npm:',
        'npm run xivapi:export:chain -- ...',
      ].join('\n'),
    );
  }

  const commandArguments = [npmEntryPoint, 'run', scriptName];

  if (argumentsList.length > 0) {
    commandArguments.push('--', ...argumentsList);
  }

  await new Promise<void>((resolve, reject) => {
    const childProcess = spawn(process.execPath, commandArguments, {
      cwd: projectRoot,
      stdio: 'inherit',
      env: process.env,
    });

    childProcess.once('error', (error) => {
      reject(
        new Error(
          [`Failed to launch npm script "${scriptName}".`, error.message].join(
            '\n',
          ),
          {
            cause: error,
          },
        ),
      );
    });

    childProcess.once('exit', (exitCode, signal) => {
      if (exitCode === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          [
            `npm script "${scriptName}" failed.`,
            `Exit code: ${String(exitCode)}`,
            `Signal: ${signal ?? 'none'}`,
          ].join('\n'),
        ),
      );
    });
  });
}

function getInspectionPaths(rowId: number) {
  const inspectionDirectory = path.join(xivapiCacheRoot, 'inspection');

  return {
    focused: path.join(inspectionDirectory, `quest-${rowId}.focused.json`),

    review: path.join(inspectionDirectory, `quest-${rowId}.review.json`),

    resolved: path.join(inspectionDirectory, `quest-${rowId}.resolved.json`),
  };
}

async function ensureResolvedReview(
  rowId: number,
  options: {
    offline: boolean;
    refresh: boolean;
  },
): Promise<string> {
  const inspectionPaths = getInspectionPaths(rowId);

  if (!options.refresh && (await fileExists(inspectionPaths.resolved))) {
    return inspectionPaths.resolved;
  }

  if (options.offline) {
    throw new Error(
      [
        `Quest row ${rowId} has no reusable resolved review.`,
        '',
        'Run the exporter without "--offline" first.',
      ].join('\n'),
    );
  }

  if (options.refresh || !(await fileExists(inspectionPaths.focused))) {
    await runNpmScript('xivapi:inspect:quest', ['--row', String(rowId)]);
  }

  if (options.refresh || !(await fileExists(inspectionPaths.review))) {
    await runNpmScript('xivapi:interpret:quest', [
      '--input',
      toProjectRelativePath(inspectionPaths.focused),
    ]);
  }

  if (options.refresh || !(await fileExists(inspectionPaths.resolved))) {
    await runNpmScript('xivapi:resolve:quest', [
      '--input',
      toProjectRelativePath(inspectionPaths.review),
    ]);
  }

  return inspectionPaths.resolved;
}

async function readResolvedReview(filePath: string): Promise<ResolvedReview> {
  return resolvedReviewSchema.parse(await readJsonFile(filePath));
}

function isEligibleQuest(quest: QuestIndexEntry, category: string): boolean {
  if (category === 'msq') {
    return quest.isMainScenario;
  }

  return true;
}

function matchesQuestSelection(
  quest: QuestIndexEntry,
  selection: QuestSelectionFilter,
): boolean {
  if (!isEligibleQuest(quest, selection.category)) {
    return false;
  }

  if (
    selection.journalGenreNames.length > 0 &&
    !selection.journalGenreNames.some(
      (journalGenreName) =>
        normalizeQuestName(quest.journalGenreName ?? '') ===
        normalizeQuestName(journalGenreName),
    )
  ) {
    return false;
  }

  if (
    selection.journalCategoryNames.length > 0 &&
    !selection.journalCategoryNames.some(
      (journalCategoryName) =>
        normalizeQuestName(quest.journalCategoryName ?? '') ===
        normalizeQuestName(journalCategoryName),
    )
  ) {
    return false;
  }

  if (selection.classJobIds.length > 0) {
    const questClassJobIds = [quest.classJobName, quest.classJobAbbreviation]
      .filter((value): value is string => value !== undefined)
      .map(slugify);

    const matchesClassJob = selection.classJobIds.some((classJobId) =>
      questClassJobIds.includes(classJobId),
    );

    if (!matchesClassJob) {
      return false;
    }
  }

  return true;
}

function createNextSignature(
  quest: QuestIndexEntry,
  questsByRowId: ReadonlyMap<number, QuestIndexEntry>,
  selection: QuestSelectionFilter,
): string {
  return quest.nextQuestRowIds
    .filter((rowId) => {
      const nextQuest = questsByRowId.get(rowId);

      return (
        nextQuest !== undefined && matchesQuestSelection(nextQuest, selection)
      );
    })
    .sort((left, right) => left - right)
    .join(',');
}

function collapseEquivalentStarts(
  candidates: readonly QuestIndexEntry[],
  questsByRowId: ReadonlyMap<number, QuestIndexEntry>,
  selection: QuestSelectionFilter,
): QuestIndexEntry[] {
  const candidatesBySignature = new Map<string, QuestIndexEntry[]>();

  for (const candidate of candidates) {
    const signature = createNextSignature(candidate, questsByRowId, selection);

    const existingCandidates = candidatesBySignature.get(signature);

    if (existingCandidates) {
      existingCandidates.push(candidate);
    } else {
      candidatesBySignature.set(signature, [candidate]);
    }
  }

  const representatives: QuestIndexEntry[] = [];

  for (const candidatesWithSameTail of candidatesBySignature.values()) {
    candidatesWithSameTail.sort((left, right) => left.rowId - right.rowId);

    const representative = candidatesWithSameTail[0];

    if (!representative) {
      continue;
    }

    representatives.push(representative);

    if (candidatesWithSameTail.length > 1) {
      console.warn('');
      console.warn(
        [
          'Collapsed equivalent internal starting variants.',
          `Quest: ${representative.name}`,
          `Rows: ${candidatesWithSameTail
            .map((candidate) => candidate.rowId)
            .join(', ')}`,
          `Representative: ${representative.rowId}`,
        ].join('\n'),
      );
      console.warn('');
    }
  }

  representatives.sort((left, right) => left.rowId - right.rowId);

  return representatives;
}

function collectForwardReachable(
  startRowIds: readonly number[],
  questsByRowId: ReadonlyMap<number, QuestIndexEntry>,
  selection: QuestSelectionFilter,
  stopRowId?: number,
): Set<number> {
  const reachableRowIds = new Set<number>();

  const pendingRowIds = [...startRowIds];

  while (pendingRowIds.length > 0) {
    const rowId = pendingRowIds.pop();

    if (rowId === undefined || reachableRowIds.has(rowId)) {
      continue;
    }

    const quest = questsByRowId.get(rowId);

    if (!quest || !matchesQuestSelection(quest, selection)) {
      continue;
    }

    reachableRowIds.add(rowId);

    if (stopRowId !== undefined && rowId === stopRowId) {
      continue;
    }

    for (const nextRowId of quest.nextQuestRowIds) {
      pendingRowIds.push(nextRowId);
    }
  }

  return reachableRowIds;
}

function collectBackwardReachable(
  finalRowId: number,
  forwardReachable: ReadonlySet<number>,
  questsByRowId: ReadonlyMap<number, QuestIndexEntry>,
  selection: QuestSelectionFilter,
): Set<number> {
  const reachableRowIds = new Set<number>();

  const pendingRowIds = [finalRowId];

  while (pendingRowIds.length > 0) {
    const rowId = pendingRowIds.pop();

    if (
      rowId === undefined ||
      reachableRowIds.has(rowId) ||
      !forwardReachable.has(rowId)
    ) {
      continue;
    }

    const quest = questsByRowId.get(rowId);

    if (!quest || !matchesQuestSelection(quest, selection)) {
      continue;
    }

    reachableRowIds.add(rowId);

    for (const previousRowId of quest.previousQuestRowIds) {
      pendingRowIds.push(previousRowId);
    }
  }

  return reachableRowIds;
}

function topologicallySortQuests(
  discoveredRowIds: ReadonlySet<number>,
  questsByRowId: ReadonlyMap<number, QuestIndexEntry>,
): QuestIndexEntry[] {
  const inDegreeByRowId = new Map<number, number>();

  for (const rowId of discoveredRowIds) {
    const quest = questsByRowId.get(rowId);

    if (!quest) {
      continue;
    }

    const internalPreviousCount = quest.previousQuestRowIds.filter(
      (previousRowId) => discoveredRowIds.has(previousRowId),
    ).length;

    inDegreeByRowId.set(rowId, internalPreviousCount);
  }

  const availableRowIds = Array.from(inDegreeByRowId.entries())
    .filter(([, inDegree]) => inDegree === 0)
    .map(([rowId]) => rowId)
    .sort((left, right) => left - right);

  const orderedQuests: QuestIndexEntry[] = [];

  while (availableRowIds.length > 0) {
    const rowId = availableRowIds.shift();

    if (rowId === undefined) {
      continue;
    }

    const quest = questsByRowId.get(rowId);

    if (!quest) {
      continue;
    }

    orderedQuests.push(quest);

    for (const nextRowId of quest.nextQuestRowIds) {
      if (!discoveredRowIds.has(nextRowId)) {
        continue;
      }

      const currentInDegree = inDegreeByRowId.get(nextRowId);

      if (currentInDegree === undefined) {
        continue;
      }

      const nextInDegree = currentInDegree - 1;

      inDegreeByRowId.set(nextRowId, nextInDegree);

      if (nextInDegree === 0) {
        availableRowIds.push(nextRowId);

        availableRowIds.sort((left, right) => left - right);
      }
    }
  }

  if (orderedQuests.length !== discoveredRowIds.size) {
    throw new Error(
      [
        'The quest graph could not be sorted.',
        `Discovered: ${discoveredRowIds.size}`,
        `Sorted: ${orderedQuests.length}`,
      ].join('\n'),
    );
  }

  return orderedQuests;
}

async function readKnownQuestIds(
  exportsDirectory: string,
): Promise<Map<number, string>> {
  const questIdsByRowId = new Map<number, string>();

  let directoryEntries;

  try {
    directoryEntries = await readdir(exportsDirectory, {
      withFileTypes: true,
    });
  } catch (error) {
    const errorCode = asObject(error)?.code;

    if (errorCode === 'ENOENT') {
      return questIdsByRowId;
    }

    throw error;
  }

  for (const directoryEntry of directoryEntries) {
    if (!directoryEntry.isFile() || !directoryEntry.name.endsWith('.json')) {
      continue;
    }

    const exportPath = path.join(exportsDirectory, directoryEntry.name);
    const rawExport = asObject(await readJsonFile(exportPath));

    for (const rawQuest of asArray(rawExport?.quests)) {
      const quest = asObject(rawQuest);

      const rowId = readInteger(quest?.xivapiRowId);
      const questId = readString(quest?.id);

      if (rowId === undefined || rowId <= 0 || !questId) {
        continue;
      }

      const existingQuestId = questIdsByRowId.get(rowId);

      if (existingQuestId && existingQuestId !== questId) {
        throw new Error(
          [
            `XIVAPI quest row ${rowId} has conflicting export IDs.`,
            `Existing: ${existingQuestId}`,
            `Found: ${questId}`,
            `File: ${exportPath}`,
          ].join('\n'),
        );
      }

      questIdsByRowId.set(rowId, questId);
    }
  }

  return questIdsByRowId;
}

function createQuestBaseId(
  quest: QuestIndexEntry,
  expansionId: string,
  category: string,
): string {
  return [slugify(expansionId), slugify(category), slugify(quest.name)].join(
    '-',
  );
}

function createQuestIds(
  quests: readonly QuestIndexEntry[],
  expansionId: string,
  category: string,
  knownQuestIdsByRowId: ReadonlyMap<number, string>,
): Map<number, string> {
  const questIdsByRowId = new Map<number, string>();
  const rowIdsByQuestId = new Map<string, number>();

  for (const quest of quests) {
    const baseId = createQuestBaseId(quest, expansionId, category);

    const questId =
      knownQuestIdsByRowId.get(quest.rowId) ?? `${baseId}-${quest.rowId}`;

    const existingRowId = rowIdsByQuestId.get(questId);

    if (existingRowId !== undefined && existingRowId !== quest.rowId) {
      throw new Error(
        [
          `Quest ID "${questId}" resolves to multiple XIVAPI rows.`,
          `Rows: ${existingRowId}, ${quest.rowId}`,
        ].join('\n'),
      );
    }

    questIdsByRowId.set(quest.rowId, questId);
    rowIdsByQuestId.set(questId, quest.rowId);
  }

  return questIdsByRowId;
}

function resolveRelatedQuestId(
  rowId: number,
  questIdsByRowId: ReadonlyMap<number, string>,
  knownQuestIdsByRowId: ReadonlyMap<number, string>,
  questsByRowId: ReadonlyMap<number, QuestIndexEntry>,
  expansionId: string,
  category: string,
): string | undefined {
  const exportedQuestId = questIdsByRowId.get(rowId);

  if (exportedQuestId) {
    return exportedQuestId;
  }

  const knownQuestId = knownQuestIdsByRowId.get(rowId);

  if (knownQuestId) {
    return knownQuestId;
  }

  const relatedQuest = questsByRowId.get(rowId);

  if (!relatedQuest || !isEligibleQuest(relatedQuest, category)) {
    return undefined;
  }

  return `${createQuestBaseId(relatedQuest, expansionId, category)}-${rowId}`;
}

function pushIssue(
  issues: ExportIssue[],
  issueKeys: Set<string>,
  issue: ExportIssue,
): void {
  const issueKey = [issue.questId, issue.field, issue.message].join('|');

  if (issueKeys.has(issueKey)) {
    return;
  }

  issueKeys.add(issueKey);
  issues.push(issue);
}

function normalizeIdArray(value: unknown): string[] {
  return Array.from(
    new Set(
      asArray(value)
        .map(readString)
        .filter((entry): entry is string => entry !== undefined)
        .map(slugify),
    ),
  );
}

function inferInitialGrandCompanyIds(questName: string): string[] {
  switch (normalizeQuestName(questName)) {
    case 'the company you keep (twin adder)':
    case "wood's will be done":
      return ['twin-adder'];

    case 'the company you keep (maelstrom)':
    case 'till sea swallows all':
      return ['maelstrom'];

    case 'the company you keep (immortal flames)':
    case 'for coin and country':
      return ['immortal-flames'];

    default:
      return [];
  }
}

function extractAvailability(
  review: JsonObject,
  draft: JsonObject,
  questName: string,
): JsonObject | null {
  const availability =
    asObject(draft.availability) ?? asObject(review.availability);

  const result: JsonObject = {};

  const startingCityIds = normalizeIdArray(availability?.startingCityIds);

  /*
   * grandCompanyIds is accepted here
   * as a legacy importer field and
   * normalized into the new initial
   * Grand Company field.
   */
  const importedInitialGrandCompanyIds = normalizeIdArray(
    availability?.initialGrandCompanyIds ?? availability?.grandCompanyIds,
  );

  const inferredInitialGrandCompanyIds = inferInitialGrandCompanyIds(questName);

  const initialGrandCompanyIds = Array.from(
    new Set([
      ...importedInitialGrandCompanyIds,
      ...inferredInitialGrandCompanyIds,
    ]),
  );

  const currentGrandCompanyIds = normalizeIdArray(
    availability?.currentGrandCompanyIds,
  );

  const classJobIds = normalizeIdArray(availability?.classJobIds);

  if (startingCityIds.length > 0) {
    result.startingCityIds = startingCityIds;
  }

  if (initialGrandCompanyIds.length > 0) {
    result.initialGrandCompanyIds = initialGrandCompanyIds;
  }

  if (currentGrandCompanyIds.length > 0) {
    result.currentGrandCompanyIds = currentGrandCompanyIds;
  }

  if (classJobIds.length > 0) {
    result.classJobIds = classJobIds;
  }

  return Object.keys(result).length > 0 ? result : null;
}

function extractActor(
  endpointCandidates: readonly unknown[],
): JsonObject | null {
  for (const rawEndpoint of endpointCandidates) {
    const endpoint = unwrapRelation(rawEndpoint);

    if (!endpoint) {
      continue;
    }

    const actorCandidates = [
      endpoint.actor,
      endpoint.npc,
      endpoint.issuer,
      endpoint.target,
      endpoint,
    ];

    for (const rawActor of actorCandidates) {
      const actor = unwrapRelation(rawActor);

      if (!actor) {
        continue;
      }

      const name =
        readString(actor.name) ??
        readString(actor.Name) ??
        readString(actor.actorName) ??
        readString(actor.singular) ??
        readString(actor.Singular);

      const title = readString(actor.title) ?? readString(actor.Title);

      const xivapiRowId =
        readInteger(actor.xivapiRowId) ??
        readInteger(actor.rowId) ??
        readInteger(actor.actorRowId) ??
        readInteger(actor.sourceRowId);

      if (
        name === undefined &&
        title === undefined &&
        xivapiRowId === undefined
      ) {
        continue;
      }

      const result: JsonObject = {
        name: name ?? null,
      };

      if (title !== undefined) {
        result.title = title;
      }

      if (xivapiRowId !== undefined && xivapiRowId > 0) {
        result.xivapiRowId = xivapiRowId;
      }

      return result;
    }
  }

  return null;
}

function extractLocation(
  endpointCandidates: readonly unknown[],
): JsonObject | null {
  for (const rawEndpoint of endpointCandidates) {
    const endpoint = unwrapRelation(rawEndpoint);

    if (!endpoint) {
      continue;
    }

    const locationCandidates = [
      endpoint.location,
      endpoint.startLocation,
      endpoint,
    ];

    for (const rawLocation of locationCandidates) {
      const location = unwrapRelation(rawLocation);

      if (!location) {
        continue;
      }

      const coordinates = asObject(location.coordinates);

      const zone =
        readString(location.zone) ??
        readString(location.zoneName) ??
        readString(location.territoryName) ??
        readString(location.mapName);

      const area =
        readString(location.area) ??
        readString(location.areaName) ??
        readString(location.placeName);

      const x = readNumber(location.x) ?? readNumber(coordinates?.x);

      const y = readNumber(location.y) ?? readNumber(coordinates?.y);

      if (
        zone === undefined &&
        area === undefined &&
        x === undefined &&
        y === undefined
      ) {
        continue;
      }

      const result: JsonObject = {
        zone: zone ?? null,
        x: x ?? null,
        y: y ?? null,
      };

      if (area !== undefined) {
        result.area = area;
      }

      return result;
    }
  }

  return null;
}

function extractStart(review: JsonObject, draft: JsonObject): JsonObject {
  const endpointCandidates = [review.start, draft.start];

  return {
    npc: extractActor(endpointCandidates),

    location: extractLocation(endpointCandidates),
  };
}

function normalizeRequirement(rawRequirement: unknown): JsonObject | undefined {
  const requirement = asObject(rawRequirement);

  if (!requirement) {
    return undefined;
  }

  const type = readString(requirement.type);

  if (type === 'level') {
    const level = readInteger(requirement.level);

    return level !== undefined && level > 0
      ? {
          type: 'level',
          level,
        }
      : undefined;
  }

  if (type === 'class-job') {
    const classJobName =
      readString(requirement.classJobName) ?? readString(requirement.name);

    const classJobId =
      readString(requirement.classJobId) ??
      (classJobName ? slugify(classJobName) : undefined);

    if (!classJobId || !classJobName) {
      return undefined;
    }

    const result: JsonObject = {
      type: 'class-job',
      classJobId: slugify(classJobId),
      classJobName,
    };

    const level = readInteger(requirement.level);

    if (level !== undefined && level > 0) {
      result.level = level;
    }

    return result;
  }

  if (type === 'item') {
    const itemName =
      readString(requirement.itemName) ?? readString(requirement.name);

    const itemRowId = readInteger(requirement.itemRowId);

    const rawItemId = readString(requirement.itemId);

    const itemId = rawItemId
      ? slugify(rawItemId)
      : itemRowId !== undefined
        ? `item-${itemRowId}`
        : itemName
          ? slugify(itemName)
          : undefined;

    if (!itemId || !itemName) {
      return undefined;
    }

    const result: JsonObject = {
      type: 'item',
      itemId,
      itemName,

      quantity: readInteger(requirement.quantity) ?? null,
    };

    const quality = readString(requirement.quality);

    if (quality === 'normal' || quality === 'high-quality') {
      result.quality = quality;
    }

    return result;
  }

  if (type === 'feature') {
    const name = readString(requirement.name);

    if (!name) {
      return undefined;
    }

    return {
      type: 'feature',

      id: slugify(readString(requirement.id) ?? name),

      name,
    };
  }

  return undefined;
}

function normalizeQuestItem(rawQuestItem: unknown): JsonObject | undefined {
  const questItem = asObject(rawQuestItem);

  if (!questItem) {
    return undefined;
  }

  const itemName = readString(questItem.itemName) ?? readString(questItem.name);

  const sourceRowId =
    readInteger(questItem.sourceRowId) ?? readInteger(questItem.itemRowId);

  const rawSourceSheet =
    readString(questItem.sourceSheet) ?? readString(questItem.itemSheet);

  const sourceSheet =
    rawSourceSheet === 'EventItem' || rawSourceSheet === 'event-item'
      ? 'event-item'
      : rawSourceSheet === 'Item' || rawSourceSheet === 'item'
        ? 'item'
        : undefined;

  const rawItemId = readString(questItem.itemId);

  const itemId = rawItemId
    ? slugify(rawItemId)
    : sourceRowId !== undefined
      ? sourceSheet === 'event-item'
        ? `event-item-${sourceRowId}`
        : `item-${sourceRowId}`
      : itemName
        ? slugify(itemName)
        : undefined;

  if (!itemId || !itemName) {
    return undefined;
  }

  const result: JsonObject = {
    itemId,
    itemName,
  };

  if (sourceRowId !== undefined && sourceRowId > 0) {
    result.sourceRowId = sourceRowId;
  }

  if (sourceSheet) {
    result.sourceSheet = sourceSheet;
  }

  const quantity = readInteger(questItem.quantity);

  if (quantity !== undefined && quantity > 0) {
    result.quantity = quantity;
  }

  const quality = readString(questItem.quality);

  if (
    quality === 'normal' ||
    quality === 'high-quality' ||
    quality === 'either'
  ) {
    result.quality = quality;
  }

  const usage = readString(questItem.usage);

  result.usage =
    usage === 'required-before-starting' ||
    usage === 'obtained-during-quest' ||
    usage === 'used-during-quest' ||
    usage === 'turn-in' ||
    usage === 'equip' ||
    usage === 'craft' ||
    usage === 'gather' ||
    usage === 'unknown'
      ? usage
      : 'used-during-quest';

  const sourceInstruction = readString(questItem.sourceInstruction);

  if (sourceInstruction) {
    result.sourceInstruction = sourceInstruction;
  }

  const notes = readString(questItem.notes);

  if (notes) {
    result.notes = notes;
  }

  return result;
}

function extractQuestItems(
  review: JsonObject,
  draft: JsonObject,
  questId: string,
  questName: string,
  issues: ExportIssue[],
  issueKeys: Set<string>,
): JsonObject[] {
  const reviewQuestItems = asObject(review.questItems);
  const reviewRequirements = asObject(review.requirements);
  const unresolvedReferences = asObject(review.unresolvedReferences);

  const draftQuestItems = asArray(draft.questItems);
  const resolvedQuestItemReferences = asArray(reviewQuestItems?.references);
  const legacyQuestItemReferences = [
    ...asArray(reviewRequirements?.itemReferences),
    ...asArray(reviewRequirements?.requiredItems),
  ];

  /*
   * Use one representation only. Combining all three would count
   * the same item more than once because the resolved draft and
   * review both describe the same XIVAPI reference.
   */
  const rawQuestItems =
    draftQuestItems.length > 0
      ? draftQuestItems
      : resolvedQuestItemReferences.length > 0
        ? resolvedQuestItemReferences
        : legacyQuestItemReferences;

  const currentUnresolvedReferences = asArray(
    reviewQuestItems?.unresolvedReferences,
  );
  const legacyUnresolvedReferences = [
    ...asArray(reviewRequirements?.unresolvedItems),
    ...asArray(unresolvedReferences?.items),
  ];

  const rawUnresolvedReferences =
    currentUnresolvedReferences.length > 0
      ? currentUnresolvedReferences
      : legacyUnresolvedReferences;

  for (const rawReference of rawUnresolvedReferences) {
    const reference = asObject(rawReference);

    const itemSheet =
      readString(reference?.itemSheet) ??
      readString(reference?.sourceSheet) ??
      'unknown sheet';

    const itemRowId =
      readInteger(reference?.itemRowId) ?? readInteger(reference?.sourceRowId);

    const sourceInstruction =
      readString(reference?.sourceInstruction) ?? 'unknown instruction';

    pushIssue(issues, issueKeys, {
      questId,
      questName,

      field: 'questItems.itemName',

      message: [
        `Could not resolve ${itemSheet}`,
        `row ${itemRowId ?? 'unknown'}`,
        `from ${sourceInstruction}.`,
      ].join(' '),
    });
  }

  const consolidatedQuestItems = new Map<string, JsonObject>();

  for (const rawQuestItem of rawQuestItems) {
    const questItem = normalizeQuestItem(rawQuestItem);

    if (!questItem) {
      pushIssue(issues, issueKeys, {
        questId,
        questName,

        field: 'questItems.itemName',

        message: 'A quest item could not be resolved to an item ID and name.',
      });

      continue;
    }

    const itemId = readString(questItem.itemId);
    const itemName = readString(questItem.itemName);

    if (!itemId || !itemName) {
      continue;
    }

    const sourceSheet = readString(questItem.sourceSheet) ?? 'unknown';

    const sourceRowId = readInteger(questItem.sourceRowId);

    const consolidationKey = [
      sourceSheet,
      sourceRowId !== undefined ? String(sourceRowId) : itemId,
      normalizeQuestName(itemName),
    ].join('|');

    const existingQuestItem = consolidatedQuestItems.get(consolidationKey);

    if (!existingQuestItem) {
      consolidatedQuestItems.set(consolidationKey, questItem);

      continue;
    }

    const existingQuantity = readInteger(existingQuestItem.quantity);
    const incomingQuantity = readInteger(questItem.quantity);

    if (existingQuantity !== undefined && incomingQuantity !== undefined) {
      existingQuestItem.quantity = existingQuantity + incomingQuantity;
    } else {
      delete existingQuestItem.quantity;
    }
  }

  const questItems = Array.from(consolidatedQuestItems.values());

  for (const questItem of questItems) {
    if (readInteger(questItem.quantity) !== undefined) {
      continue;
    }

    const itemName = readString(questItem.itemName) ?? 'unknown item';

    pushIssue(issues, issueKeys, {
      questId,
      questName,

      field: 'questItems.quantity',

      message: `Confirm the quest item quantity for ${itemName}.`,
    });
  }

  return questItems;
}

function extractRequirements(
  review: JsonObject,
  draft: JsonObject,
  level: number | null,
): JsonObject[] {
  const requirements: JsonObject[] = [];

  if (level !== null) {
    requirements.push({
      type: 'level',
      level,
    });
  }

  /*
   * Explicit draft requirements remain valid. This preserves
   * support for genuine item, crafting, gathering, and feature
   * prerequisites entered by a future resolver or curator.
   */
  for (const rawRequirement of asArray(draft.requirements)) {
    const requirement = normalizeRequirement(rawRequirement);

    if (requirement) {
      requirements.push(requirement);
    }
  }

  const reviewRequirements = asObject(review.requirements);

  const classJob = asObject(reviewRequirements?.classJob);

  if (classJob) {
    const classJobName =
      readString(classJob.classJobName) ?? readString(classJob.name);

    const classJobId =
      readString(classJob.classJobId) ??
      (classJobName ? slugify(classJobName) : undefined);

    if (classJobId && classJobName) {
      const requirement: JsonObject = {
        type: 'class-job',
        classJobId: slugify(classJobId),
        classJobName,
      };

      const requiredLevel = readInteger(classJob.level);

      if (requiredLevel !== undefined && requiredLevel > 0) {
        requirement.level = requiredLevel;
      }

      requirements.push(requirement);
    }
  }

  const uniqueRequirements = new Map<string, JsonObject>();

  for (const requirement of requirements) {
    const requirementKey = JSON.stringify(requirement);

    uniqueRequirements.set(requirementKey, requirement);
  }

  return Array.from(uniqueRequirements.values());
}

function normalizeUnlock(
  rawUnlock: unknown,
  defaultType = 'feature',
): JsonObject | undefined {
  if (typeof rawUnlock === 'string') {
    const name = readString(rawUnlock);

    return name
      ? {
          type: defaultType,
          id: slugify(name),
          name,
        }
      : undefined;
  }

  const unlock = asObject(rawUnlock);

  if (!unlock) {
    return undefined;
  }

  const name =
    readString(unlock.name) ??
    readString(unlock.title) ??
    readString(unlock.dutyName);

  if (!name) {
    return undefined;
  }

  const type =
    readString(unlock.type) ??
    readString(unlock.unlockType) ??
    readString(unlock.kind) ??
    defaultType;

  const result: JsonObject = {
    type,

    id: slugify(
      readString(unlock.id) ??
        readString(unlock.targetId) ??
        readString(unlock.unlockId) ??
        readString(unlock.dutyId) ??
        name,
    ),

    name,
  };

  const sourceRowId =
    readInteger(unlock.sourceRowId) ?? readInteger(unlock.rowId);

  if (sourceRowId !== undefined && sourceRowId > 0) {
    result.sourceRowId = sourceRowId;
  }

  const details =
    readString(unlock.details) ??
    readString(unlock.description) ??
    readString(unlock.notes);

  if (details !== undefined) {
    result.details = details;
  }

  return result;
}

function extractUnlocks(
  review: JsonObject,
  draft: JsonObject,
  resolvedDuties: readonly ResolvedQuestDuty[],
): JsonObject[] {
  const rawUnlocks = [...asArray(draft.unlocks), ...asArray(review.unlocks)];

  const rawDuties = [...asArray(draft.duties), ...asArray(review.duties)];

  const unlocks: JsonObject[] = [];

  for (const rawUnlock of rawUnlocks) {
    const unlock = normalizeUnlock(rawUnlock);

    if (unlock) {
      unlocks.push(unlock);
    }
  }

  for (const rawDuty of rawDuties) {
    const unlock = normalizeUnlock(rawDuty, 'duty');

    if (unlock) {
      unlocks.push(unlock);
    }
  }

  for (const duty of resolvedDuties) {
    if (duty.relationship !== 'unlocked') {
      continue;
    }

    unlocks.push({
      type: duty.type,

      id: duty.id,

      sourceRowId: duty.contentFinderConditionRowId,

      name: duty.name,
    });
  }

  const unlocksByKey = new Map<string, JsonObject>();

  for (const unlock of unlocks) {
    const key = [readString(unlock.type), readString(unlock.id)].join('|');

    unlocksByKey.set(key, unlock);
  }

  return Array.from(unlocksByKey.values());
}

function normalizeRewardItem(
  rawItem: unknown,
  questId: string,
  questName: string,
  field: string,
  issues: ExportIssue[],
  issueKeys: Set<string>,
): JsonObject | undefined {
  const item = asObject(rawItem);

  if (!item) {
    return undefined;
  }

  const itemName = readString(item.itemName) ?? readString(item.name);

  const itemRowId = readInteger(item.itemRowId) ?? readInteger(item.rowId);

  const rawItemId = readString(item.itemId);

  const itemId = rawItemId
    ? slugify(rawItemId)
    : itemRowId !== undefined
      ? `item-${itemRowId}`
      : itemName
        ? slugify(itemName)
        : undefined;

  if (!itemId || !itemName) {
    return undefined;
  }

  const rawQuantity = readInteger(item.quantity);

  const quantity =
    rawQuantity !== undefined && rawQuantity >= 0
      ? Math.max(1, rawQuantity)
      : null;

  const result: JsonObject = {
    itemId,
    itemName,
    quantity,
  };

  const quality = readString(item.quality);

  if (quality === 'normal' || quality === 'high-quality') {
    result.quality = quality;
  }

  const stainId = readString(item.stainId);

  const stainName =
    readString(item.stainName) ??
    readString(asObject(item.extensions)?.stainName);

  if (stainId !== undefined) {
    result.stainId = slugify(stainId);
  }

  if (stainName !== undefined) {
    result.stainName = stainName;
  }

  if (quantity === null) {
    pushIssue(issues, issueKeys, {
      questId,
      questName,
      field,

      message: `Confirm the reward quantity for ${itemName}.`,
    });
  }

  return result;
}

function extractRewards(
  review: JsonObject,
  draft: JsonObject,
  calculatedExperience: number | undefined,
  questId: string,
  questName: string,
  issues: ExportIssue[],
  issueKeys: Set<string>,
): JsonObject {
  const draftRewards = asObject(draft.rewards);

  const reviewRewards = asObject(review.rewards);

  const experience =
    calculatedExperience ??
    readInteger(draftRewards?.experience) ??
    readInteger(reviewRewards?.experience) ??
    null;

  const gil =
    readInteger(draftRewards?.gil) ?? readInteger(reviewRewards?.gil) ?? null;

  if (experience === null) {
    pushIssue(issues, issueKeys, {
      questId,
      questName,
      field: 'rewards.experience',

      message: 'Confirm the actual experience reward.',
    });
  }

  if (gil === null) {
    pushIssue(issues, issueKeys, {
      questId,
      questName,
      field: 'rewards.gil',

      message: 'Confirm the gil reward.',
    });
  }

  const rawGuaranteedItems = [
    ...asArray(draftRewards?.items),

    ...asArray(reviewRewards?.guaranteedItems),
  ];

  const rawChoiceItems = [
    ...asArray(draftRewards?.optionalItems),

    ...asArray(draftRewards?.choices),

    ...asArray(reviewRewards?.choiceItems),
  ];

  const items: JsonObject[] = [];

  const choices: JsonObject[] = [];

  for (const rawItem of rawGuaranteedItems) {
    const item = normalizeRewardItem(
      rawItem,
      questId,
      questName,
      'rewards.items.quantity',
      issues,
      issueKeys,
    );

    if (item) {
      items.push(item);
    }
  }

  for (const rawItem of rawChoiceItems) {
    const item = normalizeRewardItem(
      rawItem,
      questId,
      questName,
      'rewards.choices.quantity',
      issues,
      issueKeys,
    );

    if (item) {
      choices.push(item);
    }
  }

  function deduplicateItems(values: JsonObject[]): JsonObject[] {
    const itemsByKey = new Map<string, JsonObject>();

    for (const value of values) {
      const key = [
        readString(value.itemId),
        readInteger(value.quantity),
        readString(value.stainId),
      ].join('|');

      itemsByKey.set(key, value);
    }

    return Array.from(itemsByKey.values());
  }

  return {
    experience,
    gil,

    items: deduplicateItems(items),

    choices: deduplicateItems(choices),
  };
}

function addStartIssues(
  start: JsonObject,
  questId: string,
  questName: string,
  issues: ExportIssue[],
  issueKeys: Set<string>,
): void {
  const actor = asObject(start.npc);

  const location = asObject(start.location);

  if (!actor || readString(actor.name) === undefined) {
    pushIssue(issues, issueKeys, {
      questId,
      questName,

      field: 'start.npc.name',

      message: 'Confirm the start NPC.',
    });
  }

  if (!location) {
    pushIssue(issues, issueKeys, {
      questId,
      questName,

      field: 'start.location',

      message: 'Confirm the start location.',
    });

    return;
  }

  if (readString(location.zone) === undefined) {
    pushIssue(issues, issueKeys, {
      questId,
      questName,

      field: 'start.location.zone',

      message: 'Confirm the start zone.',
    });
  }

  if (
    readNumber(location.x) === undefined ||
    readNumber(location.y) === undefined
  ) {
    pushIssue(issues, issueKeys, {
      questId,
      questName,

      field: 'start.location.coordinates',

      message: 'Confirm the start coordinates.',
    });
  }
}

function createQuestEntry(
  quest: QuestIndexEntry,
  review: ResolvedReview,
  calculatedExperience: number | undefined,
  sortOrder: number,
  questId: string,
  previousQuestIds: string[],
  nextQuestIds: string[],
  expansionId: string | undefined,
  patch: string | undefined,
  category: string,
  resolvedDuties: readonly ResolvedQuestDuty[],
  issues: ExportIssue[],
  issueKeys: Set<string>,
): QuestExportEntry {
  const reviewObject = review as JsonObject;

  const draft = asObject(review.questDraft) ?? {};

  const sourceData = asObject(draft.sourceData);

  const xivapiSourceData = asObject(sourceData?.xivapi);

  const systemRewards = readSystemRewardValues(
    xivapiSourceData?.systemRewards ?? xivapiSourceData?.systemReward,
  );

  for (const systemReward of systemRewards) {
    if (isReviewedSystemReward(quest.rowId, systemReward)) {
      continue;
    }

    pushIssue(issues, issueKeys, {
      questId,
      questName: quest.name,
      field: 'unlocks.systemReward',
      message: [
        `Quest row ${quest.rowId} has unreviewed`,
        `SystemReward value ${systemReward}.`,
      ].join(' '),
    });
  }

  const classification = asObject(reviewObject.classification);

  const level =
    readInteger(draft.level) ?? readInteger(classification?.level) ?? null;

  if (level === null) {
    pushIssue(issues, issueKeys, {
      questId,
      questName: quest.name,
      field: 'level',

      message: 'Confirm the required quest level.',
    });
  }

  const start = extractStart(reviewObject, draft);

  addStartIssues(start, questId, quest.name, issues, issueKeys);

  const incomingCount = previousQuestIds.length;

  const outgoingCount = nextQuestIds.length;

  let graphRole:
    | 'linear'
    | 'branch'
    | 'convergence'
    | 'branch-and-convergence' = 'linear';

  if (incomingCount > 1 && outgoingCount > 1) {
    graphRole = 'branch-and-convergence';
  } else if (outgoingCount > 1) {
    graphRole = 'branch';
  } else if (incomingCount > 1) {
    graphRole = 'convergence';
  }

  const duties = resolvedDuties.map(createExportDuty);

  const rawEntry: JsonObject = {
    id: questId,

    xivapiRowId: quest.rowId,

    sortOrder,

    name: quest.name,
    level,

    expansionId: expansionId ? slugify(expansionId) : undefined,

    patch,
    category: slugify(category),

    availability: extractAvailability(reviewObject, draft, quest.name),

    repeatability: draft.repeatability,

    requirements: extractRequirements(reviewObject, draft, level),

    questItems: extractQuestItems(
      reviewObject,
      draft,
      questId,
      quest.name,
      issues,
      issueKeys,
    ),

    objectives: asArray(draft.objectives),

    rawRelations: draft.rawRelations,

    sources: asArray(draft.sources),

    sourceData: draft.sourceData,

    previousQuestIds,

    previousQuestMode:
      category === 'msq' && previousQuestIds.length > 1 ? 'any' : 'all',

    nextQuestIds,

    duties,

    unlocks: extractUnlocks(reviewObject, draft, resolvedDuties),

    rewards: extractRewards(
      reviewObject,
      draft,
      calculatedExperience,
      questId,
      quest.name,
      issues,
      issueKeys,
    ),

    start,

    graphRole,
  };

  return questExportEntrySchema.parse(rawEntry);
}

async function main(): Promise<void> {
  const exportId = slugify(requireOption('--id'));

  const explicitRowIds = readRowIdsOption('--rows');

  const startQuestName = readOption('--start');
  const endQuestName = readOption('--end');

  const startQuestRowId = readPositiveIntegerOption('--start-row');
  const endQuestRowId = readPositiveIntegerOption('--end-row');

  const usesExplicitRows = explicitRowIds.length > 0;

  const usesFilterSelection = hasFlag('--filter');

  const hasChainSelection =
    startQuestName !== undefined ||
    endQuestName !== undefined ||
    startQuestRowId !== undefined ||
    endQuestRowId !== undefined;

  if (usesFilterSelection && (usesExplicitRows || hasChainSelection)) {
    throw new Error(
      '"--filter" cannot be combined with row or chain selection.',
    );
  }

  if (usesExplicitRows && hasChainSelection) {
    throw new Error('"--rows" cannot be combined with chain selection.');
  }

  if (
    !usesFilterSelection &&
    !usesExplicitRows &&
    (!startQuestName || !endQuestName)
  ) {
    throw new Error('Chain exports require both "--start" and "--end".');
  }

  const category = slugify(requireOption('--category'));

  const rawExpansionId = readOption('--expansion');
  const expansionId = rawExpansionId ? slugify(rawExpansionId) : undefined;

  const patch = readOption('--patch');

  if (category === 'msq' && (!expansionId || !patch)) {
    throw new Error('MSQ exports require both "--expansion" and "--patch".');
  }

  const questIdNamespace = expansionId ?? exportId;

  const journalGenreNames = readOptions('--journal-genre');

  const journalCategoryNames = readOptions('--journal-category');

  const classJobIds = readOptions('--class-job').map(slugify);

  const selection: QuestSelectionFilter = {
    category,
    journalGenreNames,
    journalCategoryNames,
    classJobIds,
  };

  if (
    usesFilterSelection &&
    journalGenreNames.length === 0 &&
    journalCategoryNames.length === 0 &&
    classJobIds.length === 0
  ) {
    throw new Error(
      [
        'Filter selection requires at least one scope:',
        '--journal-genre, --journal-category, or --class-job.',
      ].join(' '),
    );
  }

  const title = readOption('--title') ?? humanizeId(exportId);

  const offline = hasFlag('--offline');

  const refresh = hasFlag('--refresh');

  const replace = hasFlag('--replace');

  if (offline && refresh) {
    throw new Error(
      ['"--offline" and "--refresh"', 'cannot be used together.'].join(' '),
    );
  }

  const exportsDirectory = path.join(
    projectRoot,
    'scripts',
    'xivapi',
    'exports',
  );

  const customOutputPath = readOption('--output');

  const outputPath = customOutputPath
    ? path.isAbsolute(customOutputPath)
      ? customOutputPath
      : path.resolve(projectRoot, customOutputPath)
    : path.join(exportsDirectory, `${exportId}.json`);

  if (!replace && (await fileExists(outputPath))) {
    throw new Error(
      [
        'The export file already exists.',
        '',
        outputPath,
        '',
        'The exporter refuses to overwrite',
        'a file that may contain manual edits.',
        '',
        'Use "--replace" only when you',
        'intentionally want to regenerate it.',
      ].join('\n'),
    );
  }

  const questIndex = questIndexFileSchema.parse(
    await readJsonFile(questIndexPath),
  );

  const questsByRowId = new Map(
    questIndex.quests.map((quest) => [quest.rowId, quest]),
  );

  const knownQuestIdsByRowId = await readKnownQuestIds(exportsDirectory);

  let discoveredRowIds: Set<number>;

  if (usesExplicitRows) {
    discoveredRowIds = new Set<number>();

    for (const rowId of explicitRowIds) {
      const quest = questsByRowId.get(rowId);

      if (!quest) {
        throw new Error(
          `Explicit quest row ${rowId} is not present in the quest index.`,
        );
      }

      if (!matchesQuestSelection(quest, selection)) {
        throw new Error(
          [
            `Explicit quest row ${rowId} is not eligible`,
            `for category "${category}".`,
            `Quest: ${quest.name}`,
          ].join(' '),
        );
      }

      discoveredRowIds.add(rowId);
    }
  } else if (usesFilterSelection) {
    discoveredRowIds = new Set(
      questIndex.quests
        .filter((quest) => matchesQuestSelection(quest, selection))
        .map((quest) => quest.rowId),
    );

    if (discoveredRowIds.size === 0) {
      throw new Error(
        [
          'No quests matched the supplied filter selection.',
          `Journal genres: ${journalGenreNames.join(', ') || 'none'}`,
          `Journal categories: ${journalCategoryNames.join(', ') || 'none'}`,
          `Classes/jobs: ${classJobIds.join(', ') || 'none'}`,
        ].join('\n'),
      );
    }

    console.log(`Filter selection matched ${discoveredRowIds.size} quests.`);
  } else {
    if (!startQuestName || !endQuestName) {
      throw new Error('Chain selection is missing its start or end quest.');
    }

    const startCandidates = questIndex.quests.filter(
      (quest) =>
        normalizeQuestName(quest.name) === normalizeQuestName(startQuestName) &&
        matchesQuestSelection(quest, selection) &&
        (startQuestRowId === undefined || quest.rowId === startQuestRowId),
    );

    if (startCandidates.length === 0) {
      throw new Error(
        [
          `No eligible starting quest named "${startQuestName}" was found.`,
          startQuestRowId !== undefined
            ? `Requested row: ${startQuestRowId}`
            : '',
        ]
          .filter(Boolean)
          .join('\n'),
      );
    }

    const startQuests = collapseEquivalentStarts(
      startCandidates,
      questsByRowId,
      selection,
    );

    const allForwardReachable = collectForwardReachable(
      startQuests.map((quest) => quest.rowId),
      questsByRowId,
      selection,
    );

    const endCandidates = questIndex.quests.filter(
      (quest) =>
        normalizeQuestName(quest.name) === normalizeQuestName(endQuestName) &&
        matchesQuestSelection(quest, selection) &&
        allForwardReachable.has(quest.rowId) &&
        (endQuestRowId === undefined || quest.rowId === endQuestRowId),
    );

    if (endCandidates.length === 0) {
      throw new Error(
        [
          `No reachable ending quest named "${endQuestName}" was found.`,
          `Starting quest: ${startQuestName}`,
          endQuestRowId !== undefined
            ? `Requested ending row: ${endQuestRowId}`
            : '',
        ]
          .filter(Boolean)
          .join('\n'),
      );
    }

    if (endCandidates.length > 1) {
      throw new Error(
        [
          `The ending quest name "${endQuestName}" is ambiguous.`,
          '',
          ...endCandidates.map((quest) => `Row ${quest.rowId}: ${quest.name}`),
          '',
          'Add --end-row with the intended XIVAPI row ID.',
        ].join('\n'),
      );
    }

    const finalQuest = endCandidates[0];

    if (!finalQuest) {
      throw new Error('The final quest could not be resolved.');
    }

    const forwardReachable = collectForwardReachable(
      startQuests.map((quest) => quest.rowId),
      questsByRowId,
      selection,
      finalQuest.rowId,
    );

    discoveredRowIds = collectBackwardReachable(
      finalQuest.rowId,
      forwardReachable,
      questsByRowId,
      selection,
    );

    for (const startQuest of startQuests) {
      if (!discoveredRowIds.has(startQuest.rowId)) {
        throw new Error(
          [
            'A starting route does not reach the requested final quest.',
            '',
            `Starting row: ${startQuest.rowId}`,
            `Starting quest: ${startQuest.name}`,
          ].join('\n'),
        );
      }
    }
  }

  const orderedQuests = topologicallySortQuests(
    discoveredRowIds,
    questsByRowId,
  );

  const questIdsByRowId = createQuestIds(
    orderedQuests,
    questIdNamespace,
    category,
    knownQuestIdsByRowId,
  );

  const reviewsByRowId = new Map<number, ResolvedReview>();

  console.log('');
  console.log(['Preparing', orderedQuests.length, 'quests...'].join(' '));

  for (let index = 0; index < orderedQuests.length; index += 1) {
    const quest = orderedQuests[index];

    if (!quest) {
      continue;
    }

    console.log(
      [
        `[${index + 1}/${orderedQuests.length}]`,
        quest.name,
        `(row ${quest.rowId})`,
      ].join(' '),
    );

    const resolvedPath = await ensureResolvedReview(quest.rowId, {
      offline,
      refresh,
    });

    reviewsByRowId.set(quest.rowId, await readResolvedReview(resolvedPath));
  }

  const dutyReferencesByQuestRowId = new Map<
    number,
    InterpretedQuestDutyReference[]
  >();

  const allDutyReferences: InterpretedQuestDutyReference[] = [];

  for (const [questRowId, review] of reviewsByRowId) {
    const reviewObject = review as JsonObject;

    const draft = asObject(review.questDraft) ?? {};

    const dutyReferences = extractDutyReferences(reviewObject, draft);

    dutyReferencesByQuestRowId.set(questRowId, dutyReferences);

    allDutyReferences.push(...dutyReferences);
  }

  const resolvedDutyMetadata = await resolveQuestDutyReferences(
    allDutyReferences,
    {
      offline,
    },
  );

  const resolvedDutyMetadataByRowId = new Map(
    resolvedDutyMetadata.map((duty) => [duty.instanceContentRowId, duty]),
  );

  const experienceInputsByRowId = new Map<
    number,
    {
      level: number;
      experienceFactor: number;
    }
  >();

  for (const quest of orderedQuests) {
    const review = reviewsByRowId.get(quest.rowId);

    if (!review) {
      continue;
    }

    const inputs = readQuestExperienceInputs(review);

    if (inputs) {
      experienceInputsByRowId.set(quest.rowId, inputs);
    }
  }

  const levelsRequiringParamGrow = Array.from(experienceInputsByRowId.values())
    .filter((inputs) => inputs.experienceFactor > 0)
    .map((inputs) => inputs.level);

  const paramGrowByLevel =
    levelsRequiringParamGrow.length > 0
      ? await fetchParamGrowExperienceData(levelsRequiringParamGrow, offline)
      : new Map<number, ParamGrowExperienceData>();

  const experienceByRowId = new Map<number, number>();

  for (const [rowId, inputs] of experienceInputsByRowId) {
    if (inputs.experienceFactor === 0) {
      experienceByRowId.set(rowId, 0);
      continue;
    }

    const paramGrow = paramGrowByLevel.get(inputs.level);

    if (!paramGrow) {
      throw new Error(
        `Quest row ${rowId} could not resolve ParamGrow level ${inputs.level}.`,
      );
    }

    experienceByRowId.set(
      rowId,
      calculateQuestExperience(inputs.experienceFactor, paramGrow),
    );
  }

  const issues: ExportIssue[] = [];

  const issueKeys = new Set<string>();

  const exportedQuests: QuestExportEntry[] = [];

  for (let index = 0; index < orderedQuests.length; index += 1) {
    const quest = orderedQuests[index];

    if (!quest) {
      continue;
    }

    const review = reviewsByRowId.get(quest.rowId);

    const questId = questIdsByRowId.get(quest.rowId);

    if (!review || !questId) {
      throw new Error(`Quest row ${quest.rowId} could not be exported.`);
    }

    const internalPreviousRowIds = quest.previousQuestRowIds.filter((rowId) =>
      discoveredRowIds.has(rowId),
    );

    const previousRowIds =
      internalPreviousRowIds.length > 0
        ? internalPreviousRowIds
        : quest.previousQuestRowIds.filter((rowId) => {
            const previousQuest = questsByRowId.get(rowId);

            return (
              previousQuest !== undefined &&
              isEligibleQuest(previousQuest, category)
            );
          });

    const internalNextRowIds = quest.nextQuestRowIds.filter((rowId) =>
      discoveredRowIds.has(rowId),
    );

    const nextRowIds =
      internalNextRowIds.length > 0
        ? internalNextRowIds
        : quest.nextQuestRowIds.filter((rowId) => {
            const nextQuest = questsByRowId.get(rowId);

            return (
              nextQuest !== undefined && isEligibleQuest(nextQuest, category)
            );
          });

    const previousQuestIds = previousRowIds
      .map((rowId) =>
        resolveRelatedQuestId(
          rowId,
          questIdsByRowId,
          knownQuestIdsByRowId,
          questsByRowId,
          questIdNamespace,
          category,
        ),
      )
      .filter((id): id is string => id !== undefined);

    const nextQuestIds = nextRowIds
      .map((rowId) =>
        resolveRelatedQuestId(
          rowId,
          questIdsByRowId,
          knownQuestIdsByRowId,
          questsByRowId,
          questIdNamespace,
          category,
        ),
      )
      .filter((id): id is string => id !== undefined);

    const questDutyReferences =
      dutyReferencesByQuestRowId.get(quest.rowId) ?? [];

    const resolvedQuestDuties = questDutyReferences.flatMap((reference) => {
      const duty = resolvedDutyMetadataByRowId.get(
        reference.instanceContentRowId,
      );

      /*
       * InstanceContent rows without a
       * ContentFinderCondition represent
       * non-Duty-Finder quest instances.
       */
      if (!duty) {
        return [];
      }

      return [
        {
          ...duty,

          relationship: reference.relationship,
        },
      ];
    });

    exportedQuests.push(
      createQuestEntry(
        quest,
        review,
        experienceByRowId.get(quest.rowId),
        index + 1,
        questId,
        previousQuestIds,
        nextQuestIds,
        expansionId,
        patch,
        category,
        resolvedQuestDuties,
        issues,
        issueKeys,
      ),
    );
  }

  const questsById = new Map(exportedQuests.map((quest) => [quest.id, quest]));

  const branches = exportedQuests
    .filter((quest) => quest.nextQuestIds.length > 1)
    .map((quest) => ({
      questId: quest.id,
      questName: quest.name,

      relatedQuestIds: quest.nextQuestIds,
    }));

  const convergences = exportedQuests
    .filter((quest) => quest.previousQuestIds.length > 1)
    .map((quest) => ({
      questId: quest.id,
      questName: quest.name,

      relatedQuestIds: quest.previousQuestIds,
    }));

  for (const branch of branches) {
    for (const relatedQuestId of branch.relatedQuestIds) {
      if (!questsById.has(relatedQuestId)) {
        throw new Error(
          `Branch references missing quest ID: ${relatedQuestId}`,
        );
      }
    }
  }

  const rawExport: JsonObject = {
    schemaVersion: 1,

    id: exportId,
    title,

    expansionId,
    patch,
    category,

    generatedAt: new Date().toISOString(),

    source: {
      provider: 'xivapi',

      version: questIndex.source.version,

      schema: questIndex.source.schema,
    },

    summary: {
      questCount: exportedQuests.length,

      branchCount: branches.length,

      convergenceCount: convergences.length,

      unresolvedIssueCount: issues.length,
    },

    branches,
    convergences,
    issues,

    quests: exportedQuests,
  };

  const validatedExport: QuestChainExport =
    questChainExportSchema.parse(rawExport);

  await mkdir(path.dirname(outputPath), {
    recursive: true,
  });

  await writeJsonFile(outputPath, validatedExport);

  console.log('');
  console.log('Quest-chain export complete.');

  console.log('');
  console.log(`Quests: ${validatedExport.summary.questCount}`);

  console.log(`Branches: ${validatedExport.summary.branchCount}`);

  console.log(`Convergences: ${validatedExport.summary.convergenceCount}`);

  console.log(
    `Unresolved issues: ${validatedExport.summary.unresolvedIssueCount}`,
  );

  console.log('');
  console.log(`Export: ${outputPath}`);

  console.log('');
  console.log(
    [
      'Edit this export file directly.',
      'The exporter will not overwrite it',
      'unless you explicitly pass "--replace".',
    ].join(' '),
  );
}

await main();
