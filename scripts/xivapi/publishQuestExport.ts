import { readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  questCollectionFileSchema,
  type QuestCollectionFile,
} from '../../src/modules/quests/data/questCollectionFileSchemas';
import {
  questManifestEntrySchema,
  questManifestSchema,
  type Quest,
} from '../../src/modules/quests/data/questSchemas';
import {
  questChainExportSchema,
  type QuestChainExport,
  type QuestExportEntry,
} from './questExportSchemas';
import { projectRoot, writeJsonFile } from './paths';

type RouteId = 'gridania' | 'limsa' | 'uldah';

interface TargetDefinition {
  path: string;
  sourceQuests: QuestExportEntry[];
  routeId?: RouteId;
}

interface QuestGroupRangeDefinition {
  id: string;
  title: string;

  startQuestName: string;
  endQuestName: string;

  startQuestRowId?: number;
  endQuestRowId?: number;
}

function readOption(optionName: string): string | undefined {
  const optionIndex = process.argv.indexOf(optionName);
  const value = optionIndex >= 0 ? process.argv[optionIndex + 1] : undefined;

  if (value === undefined || value.startsWith('--')) {
    return undefined;
  }

  return value;
}

function readOptions(optionName: string): string[] {
  const values: string[] = [];

  for (let index = 0; index < process.argv.length; index += 1) {
    if (process.argv[index] !== optionName) {
      continue;
    }

    const value = process.argv[index + 1];

    if (value === undefined || value.startsWith('--')) {
      throw new Error(`Missing value after ${optionName}.`);
    }

    values.push(value);
  }

  return values;
}

function readOptionalPositiveRowId(
  rawValue: string,
  optionName: string,
  groupIndex: number,
): number | undefined {
  if (rawValue.trim().length === 0) {
    return undefined;
  }

  const rowId = Number(rawValue);

  if (!Number.isInteger(rowId) || rowId <= 0) {
    throw new Error(
      [
        `${optionName} for quest group`,
        `${groupIndex + 1} must be empty`,
        'or a positive integer.',
      ].join(' '),
    );
  }

  return rowId;
}

function requireOption(optionName: string): string {
  const value = readOption(optionName);

  if (!value) {
    throw new Error(`Missing required option: ${optionName}`);
  }

  return value;
}

function readNonNegativeIntegerOption(optionName: string): number | undefined {
  const rawValue = readOption(optionName);

  if (rawValue === undefined) {
    return undefined;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(
      `${optionName} must be a non-negative integer, received "${rawValue}".`,
    );
  }

  return value;
}

