import { readFile, writeFile } from 'node:fs/promises';

import path from 'node:path';

import * as z from 'zod';

import {
  delayBetweenRequests,
  requestXivapi,
  XivapiRequestError,
} from './client';

import { readXivapiPins } from './pins';

import {
  projectRoot,
  questIndexPath,
  readJsonFile,
  writeJsonFile,
} from './paths';

import { xivapiSheetResponseSchema, type XivapiPins } from './schemas';

type JsonObject = Record<string, unknown>;

interface ResolvedReference {
  rowId: number;
  sheet: string;
  name: string;

  iconId?: number;
  quantity?: number;
}

interface EnrichedReferences {
  all: JsonObject[];
  unresolved: JsonObject[];
}

const questIndexEntrySchema = z.looseObject({
  rowId: z.number().int().min(0),
  name: z.string().min(1),

  gameId: z.string().min(1).optional(),

  previousQuestRowIds: z.array(z.number().int().min(0)),

  nextQuestRowIds: z.array(z.number().int().min(0)),
});

const questIndexFileSchema = z.looseObject({
  indexVersion: z.number().int().min(2),

  quests: z.array(questIndexEntrySchema),
});

const questReviewSchema = z.looseObject({
  identity: z.looseObject({
    rowId: z.number().int().min(0),
    name: z.string().min(1),
  }),

  questDraft: z.record(z.string(), z.unknown()),
});

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

function ensureObject(parent: JsonObject, key: string): JsonObject {
  const existingObject = asObject(parent[key]);

  if (existingObject) {
    return existingObject;
  }

  const createdObject: JsonObject = {};

  parent[key] = createdObject;

  return createdObject;
}

function readFieldName(fields: JsonObject): string | undefined {
  return (
    readString(fields.Name) ??
    readString(fields.NameEnglish) ??
    readString(fields.Singular)
  );
}

function readIconId(fields: JsonObject): number | undefined {
  return readInteger(asObject(fields.Icon)?.id);
}

function chunkValues<T>(values: readonly T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += chunkSize) {
    chunks.push(values.slice(index, index + chunkSize));
  }

  return chunks;
}

async function fetchSheetRows(
  sheet: string,
  rowIds: readonly number[],
  fields: string,
  pins: XivapiPins,
): Promise<Map<number, JsonObject>> {
  const uniqueRowIds = Array.from(new Set(rowIds));

  const rowsById = new Map<number, JsonObject>();

  if (uniqueRowIds.length === 0) {
    return rowsById;
  }

  async function fetchChunk(chunk: readonly number[]): Promise<void> {
    if (chunk.length === 0) {
      return;
    }

    try {
      const response = await requestXivapi({
        path: `/sheet/${sheet}`,

        query: {
          rows: chunk.join(','),
          fields,

          language: 'en',

          version: pins.version,
          schema: pins.schema,
        },

        responseSchema: xivapiSheetResponseSchema,
      });

      for (const row of response.rows) {
        rowsById.set(row.row_id, row.fields);
      }
    } catch (error) {
      const isMissingRowError =
        error instanceof XivapiRequestError && error.status === 404;

      if (!isMissingRowError) {
        throw error;
      }

      /*
       * XIVAPI can reject an entire `rows` request
       * when even one requested row is missing.
       *
       * Split the batch until the invalid row is
       * isolated, then skip only that row.
       */
      if (chunk.length === 1) {
        const missingRowId = chunk[0];

        if (missingRowId !== undefined) {
          console.warn(
            [`Skipping missing ${sheet}`, `row ${missingRowId}.`].join(' '),
          );
        }

        return;
      }

      const midpoint = Math.ceil(chunk.length / 2);

      const leftChunk = chunk.slice(0, midpoint);

      const rightChunk = chunk.slice(midpoint);

      await fetchChunk(leftChunk);
      await fetchChunk(rightChunk);
    }
  }

  const chunks = chunkValues(uniqueRowIds, 100);

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
    const chunk = chunks[chunkIndex];

    if (!chunk) {
      continue;
    }

    console.log(
      [
        `Resolving ${sheet} rows`,
        `${chunkIndex + 1}`,
        `of ${chunks.length}...`,
      ].join(' '),
    );

    await fetchChunk(chunk);

    await delayBetweenRequests();
  }

  return rowsById;
}

