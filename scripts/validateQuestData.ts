import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as z from 'zod';

import {
  questCollectionSchema,
  questManifestSchema,
  type Quest,
  type QuestCollection,
  type QuestManifestEntry,
} from '../src/modules/quests/data/questSchemas';

type ValidationSeverity = 'error' | 'warning';

interface ValidationMessage {
  severity: ValidationSeverity;
  source: string;
  message: string;
}

interface LoadedCollection {
  entry: QuestManifestEntry;
  collection: QuestCollection;
  source: string;
}

interface QuestRecord {
  quest: Quest;
  collection: QuestCollection;
  source: string;
  groupId: string;
}

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);

const projectRoot = path.resolve(currentDirectory, '..');
const publicRoot = path.join(projectRoot, 'public');

const manifestPath = 'data/quests/manifest.json';

const messages: ValidationMessage[] = [];

function addMessage(
  severity: ValidationSeverity,
  source: string,
  message: string,
): void {
  messages.push({
    severity,
    source,
    message,
  });
}

function normalizePublicPath(relativePath: string): string {
  return relativePath.replace(/^[/\\]+/, '').replaceAll('\\', '/');
}

function resolvePublicPath(relativePath: string): string {
  const normalizedPath = normalizePublicPath(relativePath);

  const absolutePath = path.resolve(publicRoot, normalizedPath);

  const pathFromPublicRoot = path.relative(publicRoot, absolutePath);

  if (
    pathFromPublicRoot.startsWith('..') ||
    path.isAbsolute(pathFromPublicRoot)
  ) {
    throw new Error(
      `Data path "${relativePath}" resolves outside the public directory.`,
    );
  }

  return absolutePath;
}

async function readValidatedJson<TSchema extends z.ZodType>(
  relativePath: string,
  schema: TSchema,
): Promise<z.infer<TSchema> | null> {
  const normalizedPath = normalizePublicPath(relativePath);

  let rawText: string;

  try {
    rawText = await readFile(resolvePublicPath(normalizedPath), 'utf8');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown file-reading error.';

    addMessage('error', normalizedPath, `Unable to read file: ${errorMessage}`);

    return null;
  }

  let rawData: unknown;

  try {
    rawData = JSON.parse(rawText) as unknown;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown JSON parsing error.';

    addMessage('error', normalizedPath, `Invalid JSON: ${errorMessage}`);

    return null;
  }

  const result = schema.safeParse(rawData);

  if (!result.success) {
    addMessage(
      'error',
      normalizedPath,
      ['Schema validation failed.', z.prettifyError(result.error)].join('\n'),
    );

    return null;
  }

  return result.data;
}

function reportDuplicateSortOrders<T>(
  items: readonly T[],
  getSortOrder: (item: T) => number,
  getLabel: (item: T) => string,
  source: string,
  itemType: string,
): void {
  const labelsBySortOrder = new Map<number, string[]>();

  for (const item of items) {
    const sortOrder = getSortOrder(item);

    const existingLabels = labelsBySortOrder.get(sortOrder) ?? [];

    existingLabels.push(getLabel(item));
    labelsBySortOrder.set(sortOrder, existingLabels);
  }

  for (const [sortOrder, labels] of labelsBySortOrder) {
    if (labels.length < 2) {
      continue;
    }

    addMessage(
      'error',
      source,
      [
        `Duplicate ${itemType} sort order ${sortOrder}.`,
        `Affected entries: ${labels.join(', ')}`,
      ].join(' '),
    );
  }
}