function readQuestGroupRangeDefinitions(): QuestGroupRangeDefinition[] {
  const ids = readOptions('--quest-group-id');

  const titles = readOptions('--quest-group-title');

  const startQuestNames = readOptions('--quest-group-start');

  const endQuestNames = readOptions('--quest-group-end');

  const startQuestRows = readOptions('--quest-group-start-row');

  const endQuestRows = readOptions('--quest-group-end-row');

  const requiredOptionCounts = [
    ids.length,
    titles.length,
    startQuestNames.length,
    endQuestNames.length,
  ];

  if (requiredOptionCounts.every((count) => count === 0)) {
    return [];
  }

  if (requiredOptionCounts.some((count) => count !== ids.length)) {
    throw new Error(
      [
        'Every named quest group requires one each of:',
        '--quest-group-id,',
        '--quest-group-title,',
        '--quest-group-start, and',
        '--quest-group-end.',
      ].join(' '),
    );
  }

  for (const [optionName, optionValues] of [
    ['--quest-group-start-row', startQuestRows],
    ['--quest-group-end-row', endQuestRows],
  ] as const) {
    if (optionValues.length !== 0 && optionValues.length !== ids.length) {
      throw new Error(
        [
          `${optionName} must either be omitted`,
          'or supplied once for every group.',
        ].join(' '),
      );
    }
  }

  return ids.map((id, index) => {
    const title = titles[index];

    const startQuestName = startQuestNames[index];

    const endQuestName = endQuestNames[index];

    if (
      !id?.trim() ||
      !title?.trim() ||
      !startQuestName?.trim() ||
      !endQuestName?.trim()
    ) {
      throw new Error(
        `Quest group ${index + 1} contains an empty required value.`,
      );
    }

    return {
      id,
      title,
      startQuestName,
      endQuestName,

      startQuestRowId:
        startQuestRows.length > 0
          ? readOptionalPositiveRowId(
              startQuestRows[index] ?? '',
              '--quest-group-start-row',
              index,
            )
          : undefined,

      endQuestRowId:
        endQuestRows.length > 0
          ? readOptionalPositiveRowId(
              endQuestRows[index] ?? '',
              '--quest-group-end-row',
              index,
            )
          : undefined,
    };
  });
}

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en-US')
    .replace(/[’']/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function readJson(filePath: string): Promise<unknown> {
  return JSON.parse(await readFile(filePath, 'utf8')) as unknown;
}

function routeQuestId(questId: string, routeId: RouteId): string {
  if (questId === 'arr-msq-call-of-the-sea') {
    return `arr-msq-${routeId}-call-of-the-sea`;
  }

  if (questId === 'arr-msq-call-of-the-sea-uldah') {
    return 'arr-msq-uldah-call-of-the-sea';
  }

  return questId;
}

function mapRelationIds(questId: string, routeId?: RouteId): string[] {
  if (routeId) {
    return [routeQuestId(questId, routeId)];
  }

  if (questId === 'arr-msq-call-of-the-sea') {
    return [
      'arr-msq-gridania-call-of-the-sea',
      'arr-msq-limsa-call-of-the-sea',
    ];
  }

  if (questId === 'arr-msq-call-of-the-sea-uldah') {
    return ['arr-msq-uldah-call-of-the-sea'];
  }

  return [questId];
}

function collectRouteQuests(
  exportData: QuestChainExport,
  startQuestId: string,
  stopQuestId: string,
): QuestExportEntry[] {
  const questsById = new Map(
    exportData.quests.map((quest) => [quest.id, quest]),
  );
  const collectedIds = new Set<string>();
  const pendingIds = [startQuestId];

  while (pendingIds.length > 0) {
    const questId = pendingIds.pop();

    if (!questId || questId === stopQuestId || collectedIds.has(questId)) {
      continue;
    }

    const quest = questsById.get(questId);

    if (!quest) {
      throw new Error(`Missing route quest ${questId}.`);
    }

    collectedIds.add(questId);
    pendingIds.push(...quest.nextQuestIds);
  }

  return exportData.quests.filter((quest) => collectedIds.has(quest.id));
}

function convertRequirements(
  quest: QuestExportEntry,
): NonNullable<Quest['requirements']> {
  const requirements: NonNullable<Quest['requirements']> = [];

  for (const requirement of quest.requirements) {
    switch (requirement.type) {
      case 'level':
      case 'quest':
        break;

      case 'class-job':
        if (requirement.level) {
          requirements.push({
            type: 'class-job-level',
            classJobId: requirement.classJobId,
            classJobName: requirement.classJobName,
            level: requirement.level,
          });
        }
        break;

      case 'item':
        if (requirement.quantity === null) {
          throw new Error(`${quest.id} has an unresolved item quantity.`);
        }

        requirements.push({
          type: 'item',
          itemId: requirement.itemId,
          itemName: requirement.itemName,
          quantity: requirement.quantity,
          quality: requirement.quality ?? 'normal',
        });
        break;

      case 'feature':
        requirements.push({
          type: 'feature',
          featureId: requirement.id,
          name: requirement.name,
        });
        break;
    }
  }

  return requirements;
}

function convertQuest(
  quest: QuestExportEntry,
  exportData: QuestChainExport,
  routeId?: RouteId,
  routeSourceIds?: ReadonlySet<string>,
) {
  const npc = quest.start.npc;
  const location = quest.start.location;

  if (!npc?.name) {
    throw new Error(`${quest.id} has no start NPC.`);
  }

  const requirements = convertRequirements(quest);
  const rewardItems = quest.rewards.items.map((item) => {
    if (item.quantity === null) {
      throw new Error(`${quest.id} has an unresolved reward quantity.`);
    }

    return {
      itemId: item.itemId,
      itemName: item.itemName,
      quantity: item.quantity,
      quality: item.quality,
      stainId: item.stainId,
      notes: item.stainName ? `Stain: ${item.stainName}` : undefined,
    };
  });
  const optionalItems = quest.rewards.choices.map((item) => {
    if (item.quantity === null) {
      throw new Error(`${quest.id} has an unresolved reward-choice quantity.`);
    }

    return {
      itemId: item.itemId,
      itemName: item.itemName,
      quantity: item.quantity,
      quality: item.quality,
      choiceGroup: 1,
      stainId: item.stainId,
      notes: item.stainName ? `Stain: ${item.stainName}` : undefined,
    };
  });
  const prerequisiteQuestIds = quest.previousQuestIds
    .filter((id) => !routeSourceIds || routeSourceIds.has(id))
    .flatMap((id) => mapRelationIds(id, routeId));
  const nextQuestIds = quest.nextQuestIds.flatMap((id) =>
    mapRelationIds(id, routeId),
  );

  return {
    id: routeId ? routeQuestId(quest.id, routeId) : quest.id,
    name: quest.name,
    level: quest.level,
    sortOrder: quest.sortOrder,

    isFeatureQuest: quest.isFeatureQuest,
    isRepeatable: quest.isRepeatable,
    isSeasonalQuest: quest.isSeasonalQuest,

    alternativeCompletionGroupId: quest.alternativeCompletionGroupId,

    externalIds: {
      'xivapi-quest-row': quest.xivapiRowId,
    },
    sources:
      quest.sources.length > 0
        ? quest.sources
        : [
            {
              provider: 'xivapi',
              sheet: 'Quest',
              rowId: quest.xivapiRowId,
              gameVersion: exportData.source.version,
              schema: exportData.source.schema,
              language: 'en' as const,
              importedAt: exportData.generatedAt,
            },
          ],
    start: {
      npcId: npc.xivapiRowId ? `enpc-${npc.xivapiRowId}` : undefined,
      npcName: npc.name,
      sourceRowId: npc.xivapiRowId,
      zoneId: location?.zone ? slugify(location.zone) : undefined,
      zoneName: location?.zone ?? undefined,
      coordinates:
        location?.x !== null &&
        location?.x !== undefined &&
        location.y !== null &&
        location.y !== undefined
          ? { x: location.x, y: location.y }
          : undefined,
    },
    availability: quest.availability ?? undefined,
    repeatability: quest.repeatability,
    prerequisiteQuestMode:
      prerequisiteQuestIds.length < 2 ? 'all' : quest.previousQuestMode,

    /*
     * Published XIVAPI exports carry authoritative graph relationships.
     *
     * Empty arrays must be retained so the linear collection loader does not
     * manufacture sequential links between unrelated or alternative quests.
     */
    prerequisiteQuestIds,
    nextQuestIds,
    rawRelations: quest.rawRelations,
    requirements: requirements.length > 0 ? requirements : undefined,
    questItems: quest.questItems.length > 0 ? quest.questItems : undefined,
    objectives: quest.objectives.length > 0 ? quest.objectives : undefined,
    rewards: {
      experience: quest.rewards.experience ?? undefined,
      gil: quest.rewards.gil ?? undefined,
      items: rewardItems.length > 0 ? rewardItems : undefined,
      optionalItems: optionalItems.length > 0 ? optionalItems : undefined,
    },
    duties:
      quest.duties.length > 0
        ? quest.duties.map((duty) => ({
            id: duty.id,

            sourceRowId: duty.sourceRowId,

            name: duty.name,

            type: duty.type,

            relationship: duty.relationship,

            level: duty.level,

            minimumItemLevel: duty.minimumItemLevel,

            partySize: duty.partySize,

            levelSync: duty.levelSync,

            extensions: duty.contentRowId
              ? {
                  'xivapi-instance-content-row': duty.contentRowId,

                  'xivapi-high-end-duty': duty.highEnd,
                }
              : undefined,
          }))
        : undefined,
    unlocks:
      quest.unlocks.length > 0
        ? quest.unlocks.map((unlock) => ({
            type: unlock.type,
            targetId: unlock.id,
            sourceRowId: unlock.sourceRowId,
            name: unlock.name,
            notes: unlock.details,
          }))
        : undefined,
    tags: ['xivapi-import'],
    lastVerifiedAt: exportData.generatedAt,
    sourceData: quest.sourceData,
  };
}

function fillGroups(
  collection: QuestCollectionFile,
  quests: ReturnType<typeof convertQuest>[],
): QuestCollectionFile {
  const groups = collection.groups.map((group) => ({
    ...group,
    quests: [] as typeof quests,
  }));

  for (const quest of quests) {
    const group = groups.find(
      (candidate) =>
        !candidate.levelRange ||
        (quest.level >= candidate.levelRange.minimum &&
          quest.level <= candidate.levelRange.maximum),
    );

    if (!group) {
      throw new Error(
        `No target group accepts ${quest.id} at level ${quest.level}.`,
      );
    }

    group.quests.push(quest);
  }

  if (!('format' in collection)) {
    return questCollectionFileSchema.parse({
      ...collection,
      groups,
    });
  }

  const publishedQuestIds = new Set(quests.map((quest) => quest.id));

  const startsAfterQuestIds = Array.from(
    new Set(
      quests.flatMap((quest) =>
        (quest.prerequisiteQuestIds ?? []).filter(
          (questId) => !publishedQuestIds.has(questId),
        ),
      ),
    ),
  );

  const continuesToQuestIds = Array.from(
    new Set(
      quests.flatMap((quest) =>
        (quest.nextQuestIds ?? []).filter(
          (questId) => !publishedQuestIds.has(questId),
        ),
      ),
    ),
  );

  return questCollectionFileSchema.parse({
    ...collection,

    startsAfterQuestIds:
      startsAfterQuestIds.length > 0 ? startsAfterQuestIds : undefined,

    continuesToQuestIds:
      continuesToQuestIds.length > 0 ? continuesToQuestIds : undefined,

    groups,
  });
}

function normalizeQuestName(value: string): string {
  return value
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/\s+/g, ' ');
}

