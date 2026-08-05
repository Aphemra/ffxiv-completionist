import { readFile, writeFile } from 'node:fs/promises';

import path from 'node:path';

import { projectRoot, writeJsonFile } from './paths';

import { xivapiRowResponseSchema } from './schemas';

type JsonObject = Record<string, unknown>;

interface ParsedLocation {
  sourceLevelRowId?: number;

  zoneId?: string;
  zoneName?: string;

  territoryId?: string;
  mapId?: string;
  mapGameId?: string;

  coordinates?: {
    x: number;
    y: number;
  };

  rawCoordinates?: {
    x: number;
    y: number;
    z: number;
  };
}

interface ParsedActor {
  sourceRowId?: number;
  id?: string;
  name?: string;
  title?: string;
}

interface ParsedItemReward {
  itemId: string;
  itemName: string;
  quantity: number;

  quality?: 'normal' | 'high-quality';

  choiceGroup?: number;
  stainId?: string;
  stainName?: string;

  iconId?: number;
}

interface ScriptParameter {
  instruction: string;
  argument: number;
  referenceType:
    | 'actor'
    | 'item'
    | 'level'
    | 'event-object'
    | 'action'
    | 'script-value';
}

interface ParsedObjective {
  index: number;
  quantity?: number;
  completeSequence?: number;

  targetRowId?: number;
  targetName?: string;

  locations: ParsedLocation[];
}

interface ParsedPreviousQuest {
  rowId: number;
  name: string;
  internalId?: string;
}

const GATHERING_JOBS = new Set(['BTN', 'FSH', 'MIN']);

const CRAFTING_JOBS = new Set([
  'ALC',
  'ARM',
  'BSM',
  'CRP',
  'CUL',
  'GSM',
  'LTW',
  'WVR',
]);

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

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