function validateCollectionMetadata(loadedCollection: LoadedCollection): void {
  const { entry, collection, source } = loadedCollection;

  if (entry.id !== collection.id) {
    addMessage(
      'error',
      source,
      [
        'Manifest and collection IDs do not match.',
        `Manifest: "${entry.id}".`,
        `Collection: "${collection.id}".`,
      ].join(' '),
    );
  }

  if (entry.category !== collection.category) {
    addMessage(
      'error',
      source,
      [
        'Manifest and collection categories do not match.',
        `Manifest: "${entry.category}".`,
        `Collection: "${collection.category}".`,
      ].join(' '),
    );
  }

  reportDuplicateSortOrders(
    collection.groups,
    (group) => group.sortOrder,
    (group) => group.id,
    source,
    'group',
  );

  for (const group of collection.groups) {
    reportDuplicateSortOrders(
      group.quests,
      (quest) => quest.sortOrder,
      (quest) => quest.id,
      source,
      `quest within group "${group.id}"`,
    );

    for (const quest of group.quests) {
      if (quest.category !== collection.category) {
        addMessage(
          'error',
          source,
          [
            `Quest "${quest.id}" has category "${quest.category}",`,
            `but collection "${collection.id}" has category`,
            `"${collection.category}".`,
          ].join(' '),
        );
      }

      if (
        collection.expansionId &&
        quest.expansionId !== collection.expansionId
      ) {
        addMessage(
          'error',
          source,
          [
            `Quest "${quest.id}" belongs to expansion`,
            `"${quest.expansionId}", but its collection belongs`,
            `to "${collection.expansionId}".`,
          ].join(' '),
        );
      }

      if (collection.patch && quest.patch !== collection.patch) {
        addMessage(
          'error',
          source,
          [
            `Quest "${quest.id}" belongs to patch`,
            `"${quest.patch}", but its collection belongs`,
            `to patch "${collection.patch}".`,
          ].join(' '),
        );
      }

      if (
        group.levelRange &&
        (quest.level < group.levelRange.minimum ||
          quest.level > group.levelRange.maximum)
      ) {
        addMessage(
          'error',
          source,
          [
            `Quest "${quest.id}" is level ${quest.level}`,
            `but group "${group.id}" only allows levels`,
            `${group.levelRange.minimum}–${group.levelRange.maximum}.`,
          ].join(' '),
        );
      }

      validateAvailabilityCompatibility(collection, quest, source);
    }
  }
}

function validateAvailabilityCompatibility(
  collection: QuestCollection,
  quest: Quest,
  source: string,
): void {
  const collectionCities = collection.availability?.startingCityIds;

  const questCities = quest.availability?.startingCityIds;

  if (!collectionCities || !questCities) {
    return;
  }

  const collectionCitySet = new Set(collectionCities);

  const invalidCities = questCities.filter(
    (cityId) => !collectionCitySet.has(cityId),
  );

  if (invalidCities.length === 0) {
    return;
  }

  addMessage(
    'error',
    source,
    [
      `Quest "${quest.id}" declares starting cities that`,
      'are excluded by its collection:',
      invalidCities.join(', '),
    ].join(' '),
  );
}

function createQuestIndex(
  loadedCollections: readonly LoadedCollection[],
): Map<string, QuestRecord> {
  const questIndex = new Map<string, QuestRecord>();

  for (const { collection, source } of loadedCollections) {
    for (const group of collection.groups) {
      for (const quest of group.quests) {
        const existingQuest = questIndex.get(quest.id);

        if (existingQuest) {
          addMessage(
            'error',
            source,
            [
              `Duplicate global quest ID "${quest.id}".`,
              `It already exists in "${existingQuest.source}".`,
            ].join(' '),
          );

          continue;
        }

        questIndex.set(quest.id, {
          quest,
          collection,
          source,
          groupId: group.id,
        });
      }
    }
  }

  return questIndex;
}

function validateQuestReferences(
  questIndex: ReadonlyMap<string, QuestRecord>,
): void {
  for (const record of questIndex.values()) {
    const { quest, source } = record;

    validateReferenceList(
      quest,
      quest.prerequisiteQuestIds,
      'prerequisite',
      source,
      questIndex,
    );

    validateReferenceList(
      quest,
      quest.nextQuestIds,
      'next quest',
      source,
      questIndex,
    );

    validateReciprocalReferences(record, questIndex);
  }
}