function resolveQuestBoundaryIndex(
  quests: readonly QuestExportEntry[],
  questName: string,
  questRowId: number | undefined,
  groupTitle: string,
  boundaryName: 'start' | 'end',
): number {
  const normalizedQuestName = normalizeQuestName(questName);

  const candidateIndices = quests.flatMap((quest, index) => {
    if (normalizeQuestName(quest.name) !== normalizedQuestName) {
      return [];
    }

    if (questRowId !== undefined && quest.xivapiRowId !== questRowId) {
      return [];
    }

    return [index];
  });

  if (candidateIndices.length === 0) {
    throw new Error(
      [
        `Group "${groupTitle}" has an unknown`,
        `${boundaryName} quest "${questName}".`,
        questRowId !== undefined ? `Requested Quest row: ${questRowId}.` : '',
      ]
        .filter(Boolean)
        .join(' '),
    );
  }

  if (candidateIndices.length > 1) {
    throw new Error(
      [
        `Group "${groupTitle}" has an ambiguous`,
        `${boundaryName} quest "${questName}".`,
        `Supply its XIVAPI row through`,
        `--quest-group-${boundaryName}-row.`,
      ].join(' '),
    );
  }

  const candidateIndex = candidateIndices[0];

  if (candidateIndex === undefined) {
    throw new Error(`Could not resolve group "${groupTitle}".`);
  }

  return candidateIndex;
}

