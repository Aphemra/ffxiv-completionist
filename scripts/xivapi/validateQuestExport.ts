import { readFile } from 'node:fs/promises';

import path from 'node:path';

import {
  questChainExportSchema,
  type QuestChainExport,
  type QuestExportEntry,
} from './questExportSchemas';

import { projectRoot, writeJsonFile } from './paths';

type QuestExportIssue = QuestChainExport['issues'][number];

type QuestGraphPoint = QuestChainExport['branches'][number];

interface DerivedGraphData {
  branches: QuestGraphPoint[];
  convergences: QuestGraphPoint[];

  graphRoleByQuestId: Map<string, QuestExportEntry['graphRole']>;
}

interface IntegrityResult {
  errors: string[];
  warnings: string[];
}

const DEFAULT_ISSUE_DISPLAY_LIMIT = 50;

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

function requireOption(optionName: string): string {
  const optionValue = readOption(optionName);

  if (!optionValue) {
    throw new Error(
      [
        `Missing required option: ${optionName}`,
        '',
        'Usage:',
        'npm run xivapi:validate:export -- --file scripts/xivapi/exports/arr-2.0-msq.json',
      ].join('\n'),
    );
  }

  return optionValue;
}

function hasFlag(flagName: string): boolean {
  return process.argv.includes(flagName);
}

function resolveProjectPath(inputPath: string): string {
  return path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(projectRoot, inputPath);
}

async function readJsonFile(filePath: string): Promise<unknown> {
  const fileText = await readFile(filePath, 'utf8');

  return JSON.parse(fileText) as unknown;
}

function formatSchemaPath(pathParts: readonly PropertyKey[]): string {
  if (pathParts.length === 0) {
    return '<root>';
  }

  return pathParts.map(String).join('.');
}

function printSchemaErrors(
  errors: readonly {
    path: PropertyKey[];
    message: string;
  }[],
): void {
  console.error('');
  console.error('The export file does not match the quest export schema.');

  console.error('');

  for (const error of errors) {
    console.error(
      ['-', formatSchemaPath(error.path), '—', error.message].join(' '),
    );
  }
}

function findDuplicateValues(values: readonly string[]): string[] {
  const seenValues = new Set<string>();

  const duplicateValues = new Set<string>();

  for (const value of values) {
    if (seenValues.has(value)) {
      duplicateValues.add(value);
    } else {
      seenValues.add(value);
    }
  }

  return Array.from(duplicateValues);
}

function createIssueKey(issue: QuestExportIssue): string {
  return [issue.questId, issue.field, issue.message].join('|');
}

function pushUniqueIssue(
  issues: QuestExportIssue[],
  issueKeys: Set<string>,
  issue: QuestExportIssue,
): void {
  const issueKey = createIssueKey(issue);

  if (issueKeys.has(issueKey)) {
    return;
  }

  issueKeys.add(issueKey);
  issues.push(issue);
}

function collectStartIssues(
  quest: QuestExportEntry,
  issues: QuestExportIssue[],
  issueKeys: Set<string>,
): void {
  const start = quest.start;

  if (start.npc === null || start.npc.name === null) {
    pushUniqueIssue(issues, issueKeys, {
      questId: quest.id,
      questName: quest.name,

      field: 'start.npc.name',

      message: 'Confirm the start NPC.',
    });
  }

  if (start.location === null) {
    pushUniqueIssue(issues, issueKeys, {
      questId: quest.id,
      questName: quest.name,

      field: 'start.location',

      message: 'Confirm the start location.',
    });

    return;
  }

  if (start.location.zone === null) {
    pushUniqueIssue(issues, issueKeys, {
      questId: quest.id,
      questName: quest.name,

      field: 'start.location.zone',

      message: 'Confirm the start zone.',
    });
  }

  if (start.location.x === null || start.location.y === null) {
    pushUniqueIssue(issues, issueKeys, {
      questId: quest.id,
      questName: quest.name,

      field: 'start.location.coordinates',

      message: 'Confirm the start coordinates.',
    });
  }
}