function validateReferenceList(
  quest: Quest,
  referencedQuestIds: readonly string[] | undefined,
  relationshipName: string,
  source: string,
  questIndex: ReadonlyMap<string, QuestRecord>,
): void {
  if (!referencedQuestIds) {
    return;
  }

  const uniqueIds = new Set<string>();

  for (const referencedQuestId of referencedQuestIds) {
    if (uniqueIds.has(referencedQuestId)) {
      addMessage(
        'error',
        source,
        [
          `Quest "${quest.id}" repeats ${relationshipName}`,
          `reference "${referencedQuestId}".`,
        ].join(' '),
      );
    }

    uniqueIds.add(referencedQuestId);

    if (referencedQuestId === quest.id) {
      addMessage(
        'error',
        source,
        [
          `Quest "${quest.id}" references itself as`,
          `a ${relationshipName}.`,
        ].join(' '),
      );

      continue;
    }

    if (!questIndex.has(referencedQuestId)) {
      addMessage(
        'error',
        source,
        [
          `Quest "${quest.id}" references unknown`,
          `${relationshipName} "${referencedQuestId}".`,
        ].join(' '),
      );
    }
  }
}

function validateReciprocalReferences(
  record: QuestRecord,
  questIndex: ReadonlyMap<string, QuestRecord>,
): void {
  const { quest, source } = record;

  for (const prerequisiteQuestId of quest.prerequisiteQuestIds ?? []) {
    const prerequisiteRecord = questIndex.get(prerequisiteQuestId);

    if (!prerequisiteRecord) {
      continue;
    }

    const declaredNextQuestIds = prerequisiteRecord.quest.nextQuestIds;

    if (declaredNextQuestIds && !declaredNextQuestIds.includes(quest.id)) {
      addMessage(
        'warning',
        source,
        [
          `Quest "${quest.id}" lists`,
          `"${prerequisiteQuestId}" as a prerequisite,`,
          'but that quest has a nextQuestIds array that',
          `does not include "${quest.id}".`,
        ].join(' '),
      );
    }
  }

  for (const nextQuestId of quest.nextQuestIds ?? []) {
    const nextQuestRecord = questIndex.get(nextQuestId);

    if (!nextQuestRecord) {
      continue;
    }

    const declaredPrerequisiteQuestIds =
      nextQuestRecord.quest.prerequisiteQuestIds;

    if (
      declaredPrerequisiteQuestIds &&
      !declaredPrerequisiteQuestIds.includes(quest.id)
    ) {
      addMessage(
        'warning',
        source,
        [
          `Quest "${quest.id}" lists`,
          `"${nextQuestId}" as a next quest,`,
          'but that quest has a prerequisiteQuestIds',
          `array that does not include "${quest.id}".`,
        ].join(' '),
      );
    }
  }
}

function printMessages(): void {
  const errors = messages.filter((message) => message.severity === 'error');

  const warnings = messages.filter((message) => message.severity === 'warning');

  for (const message of errors) {
    console.error(
      ['', `[ERROR] ${message.source}`, message.message].join('\n'),
    );
  }

  for (const message of warnings) {
    console.warn(
      ['', `[WARNING] ${message.source}`, message.message].join('\n'),
    );
  }

  console.log('');
  console.log(
    `Validation completed with ${errors.length} error(s) and ${warnings.length} warning(s).`,
  );
}

async function main(): Promise<void> {
  console.log('Validating quest data...');

  const manifest = await readValidatedJson(manifestPath, questManifestSchema);

  if (!manifest) {
    printMessages();
    process.exitCode = 1;
    return;
  }

  reportDuplicateSortOrders(
    manifest.collections,
    (entry) => entry.sortOrder,
    (entry) => entry.id,
    manifestPath,
    'manifest collection',
  );

  const loadedCollections: LoadedCollection[] = [];

  for (const entry of manifest.collections) {
    const collection = await readValidatedJson(
      entry.path,
      questCollectionSchema,
    );

    if (!collection) {
      continue;
    }

    const loadedCollection = {
      entry,
      collection,
      source: normalizePublicPath(entry.path),
    };

    loadedCollections.push(loadedCollection);

    validateCollectionMetadata(loadedCollection);
  }

  const questIndex = createQuestIndex(loadedCollections);

  validateQuestReferences(questIndex);

  printMessages();

  const errorCount = messages.filter(
    (message) => message.severity === 'error',
  ).length;

  if (errorCount > 0) {
    process.exitCode = 1;
    return;
  }

  console.log(
    [
      `Validated ${loadedCollections.length}`,
      `collection(s) containing`,
      `${questIndex.size} quest(s).`,
    ].join(' '),
  );
}

await main();