type ConvertedQuest = ReturnType<typeof convertQuest>;

interface PublishedQuestGroup {
  id: string;
  title: string;
  sortOrder: number;
  quests: ConvertedQuest[];
}

function findConnectedQuestComponents(
  quests: readonly QuestExportEntry[],
): QuestExportEntry[][] {
  const questsById = new Map(quests.map((quest) => [quest.id, quest]));

  const adjacencyByQuestId = new Map<string, Set<string>>();

  for (const quest of quests) {
    adjacencyByQuestId.set(quest.id, new Set());
  }

  for (const quest of quests) {
    const relatedQuestIds = [...quest.previousQuestIds, ...quest.nextQuestIds];

    for (const relatedQuestId of relatedQuestIds) {
      if (!questsById.has(relatedQuestId)) {
        continue;
      }

      adjacencyByQuestId.get(quest.id)?.add(relatedQuestId);
      adjacencyByQuestId.get(relatedQuestId)?.add(quest.id);
    }
  }

  const visitedQuestIds = new Set<string>();
  const components: QuestExportEntry[][] = [];

  for (const quest of quests) {
    if (visitedQuestIds.has(quest.id)) {
      continue;
    }

    const component: QuestExportEntry[] = [];
    const pendingQuestIds = [quest.id];

    while (pendingQuestIds.length > 0) {
      const questId = pendingQuestIds.pop();

      if (!questId || visitedQuestIds.has(questId)) {
        continue;
      }

      visitedQuestIds.add(questId);

      const componentQuest = questsById.get(questId);

      if (!componentQuest) {
        continue;
      }

      component.push(componentQuest);

      for (const relatedQuestId of adjacencyByQuestId.get(questId) ?? []) {
        if (!visitedQuestIds.has(relatedQuestId)) {
          pendingQuestIds.push(relatedQuestId);
        }
      }
    }

    component.sort((left, right) => left.sortOrder - right.sortOrder);

    components.push(component);
  }

  components.sort(
    (left, right) => (left[0]?.sortOrder ?? 0) - (right[0]?.sortOrder ?? 0),
  );

  return components;
}

