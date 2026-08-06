import type {
  Quest,
  QuestCategory,
  QuestRequirement,
} from '../data/questSchemas';

const EXPANSION_LABELS: Readonly<Record<string, string>> = {
  arr: 'A Realm Reborn',
  heavensward: 'Heavensward',
  stormblood: 'Stormblood',
  shadowbringers: 'Shadowbringers',
  endwalker: 'Endwalker',
  dawntrail: 'Dawntrail',
  evercold: 'Evercold',
};

export type QuestStatusFilter = 'all' | 'incomplete' | 'completed' | 'current';

interface QuestCategoryOption {
  value: QuestCategory;
  label: string;
}

export const QUEST_CATEGORY_OPTIONS = [
  {
    value: 'msq',
    label: 'Main Scenario',
  },
  {
    value: 'class',
    label: 'Class Quests',
  },
  {
    value: 'job',
    label: 'Job Quests',
  },
  {
    value: 'role',
    label: 'Role Quests',
  },
  {
    value: 'crafting',
    label: 'Crafting Quests',
  },
  {
    value: 'gathering',
    label: 'Gathering Quests',
  },
  {
    value: 'feature',
    label: 'Feature Quests',
  },
  {
    value: 'side',
    label: 'Side Quests',
  },
  {
    value: 'side-story',
    label: 'Side Stories',
  },
  {
    value: 'tribal',
    label: 'Allied Society Quests',
  },
  {
    value: 'relic',
    label: 'Relic Quests',
  },
] satisfies ReadonlyArray<QuestCategoryOption>;

export type QuestFamily =
  | 'msq'
  | 'side'
  | 'feature'
  | 'jobs'
  | 'role'
  | 'side-story'
  | 'tribal'
  | 'relic';

interface QuestFamilyOption {
  value: QuestFamily;
  label: string;

  categories: readonly QuestCategory[];

  primaryFilterLabel: string;
  secondaryFilterLabel: string;
}

export const QUEST_FAMILY_OPTIONS: readonly QuestFamilyOption[] = [
  {
    value: 'msq',
    label: 'Main Scenario',
    categories: ['msq'],
    primaryFilterLabel: 'Expansion',
    secondaryFilterLabel: 'Patch',
  },
  {
    value: 'side',
    label: 'Side Quests',
    categories: ['side'],
    primaryFilterLabel: 'Region',
    secondaryFilterLabel: 'Zone',
  },
  {
    value: 'feature',
    label: 'Feature Quests',
    categories: ['feature'],
    primaryFilterLabel: 'Region',
    secondaryFilterLabel: 'Zone',
  },
  {
    value: 'jobs',
    label: 'Class & Job Quests',
    categories: ['class', 'job', 'crafting', 'gathering'],
    primaryFilterLabel: 'Discipline',
    secondaryFilterLabel: 'Class or Job',
  },
  {
    value: 'role',
    label: 'Role Quests',
    categories: ['role'],
    primaryFilterLabel: 'Expansion',
    secondaryFilterLabel: 'Role',
  },
  {
    value: 'side-story',
    label: 'Side Stories',
    categories: ['side-story'],
    primaryFilterLabel: 'Series',
    secondaryFilterLabel: 'Questline',
  },
  {
    value: 'tribal',
    label: 'Allied Society Quests',
    categories: ['tribal'],
    primaryFilterLabel: 'Society',
    secondaryFilterLabel: 'Questline',
  },
  {
    value: 'relic',
    label: 'Relic Quests',
    categories: ['relic'],
    primaryFilterLabel: 'Relic Series',
    secondaryFilterLabel: 'Stage',
  },
];

export function questCategoryMatchesFamily(
  category: QuestCategory,
  family: QuestFamily,
): boolean {
  const option = QUEST_FAMILY_OPTIONS.find(
    (candidate) => candidate.value === family,
  );

  return (
    option?.categories.some(
      (candidateCategory) => candidateCategory === category,
    ) ?? false
  );
}

export function questMatchesFamily(quest: Quest, family: QuestFamily): boolean {
  return questCategoryMatchesFamily(quest.category, family);
}

export function formatQuestCategory(category: QuestCategory): string {
  return (
    QUEST_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ??
    category
  );
}

function getRequirementSearchValues(requirement: QuestRequirement): string[] {
  switch (requirement.type) {
    case 'class-job-level':
      return [
        requirement.classJobId,
        requirement.classJobName,
        String(requirement.level),
        requirement.notes ?? '',
      ];

    case 'item':
      return [
        requirement.itemId,
        requirement.itemName,
        String(requirement.quantity),
        requirement.quality,
        requirement.notes ?? '',
      ];

    case 'craft':
      return [
        requirement.itemId,
        requirement.itemName,
        requirement.craftingJobId,
        requirement.craftingJobName,
        String(requirement.quantity),
        String(requirement.recipeLevel ?? ''),
        requirement.quality,
        requirement.notes ?? '',
      ];

    case 'gather':
      return [
        requirement.itemId,
        requirement.itemName,
        requirement.gatheringJobId,
        requirement.gatheringJobName,
        String(requirement.quantity),
        String(requirement.gatheringLevel ?? ''),
        requirement.quality,
        requirement.notes ?? '',
      ];

    case 'feature':
      return [
        requirement.featureId ?? '',
        requirement.name,
        requirement.notes ?? '',
      ];
  }
}

export function questMatchesSearch(quest: Quest, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return true;
  }

  const searchValues: string[] = [
    quest.id,
    quest.name,
    quest.category,
    formatQuestCategory(quest.category),
    quest.expansionId,
    quest.patch,
    String(quest.level),

    quest.start?.npcName ?? '',
    quest.start?.zoneId ?? '',
    quest.start?.zoneName ?? '',

    ...(quest.requirements?.flatMap(getRequirementSearchValues) ?? []),

    ...(quest.rewards?.items?.flatMap((item) => [
      item.itemId,
      item.itemName,
      String(item.quantity),
    ]) ?? []),

    ...(quest.duties?.flatMap((duty) => [
      duty.id,
      duty.name,
      duty.type,
      String(duty.level),
      duty.notes ?? '',
    ]) ?? []),

    ...(quest.unlocks?.flatMap((unlock) => [
      unlock.type,
      unlock.targetId ?? '',
      unlock.name,
      unlock.notes ?? '',
    ]) ?? []),

    ...(quest.notes?.map((note) => note.text) ?? []),
  ];

  return searchValues.join(' ').toLowerCase().includes(normalizedQuery);
}

export function formatExpansionName(expansionId: string): string {
  const knownLabel = EXPANSION_LABELS[expansionId];

  if (knownLabel) {
    return knownLabel;
  }

  return expansionId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function comparePatchVersions(left: string, right: string): number {
  const leftParts = left.split('.').map((part) => Number(part));

  const rightParts = right.split('.').map((part) => Number(part));

  const partCount = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < partCount; index += 1) {
    const leftPart = leftParts[index] ?? 0;
    const rightPart = rightParts[index] ?? 0;

    if (leftPart !== rightPart) {
      return leftPart - rightPart;
    }
  }

  return left.localeCompare(right);
}