function collectUnresolvedIssues(
  exportData: QuestChainExport,
  existingIssues: readonly QuestExportIssue[],
): QuestExportIssue[] {
  const issues = existingIssues.filter(
    (issue) => issue.field === 'requirements.item.name',
  );

  const issueKeys = new Set(issues.map(createIssueKey));

  for (const quest of exportData.quests) {
    if (quest.level === null) {
      pushUniqueIssue(issues, issueKeys, {
        questId: quest.id,
        questName: quest.name,

        field: 'level',

        message: 'Confirm the required quest level.',
      });
    }

    if (quest.rewards.experience === null) {
      pushUniqueIssue(issues, issueKeys, {
        questId: quest.id,
        questName: quest.name,

        field: 'rewards.experience',

        message: 'Confirm the actual experience reward.',
      });
    }

    if (quest.rewards.gil === null) {
      pushUniqueIssue(issues, issueKeys, {
        questId: quest.id,
        questName: quest.name,

        field: 'rewards.gil',

        message: 'Confirm the gil reward.',
      });
    }

    collectStartIssues(quest, issues, issueKeys);

    for (const requirement of quest.requirements) {
      if (requirement.type === 'item' && requirement.quantity === null) {
        pushUniqueIssue(issues, issueKeys, {
          questId: quest.id,
          questName: quest.name,

          field: 'requirements.item.quantity',

          message: `Confirm the required quantity for ${requirement.itemName}.`,
        });
      }
    }

    for (const rewardItem of quest.rewards.items) {
      if (rewardItem.quantity !== null) {
        continue;
      }

      pushUniqueIssue(issues, issueKeys, {
        questId: quest.id,
        questName: quest.name,

        field: 'rewards.items.quantity',

        message: `Confirm the reward quantity for ${rewardItem.itemName}.`,
      });
    }

    for (const rewardChoice of quest.rewards.choices) {
      if (rewardChoice.quantity !== null) {
        continue;
      }

      pushUniqueIssue(issues, issueKeys, {
        questId: quest.id,
        questName: quest.name,

        field: 'rewards.choices.quantity',

        message: `Confirm the reward-choice quantity for ${rewardChoice.itemName}.`,
      });
    }
  }

  return issues;
}

function determineGraphRole(
  quest: QuestExportEntry,
): QuestExportEntry['graphRole'] {
  const isBranch = quest.nextQuestIds.length > 1;

  const isConvergence = quest.previousQuestIds.length > 1;

  if (isBranch && isConvergence) {
    return 'branch-and-convergence';
  }

  if (isBranch) {
    return 'branch';
  }

  if (isConvergence) {
    return 'convergence';
  }

  return 'linear';
}

function deriveGraphData(exportData: QuestChainExport): DerivedGraphData {
  const branches: QuestGraphPoint[] = [];

  const convergences: QuestGraphPoint[] = [];

  const graphRoleByQuestId = new Map<string, QuestExportEntry['graphRole']>();

  for (const quest of exportData.quests) {
    const graphRole = determineGraphRole(quest);

    graphRoleByQuestId.set(quest.id, graphRole);

    if (quest.nextQuestIds.length > 1) {
      branches.push({
        questId: quest.id,
        questName: quest.name,

        relatedQuestIds: [...quest.nextQuestIds],
      });
    }

    if (quest.previousQuestIds.length > 1) {
      convergences.push({
        questId: quest.id,
        questName: quest.name,

        relatedQuestIds: [...quest.previousQuestIds],
      });
    }
  }

  return {
    branches,
    convergences,
    graphRoleByQuestId,
  };
}

function validateGraphCycle(
  exportData: QuestChainExport,
  questsById: ReadonlyMap<string, QuestExportEntry>,
  errors: string[],
): void {
  const inDegreeByQuestId = new Map<string, number>();

  for (const quest of exportData.quests) {
    inDegreeByQuestId.set(quest.id, 0);
  }

  for (const quest of exportData.quests) {
    for (const nextQuestId of new Set(quest.nextQuestIds)) {
      if (!questsById.has(nextQuestId)) {
        continue;
      }

      const currentInDegree = inDegreeByQuestId.get(nextQuestId) ?? 0;

      inDegreeByQuestId.set(nextQuestId, currentInDegree + 1);
    }
  }

  const availableQuestIds = Array.from(inDegreeByQuestId.entries())
    .filter(([, inDegree]) => inDegree === 0)
    .map(([questId]) => questId);

  let processedQuestCount = 0;

  while (availableQuestIds.length > 0) {
    const questId = availableQuestIds.shift();

    if (!questId) {
      continue;
    }

    processedQuestCount += 1;

    const quest = questsById.get(questId);

    if (!quest) {
      continue;
    }

    for (const nextQuestId of new Set(quest.nextQuestIds)) {
      if (!questsById.has(nextQuestId)) {
        continue;
      }

      const currentInDegree = inDegreeByQuestId.get(nextQuestId);

      if (currentInDegree === undefined) {
        continue;
      }

      const nextInDegree = currentInDegree - 1;

      inDegreeByQuestId.set(nextQuestId, nextInDegree);

      if (nextInDegree === 0) {
        availableQuestIds.push(nextQuestId);
      }
    }
  }

  if (processedQuestCount !== questsById.size) {
    errors.push(
      [
        'The previous/next quest graph contains a cycle.',
        `Processed ${processedQuestCount} of ${questsById.size} quests.`,
      ].join(' '),
    );
  }
}