function createAutomaticQuestGroups(
  sourceQuests: readonly QuestExportEntry[],
  convertedQuests: readonly ConvertedQuest[],
  fallbackGroupId: string,
  fallbackGroupTitle: string,
  collectionFormat: 'linear' | 'standard',
): PublishedQuestGroup[] {
  const components = findConnectedQuestComponents(sourceQuests);

  if (components.length === 0) {
    throw new Error('No quest components were available for grouping.');
  }

  if (collectionFormat === 'linear' && components.length > 1) {
    throw new Error(
      [
        'A linear collection must contain one connected questline.',
        `The filtered export contains ${components.length} disconnected questlines.`,
        'Use COLLECTION_FORMAT="standard" or narrow the filters.',
      ].join(' '),
    );
  }

  if (components.length === 1) {
    return [
      {
        id: fallbackGroupId,
        title: fallbackGroupTitle,
        sortOrder: 1,
        quests: [...convertedQuests],
      },
    ];
  }

  const convertedQuestsById = new Map(
    convertedQuests.map((quest) => [quest.id, quest]),
  );

  const groups: PublishedQuestGroup[] = [];
  const standaloneQuests: ConvertedQuest[] = [];

  for (const component of components) {
    if (component.length === 1) {
      const sourceQuest = component[0];

      if (!sourceQuest) {
        continue;
      }

      const convertedQuest = convertedQuestsById.get(sourceQuest.id);

      if (!convertedQuest) {
        throw new Error(`Could not find converted quest "${sourceQuest.id}".`);
      }

      standaloneQuests.push(convertedQuest);
      continue;
    }

    const componentQuestIds = new Set(component.map((quest) => quest.id));

    const rootQuest =
      component.find((quest) =>
        quest.previousQuestIds.every(
          (previousQuestId) => !componentQuestIds.has(previousQuestId),
        ),
      ) ?? component[0];

    if (!rootQuest) {
      throw new Error('A connected quest component has no quests.');
    }

    const componentQuests = component.map((quest) => {
      const convertedQuest = convertedQuestsById.get(quest.id);

      if (!convertedQuest) {
        throw new Error(`Could not find converted quest "${quest.id}".`);
      }

      return convertedQuest;
    });

    groups.push({
      id: slugify(`${fallbackGroupId}-${rootQuest.id}`),
      title: `${rootQuest.name} Questline`,
      sortOrder: groups.length + 1,
      quests: componentQuests,
    });
  }

  if (standaloneQuests.length > 0) {
    groups.push({
      id: slugify(`${fallbackGroupId}-standalone`),
      title: 'Standalone Quests',
      sortOrder: groups.length + 1,
      quests: standaloneQuests,
    });
  }

  return groups;
}

