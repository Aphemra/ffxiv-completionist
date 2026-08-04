import { access, readFile, writeFile } from 'node:fs/promises';

import { constants } from 'node:fs';

import { spawn } from 'node:child_process';

import path from 'node:path';

import * as z from 'zod';

import { questCollectionFileSchema } from '../../src/modules/quests/data/questCollectionFileSchemas';

import { questManifestEntrySchema } from '../../src/modules/quests/data/questSchemas';

import {
  questCollectionDefinitionSchema,
  type QuestCollectionDefinition,
} from './collectionDefinitionSchemas';

import {
  createSafePathSegment,
  projectRoot,
  questIndexPath,
  xivapiCacheRoot,
  writeJsonFile,
} from './paths';

type JsonObject = Record<string, unknown>;

interface PreparedQuest {
  rowId: number;
  id: string;
  name: string;
  level: number;

  draft: JsonObject;
  review: ResolvedQuestReview;

  override: JsonObject;
}

interface ExternalRelationship {
  sourceRowId: number;
  sourceQuestId: string;

  relationship: 'previous' | 'next';

  externalRowId: number;
}

const linkedQuestSchema = z
  .object({
    rowId: z.number().int().positive(),
    name: z.string().min(1),
    internalId: z.string().min(1).optional(),
  })
  .passthrough();

const resolvedQuestReviewSchema = z
  .object({
    identity: z
      .object({
        rowId: z.number().int().positive(),

        name: z.string().min(1),

        suggestedId: z.string().min(1),
      })
      .passthrough(),

    chain: z
      .object({
        previousQuests: z.array(linkedQuestSchema).optional(),

        nextQuests: z.array(linkedQuestSchema).optional(),
      })
      .passthrough()
      .optional(),

    questDraft: z.record(z.string(), z.unknown()),

    manualChecks: z.array(z.string()).optional(),

    resolution: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

type ResolvedQuestReview = z.infer<typeof resolvedQuestReviewSchema>;

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

function hasOwnProperty(value: JsonObject, propertyName: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, propertyName);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);

    return true;
  } catch {
    return false;
  }
}

function resolveProjectPath(inputPath: string): string {
  return path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(projectRoot, inputPath);
}