function readInteger(value: unknown): number | undefined {
  const numberValue = readNumber(value);

  return numberValue !== undefined && Number.isInteger(numberValue)
    ? numberValue
    : undefined;
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function relationFields(value: unknown): JsonObject | undefined {
  const relation = asObject(value);

  return asObject(relation?.fields);
}

function relationRowId(value: unknown): number | undefined {
  const relation = asObject(value);

  const rowId = readInteger(relation?.row_id) ?? readInteger(relation?.value);

  return rowId !== undefined && rowId > 0 ? rowId : undefined;
}

function relationName(value: unknown): string | undefined {
  const fields = relationFields(value);

  return (
    readString(fields?.Name) ??
    readString(fields?.NameEnglish) ??
    readString(fields?.Singular)
  );
}

function relationTitle(value: unknown): string | undefined {
  return readString(relationFields(value)?.Title);
}

function readRawOrRelationId(
  object: JsonObject | undefined,
  fieldName: string,
): number | undefined {
  const decoratedValue = readInteger(object?.[`${fieldName}@as(raw)`]);

  if (decoratedValue !== undefined && decoratedValue > 0) {
    return decoratedValue;
  }

  return relationRowId(object?.[fieldName]);
}

function iconId(value: unknown): number | undefined {
  return readInteger(asObject(value)?.id);
}

function toGameDataId(value: string): string {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'unknown';
}

function roundMapCoordinate(value: number): number {
  return Math.round(value * 10) / 10;
}

function convertWorldCoordinate(
  value: number,
  sizeFactor: number,
  offset: number,
): number {
  const scale = sizeFactor / 100;

  return (41 / scale) * (((value + offset) * scale + 1024) / 2048) + 1;
}

function parseLocation(
  value: unknown,
  fallbackZoneName?: string,
): ParsedLocation | undefined {
  const relation = asObject(value);
  const fields = relationFields(value);

  if (!fields) {
    return undefined;
  }

  const sourceLevelRowId = relationRowId(relation);

  const rawX = readNumber(fields.X);
  const rawY = readNumber(fields.Y);
  const rawZ = readNumber(fields.Z);

  const mapRelation = fields.Map;
  const mapFields = relationFields(mapRelation);

  const territoryRelation = fields.Territory;

  const territoryFields = relationFields(territoryRelation);

  const mapRowId = relationRowId(mapRelation);

  const territoryRowId = relationRowId(territoryRelation);

  const mapGameId = readString(mapFields?.Id);

  const zoneName =
    relationName(mapFields?.PlaceName) ??
    relationName(territoryFields?.PlaceName) ??
    fallbackZoneName;

  const sizeFactor = readNumber(mapFields?.SizeFactor);

  const offsetX = readNumber(mapFields?.OffsetX) ?? 0;

  const offsetY = readNumber(mapFields?.OffsetY) ?? 0;

  const coordinates =
    rawX !== undefined &&
    rawZ !== undefined &&
    sizeFactor !== undefined &&
    sizeFactor > 0
      ? {
          x: roundMapCoordinate(
            convertWorldCoordinate(rawX, sizeFactor, offsetX),
          ),

          y: roundMapCoordinate(
            convertWorldCoordinate(rawZ, sizeFactor, offsetY),
          ),
        }
      : undefined;

  const rawCoordinates =
    rawX !== undefined && rawY !== undefined && rawZ !== undefined
      ? {
          x: rawX,
          y: rawY,
          z: rawZ,
        }
      : undefined;

  return {
    sourceLevelRowId,

    zoneId: zoneName ? toGameDataId(zoneName) : undefined,

    zoneName,

    territoryId:
      territoryRowId !== undefined ? `territory-${territoryRowId}` : undefined,

    mapId: mapRowId !== undefined ? `map-${mapRowId}` : undefined,

    mapGameId,
    coordinates,
    rawCoordinates,
  };
}

function parseActor(value: unknown): ParsedActor | undefined {
  const sourceRowId = relationRowId(value);

  const name = relationName(value);
  const title = relationTitle(value);

  if (sourceRowId === undefined && name === undefined) {
    return undefined;
  }

  return {
    sourceRowId,

    id: sourceRowId !== undefined ? `enpc-${sourceRowId}` : undefined,

    name,
    title,
  };
}

function parseScriptParameters(fields: JsonObject): ScriptParameter[] {
  return asArray(fields.QuestParams)
    .map((rawParameter) => {
      const parameter = asObject(rawParameter);

      const instruction = readString(parameter?.ScriptInstruction);

      const argument = readInteger(parameter?.ScriptArg);

      if (!instruction || argument === undefined) {
        return undefined;
      }

      let referenceType: ScriptParameter['referenceType'] = 'script-value';

      if (
        instruction.startsWith('ACTOR') ||
        instruction.startsWith('LOC_ACTOR')
      ) {
        referenceType = 'actor';
      } else if (instruction.includes('ITEM')) {
        referenceType = 'item';
      } else if (instruction.startsWith('LOC_POS')) {
        referenceType = 'level';
      } else if (instruction.includes('EOBJ')) {
        referenceType = 'event-object';
      } else if (instruction.includes('ACTION')) {
        referenceType = 'action';
      }

      return {
        instruction,
        argument,
        referenceType,
      };
    })
    .filter((value): value is ScriptParameter => value !== undefined);
}

function parseRewardItems(
  rewardValues: unknown,
  countValues: unknown,
  hqValues?: unknown,
  stainValues?: unknown,
  choiceGroup?: number,
): ParsedItemReward[] {
  const rewards = asArray(rewardValues);
  const counts = asArray(countValues);
  const hqFlags = asArray(hqValues);
  const stains = asArray(stainValues);

  const parsedRewards: ParsedItemReward[] = [];

  rewards.forEach((reward, index) => {
    const rowId = relationRowId(reward);

    if (rowId === undefined) {
      return;
    }

    const itemName = relationName(reward) ?? `Unresolved item ${rowId}`;

    const quantity = readInteger(counts[index]) ?? 1;

    const parsedReward: ParsedItemReward = {
      itemId: `item-${rowId}`,
      itemName,
      quantity,
    };

    const isHighQuality = readBoolean(hqFlags[index]);

    if (isHighQuality !== undefined) {
      parsedReward.quality = isHighQuality ? 'high-quality' : 'normal';
    }

    if (choiceGroup !== undefined) {
      parsedReward.choiceGroup = choiceGroup;
    }

    const stainRowId = relationRowId(stains[index]);

    if (stainRowId !== undefined) {
      parsedReward.stainId = `stain-${stainRowId}`;
    }

    const stainName = relationName(stains[index]);

    if (stainName !== undefined) {
      parsedReward.stainName = stainName;
    }

    const rewardIconId = iconId(relationFields(reward)?.Icon);

    if (rewardIconId !== undefined) {
      parsedReward.iconId = rewardIconId;
    }

    parsedRewards.push(parsedReward);
  });

  return parsedRewards;
}

function createCanonicalRewardItem(item: ParsedItemReward): JsonObject {
  const canonicalItem: JsonObject = {
    itemId: item.itemId,
    itemName: item.itemName,
    quantity: item.quantity,
  };

  if (item.quality !== undefined) {
    canonicalItem.quality = item.quality;
  }

  if (item.choiceGroup !== undefined) {
    canonicalItem.choiceGroup = item.choiceGroup;
  }

  if (item.stainId !== undefined) {
    canonicalItem.stainId = item.stainId;
  }

  const extensions: JsonObject = {};

  if (item.stainName !== undefined) {
    extensions.stainName = item.stainName;
  }

  if (item.iconId !== undefined) {
    extensions.iconId = item.iconId;
  }

  if (Object.keys(extensions).length > 0) {
    canonicalItem.extensions = extensions;
  }

  return canonicalItem;
}

function parsePreviousQuests(fields: JsonObject): ParsedPreviousQuest[] {
  const previousQuests: ParsedPreviousQuest[] = [];

  for (const value of asArray(fields.PreviousQuest)) {
    const rowId = relationRowId(value);

    if (rowId === undefined) {
      continue;
    }

    const previousQuest: ParsedPreviousQuest = {
      rowId,

      name: relationName(value) ?? `Quest row ${rowId}`,
    };

    const internalId = readString(relationFields(value)?.Id);

    if (internalId !== undefined) {
      previousQuest.internalId = internalId;
    }

    previousQuests.push(previousQuest);
  }

  return previousQuests;
}

function parseObjectives(
  fields: JsonObject,
  knownActorNames: ReadonlyMap<number, string>,
): ParsedObjective[] {
  const parsedObjectives: ParsedObjective[] = [];

  const todoValues = asArray(fields.TodoParams);

  todoValues.forEach((rawTodo, todoIndex) => {
    const todo = asObject(rawTodo);

    if (!todo) {
      return;
    }

    const quantity = readInteger(todo.ToDoQty);

    const completeSequence = readInteger(todo.ToDoCompleteSeq);

    const locations: ParsedLocation[] = [];

    for (const rawLocation of asArray(todo.ToDoLocation)) {
      const location = parseLocation(rawLocation);

      if (location?.sourceLevelRowId === undefined) {
        continue;
      }

      locations.push(location);
    }

    const hasMeaningfulQuantity = quantity !== undefined && quantity > 0;

    const hasMeaningfulData = hasMeaningfulQuantity || locations.length > 0;

    if (!hasMeaningfulData) {
      return;
    }

    let firstRawLocation: JsonObject | undefined;

    for (const rawLocation of asArray(todo.ToDoLocation)) {
      const locationFields = relationFields(rawLocation);

      if (locationFields) {
        firstRawLocation = locationFields;

        break;
      }
    }

    const targetRowId = readRawOrRelationId(firstRawLocation, 'Object');

    const parsedObjective: ParsedObjective = {
      index: todoIndex + 1,
      locations,
    };

    if (hasMeaningfulQuantity) {
      parsedObjective.quantity = quantity;
    }

    if (completeSequence !== undefined && completeSequence !== 255) {
      parsedObjective.completeSequence = completeSequence;
    }

    if (targetRowId !== undefined) {
      parsedObjective.targetRowId = targetRowId;

      const targetName = knownActorNames.get(targetRowId);

      if (targetName !== undefined) {
        parsedObjective.targetName = targetName;
      }
    }

    parsedObjectives.push(parsedObjective);
  });

  return parsedObjectives;
}

function suggestCategory(
  journalGenre: string | undefined,
  classJobAbbreviation: string | undefined,
):
  | 'msq'
  | 'class'
  | 'job'
  | 'role'
  | 'crafting'
  | 'gathering'
  | 'feature'
  | 'side-story'
  | 'tribal'
  | 'relic' {
  const normalizedGenre = journalGenre?.toLowerCase() ?? '';

  if (normalizedGenre.includes('main scenario')) {
    return 'msq';
  }

  if (classJobAbbreviation && GATHERING_JOBS.has(classJobAbbreviation)) {
    return 'gathering';
  }

  if (classJobAbbreviation && CRAFTING_JOBS.has(classJobAbbreviation)) {
    return 'crafting';
  }

  if (normalizedGenre.includes('role')) {
    return 'role';
  }

  if (
    normalizedGenre.includes('tribal') ||
    normalizedGenre.includes('beast tribe')
  ) {
    return 'tribal';
  }

  if (normalizedGenre.includes('relic')) {
    return 'relic';
  }

  if (normalizedGenre.includes('job')) {
    return 'job';
  }

  if (classJobAbbreviation) {
    return 'class';
  }

  return 'side-story';
}

function cleanValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    const cleanedItems = value
      .map(cleanValue)
      .filter((item) => item !== undefined);

    return cleanedItems.length > 0 ? cleanedItems : undefined;
  }

  const object = asObject(value);

  if (object) {
    const cleanedEntries = Object.entries(object)
      .map(([key, entryValue]) => [key, cleanValue(entryValue)] as const)
      .filter(([, entryValue]) => entryValue !== undefined);

    return cleanedEntries.length > 0
      ? Object.fromEntries(cleanedEntries)
      : undefined;
  }

  return value === undefined ? undefined : value;
}