function validateGraphConnectivity(
  exportData: QuestChainExport,
  questsById: ReadonlyMap<string, QuestExportEntry>,
  errors: string[],
): void {
  const firstQuest = exportData.quests[0];

  if (!firstQuest) {
    return;
  }

  const adjacentQuestIds = new Map<string, Set<string>>();

  for (const quest of exportData.quests) {
    adjacentQuestIds.set(quest.id, new Set<string>());
  }

  for (const quest of exportData.quests) {
    const neighbors = adjacentQuestIds.get(quest.id);

    if (!neighbors) {
      continue;
    }

    for (const previousQuestId of quest.previousQuestIds) {
      if (!questsById.has(previousQuestId)) {
        continue;
      }

      neighbors.add(previousQuestId);

      adjacentQuestIds.get(previousQuestId)?.add(quest.id);
    }

    for (const nextQuestId of quest.nextQuestIds) {
      if (!questsById.has(nextQuestId)) {
        continue;
      }

      neighbors.add(nextQuestId);

      adjacentQuestIds.get(nextQuestId)?.add(quest.id);
    }
  }

  const visitedQuestIds = new Set<string>();

  const pendingQuestIds = [firstQuest.id];

  while (pendingQuestIds.length > 0) {
    const questId = pendingQuestIds.pop();

    if (!questId || visitedQuestIds.has(questId)) {
      continue;
    }

    visitedQuestIds.add(questId);

    for (const adjacentQuestId of adjacentQuestIds.get(questId) ?? []) {
      pendingQuestIds.push(adjacentQuestId);
    }
  }

  if (visitedQuestIds.size !== questsById.size) {
    const disconnectedQuestIds = Array.from(questsById.keys()).filter(
      (questId) => !visitedQuestIds.has(questId),
    );

    errors.push(
      [
        'The export contains disconnected quests.',
        `Disconnected quest IDs: ${disconnectedQuestIds.join(', ')}`,
      ].join(' '),
    );
  }
}

function hasSharedRouteValue(
  valueGroups: readonly (readonly string[])[],
): boolean {
  if (valueGroups.length < 2) {
    return true;
  }

  const firstGroup = valueGroups[0];

  if (!firstGroup) {
    return true;
  }

  return firstGroup.some((value) =>
    valueGroups.every((group) => group.includes(value)),
  );
}