function createQuestGroups(
  sourceQuests: readonly QuestExportEntry[],
  convertedQuests: readonly ConvertedQuest[],
  definitions: readonly QuestGroupRangeDefinition[],
  fallbackGroupId: string,
  fallbackGroupTitle: string,
  automaticGroups: boolean,
  collectionFormat: 'linear' | 'standard',
): PublishedQuestGroup[] {
  if (definitions.length === 0) {
    if (automaticGroups) {
      return createAutomaticQuestGroups(
        sourceQuests,
        convertedQuests,
        fallbackGroupId,
        fallbackGroupTitle,
        collectionFormat,
      );
    }

    return [
      {
        id: fallbackGroupId,
        title: fallbackGroupTitle,
        sortOrder: 1,
        quests: [...convertedQuests],
      },
    ];
  }

  const groups: PublishedQuestGroup[] = [];

  const usedGroupIds = new Set<string>();

  let expectedStartIndex = 0;

  for (
    let definitionIndex = 0;
    definitionIndex < definitions.length;
    definitionIndex += 1
  ) {
    const definition = definitions[definitionIndex];

    if (!definition) {
      continue;
    }

    const groupId = slugify(definition.id);

    if (usedGroupIds.has(groupId)) {
      throw new Error(`Duplicate quest group ID: ${groupId}.`);
    }

    usedGroupIds.add(groupId);

    const startIndex = resolveQuestBoundaryIndex(
      sourceQuests,
      definition.startQuestName,
      definition.startQuestRowId,
      definition.title,
      'start',
    );

    const endIndex = resolveQuestBoundaryIndex(
      sourceQuests,
      definition.endQuestName,
      definition.endQuestRowId,
      definition.title,
      'end',
    );

    if (endIndex < startIndex) {
      throw new Error(
        [
          `Group "${definition.title}" ends`,
          'before it starts in export order.',
        ].join(' '),
      );
    }

    if (startIndex !== expectedStartIndex) {
      const expectedQuest = sourceQuests[expectedStartIndex];

      throw new Error(
        [
          `Group "${definition.title}" does not`,
          'begin with the next ungrouped quest.',
          expectedQuest
            ? `Expected "${expectedQuest.name}".`
            : 'All quests were already grouped.',
        ].join(' '),
      );
    }

    groups.push({
      id: groupId,
      title: definition.title,
      sortOrder: definitionIndex + 1,

      quests: convertedQuests.slice(startIndex, endIndex + 1),
    });

    expectedStartIndex = endIndex + 1;
  }

  if (expectedStartIndex !== sourceQuests.length) {
    const firstUngroupedQuest = sourceQuests[expectedStartIndex];

    throw new Error(
      [
        'The named quest groups do not cover',
        'the complete export.',
        firstUngroupedQuest
          ? `First ungrouped quest: "${firstUngroupedQuest.name}".`
          : '',
      ]
        .filter(Boolean)
        .join(' '),
    );
  }

  return groups;
}