function createResolvedReferences(
  sheet: string,
  rowsById: ReadonlyMap<number, JsonObject>,
): Map<number, ResolvedReference> {
  const references = new Map<number, ResolvedReference>();

  for (const [rowId, fields] of rowsById) {
    const name = readFieldName(fields);

    if (!name) {
      continue;
    }

    const reference: ResolvedReference = {
      rowId,
      sheet,
      name,
    };

    const iconId = readIconId(fields);

    if (iconId !== undefined) {
      reference.iconId = iconId;
    }

    const quantity = readInteger(fields.StackSize);

    if (quantity !== undefined && quantity > 0) {
      reference.quantity = quantity;
    }

    references.set(rowId, reference);
  }

  return references;
}

function collectReferenceRowIds(values: unknown, rowIdField: string): number[] {
  return asArray(values)
    .map((value) => readInteger(asObject(value)?.[rowIdField]))
    .filter((rowId): rowId is number => rowId !== undefined && rowId > 0);
}

function collectItemReferenceRowIds(
  values: unknown,
  itemSheet: 'Item' | 'EventItem',
): number[] {
  return asArray(values)
    .map(asObject)
    .filter(
      (reference): reference is JsonObject =>
        reference !== undefined &&
        readString(reference.itemSheet) === itemSheet,
    )
    .map((reference) => readInteger(reference.itemRowId))
    .filter((rowId): rowId is number => rowId !== undefined && rowId > 0);
}

function deduplicateItemReferences(values: readonly unknown[]): JsonObject[] {
  const referencesByKey = new Map<string, JsonObject>();

  for (const rawValue of values) {
    const reference = asObject(rawValue);

    if (!reference) {
      continue;
    }

    const itemSheet = readString(reference.itemSheet);

    const itemRowId = readInteger(reference.itemRowId);

    const key =
      itemSheet !== undefined && itemRowId !== undefined
        ? `${itemSheet}:${itemRowId}`
        : JSON.stringify(reference);

    if (!referencesByKey.has(key)) {
      referencesByKey.set(key, reference);
    }
  }

  return Array.from(referencesByKey.values());
}

function enrichReferences(
  values: unknown,
  rowIdField: string,
  resolvedReferences: ReadonlyMap<number, ResolvedReference>,
): EnrichedReferences {
  const all: JsonObject[] = [];
  const unresolved: JsonObject[] = [];

  for (const rawValue of asArray(values)) {
    const originalValue = asObject(rawValue);

    if (!originalValue) {
      continue;
    }

    const enrichedValue: JsonObject = {
      ...originalValue,
    };

    const rowId = readInteger(originalValue[rowIdField]);

    const resolution =
      rowId !== undefined ? resolvedReferences.get(rowId) : undefined;

    if (resolution) {
      enrichedValue.name = resolution.name;

      enrichedValue.resolvedSheet = resolution.sheet;

      if (resolution.iconId !== undefined) {
        enrichedValue.iconId = resolution.iconId;
      }

      if (resolution.quantity !== undefined) {
        enrichedValue.quantity = resolution.quantity;
      }
    } else {
      unresolved.push(enrichedValue);
    }

    all.push(enrichedValue);
  }

  return {
    all,
    unresolved,
  };
}

function updateObjectiveNames(
  values: unknown,
  actorsByRowId: ReadonlyMap<number, ResolvedReference>,
): void {
  for (const rawValue of asArray(values)) {
    const objective = asObject(rawValue);

    if (!objective) {
      continue;
    }

    const targetRowId = readInteger(objective.targetRowId);

    if (targetRowId === undefined) {
      continue;
    }

    const actor = actorsByRowId.get(targetRowId);

    if (actor) {
      objective.targetName = actor.name;
    }
  }
}

function removeManualCheck(checks: string[], exactText: string): void {
  const checkIndex = checks.indexOf(exactText);

  if (checkIndex >= 0) {
    checks.splice(checkIndex, 1);
  }
}

function addManualCheck(checks: string[], text: string): void {
  if (!checks.includes(text)) {
    checks.push(text);
  }
}

function readInputPath(): string {
  const inputArgumentIndex = process.argv.indexOf('--input');

  const rawPath =
    inputArgumentIndex >= 0 ? process.argv[inputArgumentIndex + 1] : undefined;

  if (!rawPath) {
    throw new Error(
      [
        'A quest review file is required.',
        '',
        'Usage:',
        'npm run xivapi:resolve:quest -- --input scripts/xivapi/.cache/inspection/quest-65545.review.json',
      ].join('\n'),
    );
  }

  return path.isAbsolute(rawPath)
    ? rawPath
    : path.resolve(projectRoot, rawPath);
}