function readInputPath(): string {
  const inputIndex = process.argv.indexOf('--input');

  const rawPath = inputIndex >= 0 ? process.argv[inputIndex + 1] : undefined;

  if (!rawPath) {
    throw new Error(
      [
        'An input inspection file is required.',
        '',
        'Usage:',
        'npm run xivapi:interpret:quest -- --input scripts/xivapi/.cache/inspection/quest-65545.focused.json',
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

  const rewards = asObject(review.rewards);

  const guaranteedItems = asArray(rewards?.guaranteedItems);

  const choiceItems = asArray(rewards?.choiceItems);

  const manualChecks = asArray(review.manualChecks);

  const lines: string[] = [
    `# ${readString(identity?.name) ?? 'Unknown Quest'}`,
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
        ? `X ${readNumber(coordinates.x)}, Y ${readNumber(coordinates.y)}`
        : 'Unknown'
    }`,
    '',
    '## Chain',
    '',
  ];

  const previousQuests = asArray(chain?.previousQuests);

  if (previousQuests.length > 0) {
    for (const previousQuest of previousQuests) {
      const previous = asObject(previousQuest);

      lines.push(
        `- Previous: ${readString(previous?.name) ?? 'Unknown'} — row ${readInteger(previous?.rowId) ?? 'Unknown'}`,
      );
    }
  } else {
    lines.push('- Previous: None detected');
  }

  lines.push(
    '- Next: Requires reverse-index resolution',
    '',
    '## Rewards',
    '',
    `- Gil: ${readInteger(rewards?.gil) ?? 0}`,
    `- EXP factor: ${readInteger(rewards?.experienceFactor) ?? 'None'}`,
  );

  if (guaranteedItems.length > 0) {
    lines.push('', 'Guaranteed items:');

    for (const rawItem of guaranteedItems) {
      const item = asObject(rawItem);

      lines.push(
        `- ${readString(item?.itemName) ?? 'Unknown item'} ×${readInteger(item?.quantity) ?? 1}`,
      );
    }
  }

  if (choiceItems.length > 0) {
    lines.push('', 'Choose one:');

    for (const rawItem of choiceItems) {
      const item = asObject(rawItem);

      const stainName = readString(item?.stainName);

      lines.push(
        [
          `- ${readString(item?.itemName) ?? 'Unknown item'}`,
          `×${readInteger(item?.quantity) ?? 1}`,
          stainName ? `— ${stainName}` : '',
        ]
          .filter(Boolean)
          .join(' '),
      );
    }
  }

  lines.push('', '## Manual checks', '');

  if (manualChecks.length > 0) {
    for (const check of manualChecks) {
      lines.push(`- ${String(check)}`);
    }
  } else {
    lines.push('- None');
  }

  lines.push('');

  return lines.join('\n');
}

async function main(): Promise<void> {
  const inputPath = readInputPath();

  const rawText = await readFile(inputPath, 'utf8');

  const response = xivapiRowResponseSchema.parse(
    JSON.parse(rawText) as unknown,
  );

  const fields = response.fields as JsonObject;

  const questName = readString(fields.Name) ?? `Quest ${response.row_id}`;

  const internalId = readString(fields.Id);

  const expansion = relationName(fields.Expansion);

  const journalGenre = relationName(fields.JournalGenre);

  const classJobRelation = fields.ClassJobRequired;

  const classJobFields = relationFields(classJobRelation);

  const classJobRowId = relationRowId(classJobRelation);

  const classJobName =
    readString(classJobFields?.NameEnglish) ?? readString(classJobFields?.Name);

  const classJobAbbreviation = readString(classJobFields?.Abbreviation);

  const classJobId = classJobName ? toGameDataId(classJobName) : undefined;

  const classJobLevels = asArray(fields.ClassJobLevel);

  const questLevel =
    readInteger(classJobLevels[0]) ?? readInteger(fields.LevelMax) ?? 1;

  const suggestedCategory = suggestCategory(journalGenre, classJobAbbreviation);

  const suggestedId = [classJobId, toGameDataId(questName)]
    .filter(Boolean)
    .join('-');

  const fallbackPlaceName = relationName(fields.PlaceName);

  const startActor = parseActor(fields.IssuerStart);

  const startLocation = parseLocation(fields.IssuerLocation, fallbackPlaceName);

  const knownActorNames = new Map<number, string>();

  if (startActor?.sourceRowId && startActor.name) {
    knownActorNames.set(startActor.sourceRowId, startActor.name);
  }

  const scriptParameters = parseScriptParameters(fields);

  const objectives = parseObjectives(fields, knownActorNames);

  const previousQuests = parsePreviousQuests(fields);

  const guaranteedItems = parseRewardItems(
    fields.Reward,
    fields.ItemCountReward,
    undefined,
    fields.RewardStain,
  );

  const choiceItems = parseRewardItems(
    fields.OptionalItemReward,
    fields.OptionalItemCountReward,
    fields.OptionalItemIsHQReward,
    fields.OptionalItemStainReward,
    1,
  );

  const requiredItemReferences = scriptParameters
    .filter(
      (parameter) =>
        parameter.referenceType === 'item' && parameter.argument > 0,
    )
    .map((parameter) => ({
      sourceInstruction: parameter.instruction,

      itemRowId: parameter.argument,
      itemId: `item-${parameter.argument}`,

      itemName: undefined,
      quantity: undefined,
    }));

  const unresolvedActorReferences = scriptParameters
    .filter(
      (parameter) =>
        parameter.referenceType === 'actor' &&
        parameter.argument > 0 &&
        !knownActorNames.has(parameter.argument),
    )
    .map((parameter) => ({
      sourceInstruction: parameter.instruction,

      actorRowId: parameter.argument,
    }));

  const experienceFactor = readInteger(fields.ExpFactor);

  const gil = readInteger(fields.GilReward);

  const isRepeatable = readBoolean(fields.IsRepeatable) ?? false;

  const classJobRequirement =
    classJobId && classJobName
      ? {
          type: 'class-job-level',
          classJobId,
          classJobName,
          level: questLevel,
        }
      : undefined;

  const canonicalObjectives = objectives.map((objective) => ({
    id: `${suggestedId}-objective-${objective.index}`,

    sortOrder: objective.index,
    type: 'unknown',

    quantity: objective.quantity,

    targetId:
      objective.targetRowId !== undefined
        ? `actor-${objective.targetRowId}`
        : undefined,

    targetName: objective.targetName,

    locations: objective.locations.map((location) => ({
      zoneId: location.zoneId,
      zoneName: location.zoneName,

      territoryId: location.territoryId,

      mapId: location.mapId,

      sourceLevelRowId: location.sourceLevelRowId,

      coordinates: location.coordinates,

      extensions: {
        rawCoordinates: location.rawCoordinates,
        mapGameId: location.mapGameId,
      },
    })),

    notes: 'Objective text is not available from the parsed Quest row.',

    sourceData: {
      todoIndex: objective.index,
      completeSequence: objective.completeSequence,
    },
  }));

  const start = startActor?.name
    ? {
        npcId: startActor.id,
        npcName: startActor.name,

        sourceRowId: startActor.sourceRowId,

        zoneId: startLocation?.zoneId,

        zoneName: startLocation?.zoneName,

        territoryId: startLocation?.territoryId,

        mapId: startLocation?.mapId,

        coordinates: startLocation?.coordinates,

        extensions: {
          title: startActor.title,

          sourceLevelRowId: startLocation?.sourceLevelRowId,

          rawCoordinates: startLocation?.rawCoordinates,

          mapGameId: startLocation?.mapGameId,
        },
      }
    : undefined;

  const rewards =
    experienceFactor !== undefined ||
    gil !== undefined ||
    guaranteedItems.length > 0 ||
    choiceItems.length > 0
      ? {
          experienceFactor,
          gil,

          items: guaranteedItems.map(createCanonicalRewardItem),

          optionalItems: choiceItems.map(createCanonicalRewardItem),
        }
      : undefined;

  const manualChecks: string[] = [
    'Assign the quest to the correct manifest collection and patch.',
    'Review the suggested category and generated app ID.',
    'Resolve the next quest using a reverse index across all Quest rows.',
    'Review objective text manually; TodoParams provide structure and locations but not player-facing objective text.',
  ];

  if (experienceFactor !== undefined && experienceFactor > 0) {
    manualChecks.push(
      `Resolve the actual EXP reward. ExpFactor ${experienceFactor} is not the final experience amount.`,
    );
  }

  if (requiredItemReferences.length > 0) {
    manualChecks.push(
      'Resolve required item names and quantities from script references or another source.',
    );
  }

  if (unresolvedActorReferences.length > 0) {
    manualChecks.push('Resolve actor references found in QuestParams.');
  }

  if (choiceItems.length > 0) {
    manualChecks.push(
      'Confirm that all OptionalItemReward entries belong to one choose-one reward group.',
    );
  }

  if (startLocation?.zoneName === undefined) {
    manualChecks.push('Resolve the precise starting zone name.');
  }

  const questDraft = cleanValue({
    id: suggestedId,
    name: questName,
    level: questLevel,

    externalIds: {
      'xivapi-quest-row': response.row_id,

      'ffxiv-quest-id': internalId,
    },

    sources: [
      {
        provider: 'xivapi',
        sheet: 'Quest',
        rowId: response.row_id,

        gameVersion: response.version,

        schema: response.schema,
        language: 'en',

        importedAt: new Date().toISOString(),
      },
    ],

    start,

    availability: classJobId
      ? {
          classJobIds: [classJobId],
        }
      : undefined,

    repeatability: isRepeatable
      ? {
          type: 'repeatable',

          extensions: {
            repeatIntervalType: readInteger(fields.RepeatIntervalType),

            dailyQuestPool: readInteger(fields.DailyQuestPool),
          },
        }
      : undefined,

    rawRelations: {
      previousQuestRowIds: previousQuests.map((quest) => quest.rowId),

      lockedByQuestRowIds: asArray(fields.QuestLock)
        .map(relationRowId)
        .filter((rowId): rowId is number => rowId !== undefined),

      instanceContentRowIds: asArray(fields.InstanceContent)
        .map(relationRowId)
        .filter((rowId): rowId is number => rowId !== undefined),

      previousQuestJoin: readInteger(fields.PreviousQuestJoin),

      questLockJoin: readInteger(fields.QuestLockJoin),

      instanceContentJoin: readInteger(fields.InstanceContentJoin),
    },

    requirements: classJobRequirement ? [classJobRequirement] : undefined,

    objectives: canonicalObjectives,

    rewards,

    tags: ['xivapi-import'],

    extensions: {
      iconId: iconId(fields.Icon),
    },

    sourceData: {
      xivapi: {
        rowId: response.row_id,
        internalId,

        expansion,
        journalGenre,

        eventIconType: relationRowId(fields.EventIconType),

        sortKey: readInteger(fields.SortKey),

        questLevelOffset: readInteger(fields.QuestLevelOffset),

        scriptParameters,

        requiredItemReferences,

        unresolvedActorReferences,
      },
    },
  });

  const review = cleanValue({
    summaryVersion: 1,

    identity: {
      rowId: response.row_id,
      internalId,
      name: questName,
      suggestedId,

      iconId: iconId(fields.Icon),
    },

    classification: {
      expansion,
      journalGenre,

      suggestedCategory,

      level: questLevel,

      classJobId,
      classJobName,
      classJobAbbreviation,
      classJobRowId,
    },

    start: {
      actor: startActor,
      location: startLocation,
    },

    chain: {
      previousQuests,

      nextQuest: {
        status: 'requires-reverse-index',
      },
    },

    requirements: {
      classJob: classJobRequirement,

      unresolvedItems: requiredItemReferences,
    },

    objectives,

    rewards: {
      gil,
      experienceFactor,
      guaranteedItems,
      choiceItems,
    },

    flags: {
      isRepeatable,

      requiresHousing: readBoolean(fields.IsHouseRequired) ?? false,

      canCancel: readBoolean(fields.CanCancel),

      introduction: readBoolean(fields.Introduction),

      hiddenFromScenarioGuide: readBoolean(fields.HideInScenarioGuide),

      hidesOfferIcon: readBoolean(fields.HideOfferIcon),
    },

    unresolvedReferences: {
      actors: unresolvedActorReferences,

      items: requiredItemReferences,
    },

    questDraft,
    manualChecks,

    source: {
      provider: 'xivapi',
      sheet: 'Quest',

      version: response.version,
      schema: response.schema,

      inputPath,
    },
  }) as JsonObject;

  const baseName = path
    .basename(inputPath, '.json')
    .replace(/\.(focused|full)$/, '');

  const outputDirectory = path.dirname(inputPath);

  const jsonOutputPath = path.join(outputDirectory, `${baseName}.review.json`);

  const markdownOutputPath = path.join(
    outputDirectory,
    `${baseName}.review.md`,
  );

  await writeJsonFile(jsonOutputPath, review);

  await writeFile(markdownOutputPath, createMarkdown(review), 'utf8');

  console.log(createMarkdown(review));

  console.log(`JSON review: ${jsonOutputPath}`);

  console.log(`Markdown review: ${markdownOutputPath}`);
}

await main();