async function publishGenericCollection(
  exportData: QuestChainExport,
  rawOutputPath: string,
  shouldWrite: boolean,
): Promise<void> {
  const collectionId = slugify(readOption('--collection-id') ?? exportData.id);

  const collectionTitle = readOption('--collection-title') ?? exportData.title;

  const collectionDescription =
    readOption('--collection-description') ??
    `${collectionTitle} quests imported from XIVAPI.`;

  const requestedCollectionSortOrder =
    readNonNegativeIntegerOption('--sort-order');

  const groupId = slugify(readOption('--group-id') ?? `${collectionId}-quests`);

  const groupTitle = readOption('--group-title') ?? collectionTitle;

  const questGroupDefinitions = readQuestGroupRangeDefinitions();

  const verificationStatus = readOption('--verification-status') ?? 'in-review';

  const collectionFormat = readOption('--format') ?? 'linear';

  if (collectionFormat !== 'linear' && collectionFormat !== 'standard') {
    throw new Error('"--format" must be either "linear" or "standard".');
  }

  const automaticGroups = process.argv.includes('--auto-groups');

  const primaryFacetId = readOption('--primary-facet-id');
  const primaryFacetName = readOption('--primary-facet-name');

  const secondaryFacetId = readOption('--secondary-facet-id');
  const secondaryFacetName = readOption('--secondary-facet-name');

  const facetValues = [
    primaryFacetId,
    primaryFacetName,
    secondaryFacetId,
    secondaryFacetName,
  ];

  const suppliedFacetCount = facetValues.filter(
    (value) => value !== undefined,
  ).length;

  if (suppliedFacetCount !== 0 && suppliedFacetCount !== 4) {
    throw new Error(
      [
        'Collection facets require all four options:',
        '--primary-facet-id, --primary-facet-name,',
        '--secondary-facet-id, and --secondary-facet-name.',
      ].join(' '),
    );
  }

  const filterFacets =
    primaryFacetId && primaryFacetName && secondaryFacetId && secondaryFacetName
      ? {
          primary: {
            id: slugify(primaryFacetId),
            name: primaryFacetName,
          },
          secondary: {
            id: slugify(secondaryFacetId),
            name: secondaryFacetName,
          },
        }
      : undefined;

  if (exportData.category !== 'msq' && !filterFacets) {
    throw new Error(
      'Non-MSQ collections require primary and secondary filter facets.',
    );
  }

  const outputPath = path.resolve(projectRoot, rawOutputPath);

  const questDataRoot = path.join(projectRoot, 'public', 'data', 'quests');

  const relativeQuestDataPath = path.relative(questDataRoot, outputPath);

  if (
    relativeQuestDataPath.startsWith('..') ||
    path.isAbsolute(relativeQuestDataPath)
  ) {
    throw new Error('--output must point somewhere inside public/data/quests.');
  }

  const publicRoot = path.join(projectRoot, 'public');

  const manifestCollectionPath = path
    .relative(publicRoot, outputPath)
    .split(path.sep)
    .join('/');

  const quests = exportData.quests.map((quest) =>
    convertQuest(quest, exportData),
  );

  const groups = createQuestGroups(
    exportData.quests,
    quests,
    questGroupDefinitions,
    groupId,
    groupTitle,
    automaticGroups,
    collectionFormat,
  );

  const publishedQuestIds = new Set(quests.map((quest) => quest.id));

  const startsAfterQuestIds = Array.from(
    new Set(
      quests.flatMap((quest) =>
        (quest.prerequisiteQuestIds ?? []).filter(
          (questId) => !publishedQuestIds.has(questId),
        ),
      ),
    ),
  );

  const continuesToQuestIds = Array.from(
    new Set(
      quests.flatMap((quest) =>
        (quest.nextQuestIds ?? []).filter(
          (questId) => !publishedQuestIds.has(questId),
        ),
      ),
    ),
  );

  const collection = questCollectionFileSchema.parse(
    collectionFormat === 'linear'
      ? {
          schemaVersion: 1,
          format: 'linear',

          startsAfterQuestIds:
            startsAfterQuestIds.length > 0 ? startsAfterQuestIds : undefined,

          continuesToQuestIds:
            continuesToQuestIds.length > 0 ? continuesToQuestIds : undefined,

          groups,
        }
      : {
          schemaVersion: 1,
          groups,
        },
  );

  const manifestPath = path.join(questDataRoot, 'manifest.json');

  const manifest = questManifestSchema.parse(await readJson(manifestPath));

  const existingManifestEntry = manifest.collections.find(
    (entry) => entry.id === collectionId,
  );

  const nextAvailableSortOrder =
    manifest.collections.reduce(
      (highestSortOrder, entry) => Math.max(highestSortOrder, entry.sortOrder),
      -10,
    ) + 10;

  const collectionSortOrder =
    requestedCollectionSortOrder ??
    existingManifestEntry?.sortOrder ??
    Math.max(nextAvailableSortOrder, 0);

  const manifestEntry = questManifestEntrySchema.parse({
    id: collectionId,
    title: collectionTitle,
    description: collectionDescription,

    category: exportData.category,
    expansionId: exportData.expansionId,
    patch: exportData.patch,

    filterFacets,

    sortOrder: collectionSortOrder,
    verificationStatus,

    path: manifestCollectionPath,
    enabled: true,
  });

  const pathConflict = manifest.collections.find(
    (entry) =>
      entry.path === manifestEntry.path && entry.id !== manifestEntry.id,
  );

  if (pathConflict) {
    throw new Error(
      [
        `Manifest path "${manifestEntry.path}" is already used by`,
        `collection "${pathConflict.id}".`,
      ].join(' '),
    );
  }

  const existingEntryIndex = manifest.collections.findIndex(
    (entry) => entry.id === manifestEntry.id,
  );

  const collections =
    existingEntryIndex >= 0
      ? manifest.collections.map((entry, index) =>
          index === existingEntryIndex ? manifestEntry : entry,
        )
      : [...manifest.collections, manifestEntry];

  collections.sort(
    (left, right) =>
      left.sortOrder - right.sortOrder || left.id.localeCompare(right.id),
  );

  const updatedManifest = questManifestSchema.parse({
    ...manifest,
    collections,
  });

  console.log(`Quest groups: ${groups.length}`);

  for (const group of groups) {
    console.log(`  ${group.title}: ${group.quests.length} quests`);
  }
  console.log(
    existingEntryIndex >= 0
      ? `Updated manifest collection: ${collectionId}`
      : `Added manifest collection: ${collectionId}`,
  );

  if (shouldWrite) {
    await writeJsonFile(outputPath, collection);
    await writeJsonFile(manifestPath, updatedManifest);

    console.log('Collection and manifest updated.');
  } else {
    console.log('Dry run only; no files changed.');
  }
}