function createMarkdown(review: JsonObject): string {
  const identity = asObject(review.identity);

  const classification = asObject(review.classification);

  const start = asObject(review.start);

  const startActor = asObject(start?.actor);

  const startLocation = asObject(start?.location);

  const coordinates = asObject(startLocation?.coordinates);

  const chain = asObject(review.chain);

  const requirements = asObject(review.requirements);

  const rewards = asObject(review.rewards);

  const flags = asObject(review.flags);

  const lines: string[] = [
    `# ${readString(identity?.name) ?? 'Unknown Quest'}`,
    '',
    '## Identity',
    '',
    `- XIVAPI row: ${readInteger(identity?.rowId) ?? 'Unknown'}`,
    `- Internal ID: ${readString(identity?.internalId) ?? 'Unknown'}`,
    `- Suggested app ID: ${readString(identity?.suggestedId) ?? 'Unknown'}`,
    `- Expansion: ${readString(classification?.expansion) ?? 'Unknown'}`,
    `- Quest line: ${readString(classification?.journalGenre) ?? 'Unknown'}`,
    `- Suggested category: ${readString(classification?.suggestedCategory) ?? 'Unknown'}`,
    `- Level: ${readInteger(classification?.level) ?? 'Unknown'}`,
    `- Class/job: ${readString(classification?.classJobName) ?? 'None detected'}`,
    '',
    '## Start',
    '',
    `- NPC: ${readString(startActor?.name) ?? 'Unknown'}`,
    `- Title: ${readString(startActor?.title) ?? 'None'}`,
    `- Zone: ${readString(startLocation?.zoneName) ?? 'Unknown'}`,
    `- Coordinates: ${
      coordinates
        ? [`X ${String(coordinates.x)}`, `Y ${String(coordinates.y)}`].join(
            ', ',
          )
        : 'Unknown'
    }`,
    '',
    '## Quest chain',
    '',
  ];

  const previousQuests = asArray(chain?.previousQuests);

  if (previousQuests.length === 0) {
    lines.push('- Previous: None detected');
  } else {
    for (const rawQuest of previousQuests) {
      const quest = asObject(rawQuest);

      lines.push(
        [
          '- Previous:',
          readString(quest?.name) ?? 'Unknown quest',
          `(row ${readInteger(quest?.rowId) ?? 'unknown'})`,
        ].join(' '),
      );
    }
  }

  const nextQuests = asArray(chain?.nextQuests);

  if (nextQuests.length === 0) {
    lines.push('- Next: None detected by reverse index');
  } else {
    for (const rawQuest of nextQuests) {
      const quest = asObject(rawQuest);

      lines.push(
        [
          '- Next:',
          readString(quest?.name) ?? 'Unknown quest',
          `(row ${readInteger(quest?.rowId) ?? 'unknown'})`,
        ].join(' '),
      );
    }
  }

  lines.push('', '## Requirements', '');

  const classJobRequirement = asObject(requirements?.classJob);

  if (classJobRequirement) {
    lines.push(
      [
        '- Class/job:',
        readString(classJobRequirement.classJobName) ?? 'Unknown',

        `level ${readInteger(classJobRequirement.level) ?? 'unknown'}`,
      ].join(' '),
    );
  }

  const itemReferences = asArray(requirements?.itemReferences);

  if (itemReferences.length === 0) {
    lines.push('- Required items: None detected');
  } else {
    for (const rawReference of itemReferences) {
      const reference = asObject(rawReference);

      lines.push(
        [
          '- Required item:',
          readString(reference?.name) ??
            `Unresolved item row ${readInteger(reference?.itemRowId) ?? 'unknown'}`,

          '(quantity requires review)',
        ].join(' '),
      );
    }
  }

  lines.push(
    '',
    '## Rewards',
    '',
    `- Gil: ${readInteger(rewards?.gil) ?? 0}`,
    `- EXP factor: ${readInteger(rewards?.experienceFactor) ?? 'None'}`,
  );

  const guaranteedItems = asArray(rewards?.guaranteedItems);

  if (guaranteedItems.length > 0) {
    lines.push('', 'Guaranteed items:');

    for (const rawItem of guaranteedItems) {
      const item = asObject(rawItem);

      lines.push(
        [
          '-',
          readString(item?.itemName) ?? 'Unknown item',

          `×${readInteger(item?.quantity) ?? 1}`,
        ].join(' '),
      );
    }
  }

  const choiceItems = asArray(rewards?.choiceItems);

  if (choiceItems.length > 0) {
    lines.push('', 'Choose one:');

    for (const rawItem of choiceItems) {
      const item = asObject(rawItem);

      const stainName = readString(item?.stainName);

      lines.push(
        [
          '-',
          readString(item?.itemName) ?? 'Unknown item',

          `×${readInteger(item?.quantity) ?? 1}`,

          stainName ? `— ${stainName}` : '',
        ]
          .filter(Boolean)
          .join(' '),
      );
    }
  }

  lines.push(
    '',
    '## Flags',
    '',
    `- Repeatable: ${String(flags?.isRepeatable ?? false)}`,
    `- Housing required: ${String(flags?.requiresHousing ?? false)}`,
    `- Can cancel: ${String(flags?.canCancel ?? 'Unknown')}`,
    '',
    '## Manual checks',
    '',
  );

  const manualChecks = asArray(review.manualChecks);

  if (manualChecks.length === 0) {
    lines.push('- None');
  } else {
    for (const check of manualChecks) {
      lines.push(`- ${String(check)}`);
    }
  }

  lines.push('');

  return lines.join('\n');
}