function validateIntegrity(
  exportData: QuestChainExport,
  derivedGraphData: DerivedGraphData,
  unresolvedIssues: readonly QuestExportIssue[],
): IntegrityResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const questsById = new Map<string, QuestExportEntry>();

  const questIdsByRowId = new Map<number, string>();

  const questIdsBySortOrder = new Map<number, string>();

  let arrayOrderMismatchCount = 0;
  let graphRoleMismatchCount = 0;

  exportData.quests.forEach((quest, questIndex) => {
    const existingQuest = questsById.get(quest.id);

    if (existingQuest) {
      errors.push(
        [
          `Duplicate quest ID "${quest.id}".`,
          `Rows ${existingQuest.xivapiRowId} and ${quest.xivapiRowId}.`,
        ].join(' '),
      );
    } else {
      questsById.set(quest.id, quest);
    }

    const existingRowQuestId = questIdsByRowId.get(quest.xivapiRowId);

    if (existingRowQuestId) {
      errors.push(
        [
          `XIVAPI row ${quest.xivapiRowId} is used by multiple quests.`,
          `Quest IDs: ${existingRowQuestId}, ${quest.id}.`,
        ].join(' '),
      );
    } else {
      questIdsByRowId.set(quest.xivapiRowId, quest.id);
    }

    const existingSortQuestId = questIdsBySortOrder.get(quest.sortOrder);

    if (existingSortQuestId) {
      errors.push(
        [
          `Sort order ${quest.sortOrder} is used by multiple quests.`,
          `Quest IDs: ${existingSortQuestId}, ${quest.id}.`,
        ].join(' '),
      );
    } else {
      questIdsBySortOrder.set(quest.sortOrder, quest.id);
    }

    if (quest.sortOrder !== questIndex + 1) {
      arrayOrderMismatchCount += 1;
    }

    if (quest.expansionId !== exportData.expansionId) {
      errors.push(
        [
          `${quest.id} has expansion "${quest.expansionId}"`,
          `but the export uses "${exportData.expansionId}".`,
        ].join(' '),
      );
    }

    if (quest.patch !== exportData.patch) {
      errors.push(
        [
          `${quest.id} has patch "${quest.patch}"`,
          `but the export uses "${exportData.patch}".`,
        ].join(' '),
      );
    }

    if (quest.category !== exportData.category) {
      errors.push(
        [
          `${quest.id} has category "${quest.category}"`,
          `but the export uses "${exportData.category}".`,
        ].join(' '),
      );
    }

    const duplicatePreviousIds = findDuplicateValues(quest.previousQuestIds);

    if (duplicatePreviousIds.length > 0) {
      errors.push(
        [
          `${quest.id} contains duplicate previous-quest references:`,
          duplicatePreviousIds.join(', '),
        ].join(' '),
      );
    }

    const duplicateNextIds = findDuplicateValues(quest.nextQuestIds);

    if (duplicateNextIds.length > 0) {
      errors.push(
        [
          `${quest.id} contains duplicate next-quest references:`,
          duplicateNextIds.join(', '),
        ].join(' '),
      );
    }

    if (
      quest.previousQuestIds.includes(quest.id) ||
      quest.nextQuestIds.includes(quest.id)
    ) {
      errors.push(`${quest.id} references itself as a previous or next quest.`);
    }

    if (
      quest.previousQuestMode === 'any' &&
      quest.previousQuestIds.length < 2
    ) {
      warnings.push(
        [
          `${quest.id} uses previousQuestMode "any"`,
          'but has fewer than two previous quests.',
        ].join(' '),
      );
    }

    const expectedGraphRole = derivedGraphData.graphRoleByQuestId.get(quest.id);

    if (
      expectedGraphRole !== undefined &&
      expectedGraphRole !== quest.graphRole
    ) {
      graphRoleMismatchCount += 1;
    }
  });

  for (const quest of exportData.quests) {
    const hasInternalPreviousQuest = quest.previousQuestIds.some((questId) =>
      questsById.has(questId),
    );

    const hasInternalNextQuest = quest.nextQuestIds.some((questId) =>
      questsById.has(questId),
    );

    for (const previousQuestId of quest.previousQuestIds) {
      const previousQuest = questsById.get(previousQuestId);

      if (!previousQuest) {
        if (!hasInternalPreviousQuest) {
          continue;
        }

        errors.push(
          [
            `${quest.id} references missing previous quest`,
            `"${previousQuestId}".`,
          ].join(' '),
        );

        continue;
      }

      if (!previousQuest.nextQuestIds.includes(quest.id)) {
        errors.push(
          [
            `${quest.id} lists "${previousQuestId}" as previous,`,
            `but "${previousQuestId}" does not list "${quest.id}" as next.`,
          ].join(' '),
        );
      }
    }

    for (const nextQuestId of quest.nextQuestIds) {
      const nextQuest = questsById.get(nextQuestId);

      if (!nextQuest) {
        if (!hasInternalNextQuest) {
          continue;
        }

        errors.push(
          [
            `${quest.id} references missing next quest`,
            `"${nextQuestId}".`,
          ].join(' '),
        );

        continue;
      }

      if (!nextQuest.previousQuestIds.includes(quest.id)) {
        errors.push(
          [
            `${quest.id} lists "${nextQuestId}" as next,`,
            `but "${nextQuestId}" does not list "${quest.id}" as previous.`,
          ].join(' '),
        );
      }
    }

    for (const requirement of quest.requirements) {
      if (requirement.type !== 'quest') {
        continue;
      }

      if (!questsById.has(requirement.questId)) {
        errors.push(
          [
            `${quest.id} has a quest requirement`,
            `referencing missing quest "${requirement.questId}".`,
          ].join(' '),
        );
      }
    }

    const previousQuests = quest.previousQuestIds
      .map((previousQuestId) => questsById.get(previousQuestId))
      .filter(
        (previousQuest): previousQuest is QuestExportEntry =>
          previousQuest !== undefined,
      );

    const previousInitialGrandCompanyGroups = previousQuests
      .map(
        (previousQuest) =>
          previousQuest.availability?.initialGrandCompanyIds ?? [],
      )
      .filter((grandCompanyIds) => grandCompanyIds.length > 0);

    if (
      quest.previousQuestMode === 'all' &&
      previousInitialGrandCompanyGroups.length > 1 &&
      !hasSharedRouteValue(previousInitialGrandCompanyGroups)
    ) {
      errors.push(
        [
          `${quest.id} requires all previous quests,`,
          'but those previous quests belong to',
          'mutually exclusive initial Grand Companies.',
          'Set previousQuestMode to "any".',
        ].join(' '),
      );
    }
  }

  validateGraphCycle(exportData, questsById, errors);

  validateGraphConnectivity(exportData, questsById, errors);

  if (arrayOrderMismatchCount > 0) {
    warnings.push(
      [
        `${arrayOrderMismatchCount} quest entries are not positioned`,
        'at the array index indicated by their sortOrder.',
        'The validator can preserve the data, but copying the array may produce unexpected ordering.',
      ].join(' '),
    );
  }

  if (graphRoleMismatchCount > 0) {
    warnings.push(
      [
        `${graphRoleMismatchCount} graphRole values do not match`,
        'the current previous/next quest relationships.',
        'Run with "--write" to refresh them.',
      ].join(' '),
    );
  }

  const expectedSummary = {
    questCount: exportData.quests.length,

    branchCount: derivedGraphData.branches.length,

    convergenceCount: derivedGraphData.convergences.length,

    unresolvedIssueCount: unresolvedIssues.length,
  };

  if (JSON.stringify(exportData.summary) !== JSON.stringify(expectedSummary)) {
    warnings.push(
      [
        'The summary does not match the current quest data.',
        'Run with "--write" to refresh it.',
      ].join(' '),
    );
  }

  if (
    JSON.stringify(exportData.branches) !==
    JSON.stringify(derivedGraphData.branches)
  ) {
    warnings.push(
      [
        'The top-level branches list does not match the current quest links.',
        'Run with "--write" to refresh it.',
      ].join(' '),
    );
  }

  if (
    JSON.stringify(exportData.convergences) !==
    JSON.stringify(derivedGraphData.convergences)
  ) {
    warnings.push(
      [
        'The top-level convergences list does not match the current quest links.',
        'Run with "--write" to refresh it.',
      ].join(' '),
    );
  }

  const storedIssueKeys = exportData.issues.map(createIssueKey).sort();

  const derivedIssueKeys = unresolvedIssues.map(createIssueKey).sort();

  if (JSON.stringify(storedIssueKeys) !== JSON.stringify(derivedIssueKeys)) {
    warnings.push(
      [
        'The top-level issues list does not match the unresolved fields currently in the quests.',
        'Run with "--write" to refresh it.',
      ].join(' '),
    );
  }

  return {
    errors,
    warnings,
  };
}