function readDefinitionArgument(): string {
  const argumentIndex = process.argv.indexOf('--definition');

  const rawPath =
    argumentIndex >= 0 ? process.argv[argumentIndex + 1] : undefined;

  if (!rawPath) {
    throw new Error(
      [
        'A collection definition is required.',
        '',
        'Usage:',
        'npm run xivapi:build:collection -- --definition scripts/xivapi/collectionDefinitions/example-botanist.json',
      ].join('\n'),
    );
  }

  return resolveProjectPath(rawPath);
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
        'This command must be launched through npm, for example:',
        'npm run xivapi:build:collection -- --definition <path>',
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

async function ensureQuestIndex(
  refreshIndex: boolean,
  offline: boolean,
): Promise<void> {
  const indexExists = await fileExists(questIndexPath);

  if (indexExists && !refreshIndex) {
    return;
  }

  if (offline) {
    throw new Error(
      [
        'The quest index is missing or requires refreshing.',
        'Offline mode cannot rebuild it.',
      ].join('\n'),
    );
  }

  await runNpmScript('xivapi:index:quests');
}

function getQuestFilePaths(rowId: number) {
  const inspectionDirectory = path.join(xivapiCacheRoot, 'inspection');

  return {
    focused: path.join(inspectionDirectory, `quest-${rowId}.focused.json`),

    review: path.join(inspectionDirectory, `quest-${rowId}.review.json`),

    resolved: path.join(inspectionDirectory, `quest-${rowId}.resolved.json`),
  };
}

async function ensureResolvedReview(
  rowId: number,
  refresh: boolean,
  offline: boolean,
): Promise<string> {
  const filePaths = getQuestFilePaths(rowId);

  const resolvedExists = await fileExists(filePaths.resolved);

  if (resolvedExists && !refresh) {
    return filePaths.resolved;
  }

  if (offline) {
    throw new Error(
      [
        `No current resolved review exists for quest row ${rowId}.`,
        'Offline mode cannot create it.',
      ].join('\n'),
    );
  }

  const focusedExists = await fileExists(filePaths.focused);

  if (refresh || !focusedExists) {
    await runNpmScript('xivapi:inspect:quest', ['--row', String(rowId)]);
  }

  const reviewExists = await fileExists(filePaths.review);

  if (refresh || !reviewExists) {
    await runNpmScript('xivapi:interpret:quest', [
      '--input',
      path.relative(projectRoot, filePaths.focused),
    ]);
  }

  const updatedResolvedExists = await fileExists(filePaths.resolved);

  if (refresh || !updatedResolvedExists) {
    await runNpmScript('xivapi:resolve:quest', [
      '--input',
      path.relative(projectRoot, filePaths.review),
    ]);
  }

  return filePaths.resolved;
}

async function readResolvedReview(
  filePath: string,
): Promise<ResolvedQuestReview> {
  const rawText = await readFile(filePath, 'utf8');

  return resolvedQuestReviewSchema.parse(JSON.parse(rawText) as unknown);
}

function deepMerge(
  baseValue: JsonObject,
  overrideValue: JsonObject,
): JsonObject {
  const result = structuredClone(baseValue);

  for (const [key, overrideEntry] of Object.entries(overrideValue)) {
    const baseObject = asObject(result[key]);

    const overrideObject = asObject(overrideEntry);

    if (baseObject && overrideObject) {
      result[key] = deepMerge(baseObject, overrideObject);

      continue;
    }

    result[key] = structuredClone(overrideEntry);
  }

  return result;
}

function stripInheritedMetadata(quest: JsonObject): void {
  delete quest.category;
  delete quest.expansionId;
  delete quest.patch;
}

function collectDefinitionRowIds(
  definition: QuestCollectionDefinition,
): number[] {
  const rowIds: number[] = [];
  const seenRowIds = new Set<number>();

  for (const group of definition.collection.groups) {
    for (const rowId of group.questRowIds) {
      if (seenRowIds.has(rowId)) {
        throw new Error(
          [
            `Quest row ${rowId} appears more than once`,
            'in the collection definition.',
          ].join(' '),
        );
      }

      seenRowIds.add(rowId);
      rowIds.push(rowId);
    }
  }

  return rowIds;
}

function readOverride(
  definition: QuestCollectionDefinition,
  rowId: number,
): JsonObject {
  const override = definition.questOverrides?.[String(rowId)];

  return override ? structuredClone(override) : {};
}

function readPreviousRowIds(draft: JsonObject): number[] {
  const rawRelations = asObject(draft.rawRelations);

  return asArray(rawRelations?.previousQuestRowIds)
    .map(readInteger)
    .filter((rowId): rowId is number => rowId !== undefined && rowId > 0);
}

function readNextRowIds(review: ResolvedQuestReview): number[] {
  return (review.chain?.nextQuests ?? [])
    .map((quest) => quest.rowId)
    .filter((rowId) => rowId > 0);
}

function createUniqueStrings(values: readonly string[]): string[] {
  return Array.from(new Set(values));
}

function applyRelationships(
  preparedQuest: PreparedQuest,
  questIdsByRowId: ReadonlyMap<number, string>,
  externalRelationships: ExternalRelationship[],
): void {
  const { rowId, id, draft, review, override } = preparedQuest;

  if (!hasOwnProperty(override, 'prerequisiteQuestIds')) {
    const prerequisiteQuestIds: string[] = [];

    for (const previousRowId of readPreviousRowIds(draft)) {
      const previousQuestId = questIdsByRowId.get(previousRowId);

      if (previousQuestId) {
        prerequisiteQuestIds.push(previousQuestId);
      } else {
        externalRelationships.push({
          sourceRowId: rowId,
          sourceQuestId: id,

          relationship: 'previous',

          externalRowId: previousRowId,
        });
      }
    }

    if (prerequisiteQuestIds.length > 0) {
      draft.prerequisiteQuestIds = createUniqueStrings(prerequisiteQuestIds);
    } else {
      delete draft.prerequisiteQuestIds;
    }
  }

  if (!hasOwnProperty(override, 'nextQuestIds')) {
    const nextQuestIds: string[] = [];

    for (const nextRowId of readNextRowIds(review)) {
      const nextQuestId = questIdsByRowId.get(nextRowId);

      if (nextQuestId) {
        nextQuestIds.push(nextQuestId);
      } else {
        externalRelationships.push({
          sourceRowId: rowId,
          sourceQuestId: id,

          relationship: 'next',

          externalRowId: nextRowId,
        });
      }
    }

    if (nextQuestIds.length > 0) {
      draft.nextQuestIds = createUniqueStrings(nextQuestIds);
    } else {
      delete draft.nextQuestIds;
    }
  }
}

function createReport(
  definitionPath: string,
  definition: QuestCollectionDefinition,
  preparedQuests: readonly PreparedQuest[],
  externalRelationships: readonly ExternalRelationship[],
  outputPaths: {
    manifest: string;
    collection: string;
    bundle: string;
  },
): string {
  const lines: string[] = [
    `# ${definition.manifest.title}`,
    '',
    '## Build summary',
    '',
    `- Collection ID: ${definition.manifest.id}`,
    `- Category: ${definition.manifest.category}`,
    `- Expansion: ${definition.manifest.expansionId}`,
    `- Patch: ${definition.manifest.patch}`,
    `- Verification: ${definition.manifest.verificationStatus}`,
    `- Quest count: ${preparedQuests.length}`,
    `- Definition: ${definitionPath}`,
    '',
    '## Generated files',
    '',
    `- Manifest entry: ${outputPaths.manifest}`,
    `- Collection file: ${outputPaths.collection}`,
    `- Combined bundle: ${outputPaths.bundle}`,
    '',
    '## Quests',
    '',
  ];

  for (const quest of preparedQuests) {
    const manualChecks = quest.review.manualChecks ?? [];

    lines.push(
      [
        `- Row ${quest.rowId}:`,
        `**${quest.name}**`,
        `→ \`${quest.id}\``,
        `(level ${quest.level},`,
        `${manualChecks.length} manual checks)`,
      ].join(' '),
    );

    for (const check of manualChecks) {
      lines.push(`  - ${check}`);
    }
  }

  lines.push('', '## External relationships', '');

  if (externalRelationships.length === 0) {
    lines.push('- None detected.');
  } else {
    for (const relationship of externalRelationships) {
      lines.push(
        [
          `- \`${relationship.sourceQuestId}\``,
          `${relationship.relationship} quest`,
          `is external row ${relationship.externalRowId}.`,
        ].join(' '),
      );
    }
  }

  lines.push(
    '',
    'External relationships are preserved in each quest’s raw XIVAPI data.',
    'Add collection-level `startsAfterQuestIds`, `continuesToQuestIds`,',
    'or explicit quest overrides when connecting separate collection files.',
    '',
  );

  return lines.join('\n');
}

async function main(): Promise<void> {
  const definitionPath = readDefinitionArgument();

  const refresh = process.argv.includes('--refresh');

  const refreshIndex = process.argv.includes('--refresh-index');

  const offline = process.argv.includes('--offline');

  const definitionText = await readFile(definitionPath, 'utf8');

  const definition = questCollectionDefinitionSchema.parse(
    JSON.parse(definitionText) as unknown,
  );

  await ensureQuestIndex(refreshIndex, offline);

  const rowIds = collectDefinitionRowIds(definition);

  const reviewsByRowId = new Map<number, ResolvedQuestReview>();

  for (let index = 0; index < rowIds.length; index += 1) {
    const rowId = rowIds[index];

    if (rowId === undefined) {
      continue;
    }

    console.log('');
    console.log(
      [
        `Preparing quest ${index + 1}`,
        `of ${rowIds.length}:`,
        `row ${rowId}`,
      ].join(' '),
    );

    const resolvedPath = await ensureResolvedReview(rowId, refresh, offline);

    const review = await readResolvedReview(resolvedPath);

    reviewsByRowId.set(rowId, review);
  }

  const preparedQuestsByRowId = new Map<number, PreparedQuest>();

  const questIdsByRowId = new Map<number, string>();

  const rowIdsByQuestId = new Map<string, number>();

  for (const rowId of rowIds) {
    const review = reviewsByRowId.get(rowId);

    if (!review) {
      throw new Error(`Resolved review for row ${rowId} was not loaded.`);
    }

    const override = readOverride(definition, rowId);

    const draft = deepMerge(review.questDraft, override);

    stripInheritedMetadata(draft);

    const id = readString(draft.id);
    const name = readString(draft.name);

    const level = readInteger(draft.level);

    if (!id || !name || !level) {
      throw new Error(
        [
          `Quest row ${rowId} produced an incomplete draft.`,
          `ID: ${String(id)}`,
          `Name: ${String(name)}`,
          `Level: ${String(level)}`,
        ].join('\n'),
      );
    }

    const duplicateRowId = rowIdsByQuestId.get(id);

    if (duplicateRowId !== undefined) {
      throw new Error(
        [
          `Duplicate generated quest ID "${id}".`,
          `Rows: ${duplicateRowId} and ${rowId}.`,
          'Add an ID override in the collection definition.',
        ].join('\n'),
      );
    }

    const preparedQuest: PreparedQuest = {
      rowId,
      id,
      name,
      level,

      draft,
      review,
      override,
    };

    preparedQuestsByRowId.set(rowId, preparedQuest);

    questIdsByRowId.set(rowId, id);

    rowIdsByQuestId.set(id, rowId);
  }

  const externalRelationships: ExternalRelationship[] = [];

  for (const preparedQuest of preparedQuestsByRowId.values()) {
    applyRelationships(preparedQuest, questIdsByRowId, externalRelationships);
  }

  const outputGroups: JsonObject[] = [];

  const orderedPreparedQuests: PreparedQuest[] = [];

  for (const group of definition.collection.groups) {
    const outputGroup: JsonObject = {
      id: group.id,
      title: group.title,
      sortOrder: group.sortOrder,
    };

    if (group.description !== undefined) {
      outputGroup.description = group.description;
    }

    if (group.levelRange !== undefined) {
      outputGroup.levelRange = group.levelRange;
    }

    const outputQuests: JsonObject[] = [];

    for (
      let questIndex = 0;
      questIndex < group.questRowIds.length;
      questIndex += 1
    ) {
      const rowId = group.questRowIds[questIndex];

      if (rowId === undefined) {
        continue;
      }

      const preparedQuest = preparedQuestsByRowId.get(rowId);

      if (!preparedQuest) {
        throw new Error(`Prepared quest row ${rowId} is missing.`);
      }

      const outputQuest = structuredClone(preparedQuest.draft);

      outputQuest.sortOrder = questIndex + 1;

      outputQuests.push(outputQuest);

      orderedPreparedQuests.push(preparedQuest);
    }

    outputGroup.quests = outputQuests;

    outputGroups.push(outputGroup);
  }

  const collectionFile: JsonObject = {
    schemaVersion: 1,
    format: 'linear',
    groups: outputGroups,
  };

  if (definition.collection.startsAfterQuestIds !== undefined) {
    collectionFile.startsAfterQuestIds =
      definition.collection.startsAfterQuestIds;
  }

  if (definition.collection.continuesToQuestIds !== undefined) {
    collectionFile.continuesToQuestIds =
      definition.collection.continuesToQuestIds;
  }

  const validatedCollection = questCollectionFileSchema.parse(collectionFile);

  const validatedManifest = questManifestEntrySchema.parse(definition.manifest);

  const safeCollectionId = createSafePathSegment(validatedManifest.id);

  const stagingDirectory = path.join(
    xivapiCacheRoot,
    'staging',
    safeCollectionId,
  );

  const manifestOutputPath = path.join(
    stagingDirectory,
    `${safeCollectionId}.manifest-entry.json`,
  );

  const collectionOutputPath = path.join(
    stagingDirectory,
    `${safeCollectionId}.collection.json`,
  );

  const bundleOutputPath = path.join(
    stagingDirectory,
    `${safeCollectionId}.bundle.json`,
  );

  const reportOutputPath = path.join(
    stagingDirectory,
    `${safeCollectionId}.report.md`,
  );

  await writeJsonFile(manifestOutputPath, validatedManifest);

  await writeJsonFile(collectionOutputPath, validatedCollection);

  await writeJsonFile(bundleOutputPath, {
    generatedAt: new Date().toISOString(),

    sourceDefinition: definitionPath,

    manifestEntry: validatedManifest,

    collectionFile: validatedCollection,
  });

  const report = createReport(
    definitionPath,
    definition,
    orderedPreparedQuests,
    externalRelationships,
    {
      manifest: manifestOutputPath,

      collection: collectionOutputPath,

      bundle: bundleOutputPath,
    },
  );

  await writeFile(reportOutputPath, report, 'utf8');

  console.log('');
  console.log(report);

  console.log(`Report: ${reportOutputPath}`);
}

await main();