async function main(): Promise<void> {
  const inputPath = readInputPath();

  const rawReviewText = await readFile(inputPath, 'utf8');

  const parsedReview = questReviewSchema.parse(
    JSON.parse(rawReviewText) as unknown,
  );

  const review = structuredClone(parsedReview) as JsonObject;

  const rawIndex = await readJsonFile(questIndexPath);

  const questIndex = questIndexFileSchema.parse(rawIndex);

  const currentRowId = parsedReview.identity.rowId;

  const currentIndexEntry = questIndex.quests.find(
    (quest) => quest.rowId === currentRowId,
  );

  if (!currentIndexEntry) {
    throw new Error(
      [
        `Quest row ${currentRowId} is not present in the quest index.`,
        'Run "npm run xivapi:index:quests" before resolving the review.',
      ].join('\n'),
    );
  }

  const questsByRowId = new Map(
    questIndex.quests.map((quest) => [quest.rowId, quest]),
  );

  const nextQuests: JsonObject[] = [];

  for (const nextQuestRowId of currentIndexEntry.nextQuestRowIds) {
    const indexedQuest = questsByRowId.get(nextQuestRowId);

    if (!indexedQuest) {
      continue;
    }

    const nextQuest: JsonObject = {
      rowId: indexedQuest.rowId,
      name: indexedQuest.name,
    };

    if (indexedQuest.gameId !== undefined) {
      nextQuest.internalId = indexedQuest.gameId;
    }

    nextQuests.push(nextQuest);
  }

  const chain = ensureObject(review, 'chain');

  chain.nextQuests = nextQuests;

  delete chain.nextQuest;

  const requirements = ensureObject(review, 'requirements');

  const unresolvedReferences = ensureObject(review, 'unresolvedReferences');

  const rawItemReferences = deduplicateItemReferences([
    ...asArray(requirements.unresolvedItems),

    ...asArray(unresolvedReferences.items),
  ]);

  const rawActorReferences = asArray(unresolvedReferences.actors);

  const itemRowIds = collectItemReferenceRowIds(rawItemReferences, 'Item');

  const eventItemRowIds = collectItemReferenceRowIds(
    rawItemReferences,
    'EventItem',
  );

  const actorRowIds = collectReferenceRowIds(rawActorReferences, 'actorRowId');

  const pins = await readXivapiPins();

  const itemRows = await fetchSheetRows('Item', itemRowIds, 'Name,Icon', pins);

  const eventItemRows = await fetchSheetRows(
    'EventItem',
    eventItemRowIds,
    'Name,Icon,StackSize',
    pins,
  );

  const resolvedItems = createResolvedReferences('Item', itemRows);

  const resolvedEventItems = createResolvedReferences(
    'EventItem',
    eventItemRows,
  );

  for (const [rowId, reference] of resolvedEventItems) {
    resolvedItems.set(rowId, reference);
  }

  const enpcRows = await fetchSheetRows(
    'ENpcResident',
    actorRowIds,
    'Singular,Title',
    pins,
  );

  const resolvedActors = createResolvedReferences('ENpcResident', enpcRows);

  const missingActorRowIds = actorRowIds.filter(
    (rowId) => !resolvedActors.has(rowId),
  );

  const eventObjectRows = await fetchSheetRows(
    'EObjName',
    missingActorRowIds,
    'Singular',
    pins,
  );

  const resolvedEventObjects = createResolvedReferences(
    'EObjName',
    eventObjectRows,
  );

  for (const [rowId, reference] of resolvedEventObjects) {
    resolvedActors.set(rowId, reference);
  }

  const enrichedItems = enrichReferences(
    rawItemReferences,
    'itemRowId',
    resolvedItems,
  );

  const enrichedActors = enrichReferences(
    rawActorReferences,
    'actorRowId',
    resolvedActors,
  );

  requirements.itemReferences = enrichedItems.all;

  if (enrichedItems.unresolved.length > 0) {
    requirements.unresolvedItems = enrichedItems.unresolved;
  } else {
    delete requirements.unresolvedItems;
  }

  if (enrichedItems.unresolved.length > 0) {
    unresolvedReferences.items = enrichedItems.unresolved;
  } else {
    delete unresolvedReferences.items;
  }

  if (enrichedActors.unresolved.length > 0) {
    unresolvedReferences.actors = enrichedActors.unresolved;
  } else {
    delete unresolvedReferences.actors;
  }

  const resolvedReferences = ensureObject(review, 'resolvedReferences');

  resolvedReferences.items = enrichedItems.all;

  resolvedReferences.actors = enrichedActors.all;

  updateObjectiveNames(review.objectives, resolvedActors);

  const questDraft = ensureObject(review, 'questDraft');

  updateObjectiveNames(questDraft.objectives, resolvedActors);

  const sourceData = ensureObject(questDraft, 'sourceData');

  const xivapiSourceData = ensureObject(sourceData, 'xivapi');

  xivapiSourceData.requiredItemReferences = enrichedItems.all;

  xivapiSourceData.resolvedActorReferences = enrichedActors.all;

  xivapiSourceData.reverseRelations = {
    nextQuestRowIds: currentIndexEntry.nextQuestRowIds,
  };

  const existingChecks = asArray(review.manualChecks).filter(
    (value): value is string => typeof value === 'string',
  );

  removeManualCheck(
    existingChecks,
    'Resolve the next quest using a reverse index across all Quest rows.',
  );

  removeManualCheck(
    existingChecks,
    'Resolve actor references found in QuestParams.',
  );

  removeManualCheck(
    existingChecks,
    'Resolve required item names and quantities from script references or another source.',
  );

  if (nextQuests.length === 0) {
    addManualCheck(
      existingChecks,
      'Confirm whether this quest intentionally has no direct successor.',
    );
  }

  if (enrichedActors.unresolved.length > 0) {
    addManualCheck(
      existingChecks,
      'Some actor references could not be resolved through ENpcResident or EObjName.',
    );
  }

  if (enrichedItems.all.length > 0) {
    const itemNames = enrichedItems.all.map(
      (rawReference) =>
        readString(rawReference.name) ??
        `item row ${readInteger(rawReference.itemRowId) ?? 'unknown'}`,
    );

    addManualCheck(
      existingChecks,
      ['Confirm required quantities for:', itemNames.join(', ')].join(' '),
    );
  }

  if (enrichedItems.unresolved.length > 0) {
    addManualCheck(
      existingChecks,
      'Some item references could not be resolved through their declared Item or EventItem sheet.',
    );
  }

  review.manualChecks = existingChecks;

  review.resolution = {
    resolverVersion: 1,

    resolvedAt: new Date().toISOString(),

    questIndexGeneratedAt: asObject(asObject(rawIndex)?.source)?.generatedAt,

    itemReferenceCount: enrichedItems.all.length,

    unresolvedItemCount: enrichedItems.unresolved.length,

    actorReferenceCount: enrichedActors.all.length,

    unresolvedActorCount: enrichedActors.unresolved.length,

    nextQuestCount: nextQuests.length,
  };

  const baseName = path.basename(inputPath, '.json').replace(/\.review$/, '');

  const outputDirectory = path.dirname(inputPath);

  const jsonOutputPath = path.join(
    outputDirectory,
    `${baseName}.resolved.json`,
  );

  const markdownOutputPath = path.join(
    outputDirectory,
    `${baseName}.resolved.md`,
  );

  await writeJsonFile(jsonOutputPath, review);

  const markdown = createMarkdown(review);

  await writeFile(markdownOutputPath, markdown, 'utf8');

  console.log('');
  console.log(markdown);

  console.log(`Resolved JSON: ${jsonOutputPath}`);

  console.log(`Resolved Markdown: ${markdownOutputPath}`);
}

await main();