function createUpdatedExport(
  exportData: QuestChainExport,
  derivedGraphData: DerivedGraphData,
  unresolvedIssues: QuestExportIssue[],
): QuestChainExport {
  const updatedQuests = exportData.quests.map((quest) => ({
    ...quest,

    graphRole:
      derivedGraphData.graphRoleByQuestId.get(quest.id) ?? quest.graphRole,
  }));

  return questChainExportSchema.parse({
    ...exportData,

    summary: {
      questCount: updatedQuests.length,

      branchCount: derivedGraphData.branches.length,

      convergenceCount: derivedGraphData.convergences.length,

      unresolvedIssueCount: unresolvedIssues.length,
    },

    branches: derivedGraphData.branches,

    convergences: derivedGraphData.convergences,

    issues: unresolvedIssues,

    quests: updatedQuests,
  });
}

function printMessages(title: string, messages: readonly string[]): void {
  if (messages.length === 0) {
    return;
  }

  console.log('');
  console.log(title);
  console.log('');

  for (const message of messages) {
    console.log(`- ${message}`);
  }
}

function printUnresolvedIssues(
  issues: readonly QuestExportIssue[],
  verbose: boolean,
): void {
  if (issues.length === 0) {
    return;
  }

  const displayLimit = verbose ? issues.length : DEFAULT_ISSUE_DISPLAY_LIMIT;

  const displayedIssues = issues.slice(0, displayLimit);

  console.log('');
  console.log('Unresolved display fields');

  console.log('');

  for (const issue of displayedIssues) {
    console.log(
      [
        '-',
        issue.questName,
        `(${issue.questId})`,
        `— ${issue.field}:`,
        issue.message,
      ].join(' '),
    );
  }

  const hiddenIssueCount = issues.length - displayedIssues.length;

  if (hiddenIssueCount > 0) {
    console.log('');
    console.log(
      [
        `...and ${hiddenIssueCount} more unresolved fields.`,
        'Rerun with "--verbose" to print all of them.',
      ].join(' '),
    );
  }
}