async function main(): Promise<void> {
  const inputPath = path.resolve(projectRoot, requireOption('--file'));
  const shouldWrite = process.argv.includes('--write');
  const exportData = questChainExportSchema.parse(await readJson(inputPath));

  if (
    exportData.issues.length > 0 ||
    exportData.summary.unresolvedIssueCount > 0
  ) {
    throw new Error('The export is not complete.');
  }

  const genericOutputPath = readOption('--output');

  if (genericOutputPath) {
    await publishGenericCollection(exportData, genericOutputPath, shouldWrite);

    return;
  }

  if (
    exportData.expansionId !== 'arr' ||
    exportData.patch !== '2.0' ||
    exportData.category !== 'msq'
  ) {
    throw new Error(
      'This publisher currently supports only the ARR 2.0 MSQ export.',
    );
  }

  const sharedStartId = 'arr-msq-its-probably-pirates';
  const routeDefinitions: Array<{
    routeId: RouteId;
    startId: string;
    path: string;
  }> = [
    {
      routeId: 'gridania',
      startId: 'arr-msq-close-to-home-gridania',
      path: 'public/data/quests/msq/2.arr/2.0/0.1.gridania-opening.json',
    },
    {
      routeId: 'limsa',
      startId: 'arr-msq-close-to-home-limsa',
      path: 'public/data/quests/msq/2.arr/2.0/0.2.limsa-opening.json',
    },
    {
      routeId: 'uldah',
      startId: 'arr-msq-close-to-home-uldah',
      path: 'public/data/quests/msq/2.arr/2.0/0.3.uldah-opening.json',
    },
  ];
  const openingSourceIds = new Set<string>();
  const targets: TargetDefinition[] = routeDefinitions.map((definition) => {
    const sourceQuests = collectRouteQuests(
      exportData,
      definition.startId,
      sharedStartId,
    );
    sourceQuests.forEach((quest) => openingSourceIds.add(quest.id));
    return { path: definition.path, routeId: definition.routeId, sourceQuests };
  });
  const sharedQuests = exportData.quests.filter(
    (quest) => !openingSourceIds.has(quest.id),
  );
  const sharedDefinitions = [
    {
      path: 'public/data/quests/msq/2.arr/2.0/1.levels-15-20.json',
      minimum: 15,
      maximum: 20,
    },
    {
      path: 'public/data/quests/msq/2.arr/2.0/2.levels-21-30.json',
      minimum: 21,
      maximum: 30,
    },
    {
      path: 'public/data/quests/msq/2.arr/2.0/3.levels-31-40.json',
      minimum: 31,
      maximum: 40,
    },
    {
      path: 'public/data/quests/msq/2.arr/2.0/4.levels-41-50.json',
      minimum: 41,
      maximum: 50,
    },
  ];

  for (const definition of sharedDefinitions) {
    targets.push({
      path: definition.path,
      sourceQuests: sharedQuests.filter(
        (quest) =>
          quest.level >= definition.minimum &&
          quest.level <= definition.maximum,
      ),
    });
  }

  let publishedCount = 0;
  for (const target of targets) {
    const filePath = path.join(projectRoot, target.path);
    const collection = questCollectionFileSchema.parse(
      await readJson(filePath),
    );
    const quests = target.sourceQuests.map((quest) =>
      convertQuest(
        quest,
        exportData,
        target.routeId,
        target.routeId
          ? new Set(target.sourceQuests.map((sourceQuest) => sourceQuest.id))
          : undefined,
      ),
    );
    const result = fillGroups(collection, quests);
    publishedCount += quests.length;
    console.log(`${target.path}: ${quests.length}`);
    if (shouldWrite) {
      await writeJsonFile(filePath, result);
    }
  }

  const expectedPublishedCount = exportData.quests.length + 1;

  if (publishedCount !== expectedPublishedCount) {
    throw new Error(
      `Expected ${expectedPublishedCount} published entries, received ${publishedCount}.`,
    );
  }

  console.log(`Published entries: ${publishedCount}`);
  console.log(
    shouldWrite
      ? 'Collection files updated.'
      : 'Dry run only; no files changed.',
  );
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
