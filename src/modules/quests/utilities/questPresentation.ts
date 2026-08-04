import type {
  Quest,
  QuestCategory,
  QuestRequirement,
} from '../data/questSchemas';

export type QuestStatusFilter =
  'all' | 'incomplete' | 'completed' | 'current' | 'bookmarked';

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

export const QUEST_STATUS_OPTIONS = [
  {
    value: 'all',
    label: 'All progress states',
  },
  {
    value: 'incomplete',
    label: 'Incomplete',
  },
  {
    value: 'completed',
    label: 'Completed',
  },
  {
    value: 'current',
    label: 'Current quest',
  },
  {
    value: 'bookmarked',
    label: 'Bookmarked',
  },
] satisfies ReadonlyArray<{
  value: QuestStatusFilter;
  label: string;
}>;

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

interface QuestProgressState {
  completedQuestIds: ReadonlySet<string>;
  bookmarkedQuestIds: ReadonlySet<string>;
  currentQuestId: string | null;
}

export function questMatchesStatus(
  quest: Quest,
  status: QuestStatusFilter,
  progress: QuestProgressState,
): boolean {
  switch (status) {
    case 'all':
      return true;

    case 'incomplete':
      return !progress.completedQuestIds.has(quest.id);

    case 'completed':
      return progress.completedQuestIds.has(quest.id);

    case 'current':
      return progress.currentQuestId === quest.id;

    case 'bookmarked':
      return progress.bookmarkedQuestIds.has(quest.id);
  }
}