async function main(): Promise<void> {
  const filePath = resolveProjectPath(requireOption('--file'));

  const shouldWrite = hasFlag('--write');

  const requireComplete = hasFlag('--require-complete');

  const verbose = hasFlag('--verbose');

  let rawExport: unknown;

  try {
    rawExport = await readJsonFile(filePath);
  } catch (error) {
    console.error('');
    console.error(`Could not read export: ${filePath}`);

    throw error;
  }

  const schemaResult = questChainExportSchema.safeParse(rawExport);

  if (!schemaResult.success) {
    printSchemaErrors(schemaResult.error.issues);

    process.exitCode = 1;
    return;
  }

  const exportData = schemaResult.data;

  const unresolvedIssues = collectUnresolvedIssues(
    exportData,
    exportData.issues,
  );

  const derivedGraphData = deriveGraphData(exportData);

  const integrityResult = validateIntegrity(
    exportData,
    derivedGraphData,
    unresolvedIssues,
  );

  const questsWithIssues = new Set(
    unresolvedIssues.map((issue) => issue.questId),
  ).size;

  console.log('');
  console.log('Quest export validation');

  console.log('');
  console.log(`File: ${filePath}`);
  console.log(`Quests: ${exportData.quests.length}`);

  console.log(`Branches: ${derivedGraphData.branches.length}`);

  console.log(`Convergences: ${derivedGraphData.convergences.length}`);

  console.log(`Structural errors: ${integrityResult.errors.length}`);

  console.log(`Warnings: ${integrityResult.warnings.length}`);

  console.log(`Unresolved fields: ${unresolvedIssues.length}`);

  console.log(`Quests needing details: ${questsWithIssues}`);

  printMessages('Structural errors', integrityResult.errors);

  printMessages('Warnings', integrityResult.warnings);

  printUnresolvedIssues(unresolvedIssues, verbose);

  if (shouldWrite && integrityResult.errors.length === 0) {
    const updatedExport = createUpdatedExport(
      exportData,
      derivedGraphData,
      unresolvedIssues,
    );

    await writeJsonFile(filePath, updatedExport);

    console.log('');
    console.log('Refreshed derived metadata in the export file:');

    console.log('- summary');

    console.log('- branches');

    console.log('- convergences');

    console.log('- issues');

    console.log('- quest graphRole values');
  } else if (shouldWrite && integrityResult.errors.length > 0) {
    console.log('');
    console.log(
      'The export was not rewritten because structural errors were found.',
    );
  }

  console.log('');

  if (integrityResult.errors.length > 0) {
    console.log('Status: INVALID');

    process.exitCode = 1;
    return;
  }

  if (unresolvedIssues.length > 0) {
    console.log('Status: VALID BUT INCOMPLETE');

    if (requireComplete) {
      process.exitCode = 1;
    }

    return;
  }

  console.log('Status: VALID AND COMPLETE');
}

await main();
