export interface CuratedQuestUnlock {
  type: string;
  targetId: string;
  name: string;
  notes?: string;
}

interface ReviewedSystemReward {
  systemRewards: readonly number[];
  unlocks: readonly CuratedQuestUnlock[];
  notes: string;
}

/**
 * Some Quest.SystemReward values do not expose enough semantic information
 * through XIVAPI to construct a player-facing unlock automatically.
 *
 * These entries document reviewed quest-specific interpretations. Keying them
 * by Quest row ID avoids assuming that a numeric SystemReward code has exactly
 * the same meaning for every quest.
 */
const reviewedSystemRewardsByQuestRowId = new Map<number, ReviewedSystemReward>(
  [
    [
      65665,
      {
        systemRewards: [2],
        unlocks: [
          {
            type: 'feature',
            targetId: 'inn-rooms',
            name: 'Inn Rooms',
            notes: 'Unlocks access to inn rooms through the Gridania route.',
          },
          {
            type: 'feature',
            targetId: 'guildleves',
            name: 'Guildleves',
            notes: 'Unlocks access to guildleves through the Gridania route.',
          },
        ],
        notes: 'Verified Gridania starting-route feature unlocks.',
      },
    ],
    [
      65856,
      {
        systemRewards: [2],
        unlocks: [
          {
            type: 'feature',
            targetId: 'inn-rooms',
            name: 'Inn Rooms',
            notes: `Unlocks access to inn rooms through the Ul'dah route.`,
          },
          {
            type: 'feature',
            targetId: 'guildleves',
            name: 'Guildleves',
            notes: `Unlocks access to guildleves through the Ul'dah route.`,
          },
        ],
        notes: `Verified Ul'dah starting-route feature unlocks.`,
      },
    ],
    [
      66005,
      {
        systemRewards: [2],
        unlocks: [
          {
            type: 'feature',
            targetId: 'inn-rooms',
            name: 'Inn Rooms',
            notes:
              'Unlocks access to inn rooms through the Limsa Lominsa route.',
          },
          {
            type: 'feature',
            targetId: 'guildleves',
            name: 'Guildleves',
            notes:
              'Unlocks access to guildleves through the Limsa Lominsa route.',
          },
        ],
        notes: 'Verified Limsa Lominsa starting-route feature unlocks.',
      },
    ],
    [
      66045,
      {
        systemRewards: [3],
        unlocks: [
          {
            type: 'feature',
            targetId: 'retainers',
            name: 'Retainers',
            notes: 'Unlocks the ability to hire retainers.',
          },
        ],
        notes: 'Verified retainer feature unlock.',
      },
    ],
    [
      69408,
      {
        systemRewards: [247],
        unlocks: [
          {
            type: 'feature',
            targetId: 'hall-of-the-novice-tactical-training',
            name: 'Hall of the Novice tactical training',
            notes: 'Unlocks additional Hall of the Novice tactical training.',
          },
        ],
        notes: 'Verified quest-specific SystemReward interpretation.',
      },
    ],
  ],
);

/**
 * Quest-driven Enhancement I mount-speed increases.
 *
 * Shadowbringers and later expansions obtain their zone speed increase
 * through Riding Maps rather than MSQ completion.
 */
const mountSpeedZonesByQuestRowId = new Map<number, readonly string[]>([
  // A Realm Reborn
  [
    66260,
    [
      'Middle La Noscea',
      'Lower La Noscea',
      'Central Shroud',
      'East Shroud',
      'Western Thanalan',
      'Central Thanalan',
    ],
  ],
  [66312, ['South Shroud']],
  [66335, ['North Shroud']],
  [66358, ['Southern Thanalan']],
  [66391, ['Eastern La Noscea']],
  [66393, ['Upper La Noscea', 'Outer La Noscea']],
  [66054, ['Eastern Thanalan']],
  [66488, ['Coerthas Central Highlands']],
  [66503, ['Western La Noscea']],
  [66541, ['Mor Dhona']],
  [70058, ['Northern Thanalan', 'Mist', 'The Lavender Beds', 'The Goblet']],

  // Heavensward
  [67142, ['Coerthas Western Highlands']],
  [67152, ['The Dravanian Forelands']],
  [67195, ['The Dravanian Hinterlands']],
  [67183, ['The Sea of Clouds']],
  [67162, ['The Churning Mists']],
  [67203, ['Azys Lla']],
  [67205, ['Idyllshire']],
  [67895, ['Empyreum']],

  // Stormblood
  [68025, ['The Ruby Sea']],
  [68032, ['Yanxia']],
  [68051, ['The Azim Steppe']],
  [68068, ['The Fringes']],
  [68080, ['The Peaks']],
  [68086, ['The Lochs']],
  [68089, ['Shirogane', `Rhalgr's Reach`]],
]);

export function readSystemRewardValues(value: unknown): number[] {
  const rawValues = Array.isArray(value) ? value : [value];

  return Array.from(
    new Set(
      rawValues.filter(
        (rawValue): rawValue is number =>
          typeof rawValue === 'number' &&
          Number.isInteger(rawValue) &&
          rawValue > 0,
      ),
    ),
  );
}

function toGameDataId(value: string): string {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLocaleLowerCase('en-US')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'unknown';
}

export function getCuratedQuestUnlocks(
  questRowId: number,
): CuratedQuestUnlock[] {
  const unlocks: CuratedQuestUnlock[] = [
    ...(reviewedSystemRewardsByQuestRowId.get(questRowId)?.unlocks ?? []),
  ];

  const mountSpeedZones = mountSpeedZonesByQuestRowId.get(questRowId) ?? [];

  for (const zoneName of mountSpeedZones) {
    unlocks.push({
      type: 'mount-speed',
      targetId: `mount-speed-${toGameDataId(zoneName)}`,
      name: `${zoneName} Mount Speed`,
      notes: `Increases ground mount speed in ${zoneName}.`,
    });
  }

  return unlocks;
}

export function isReviewedSystemReward(
  questRowId: number,
  systemReward: number,
): boolean {
  return (
    reviewedSystemRewardsByQuestRowId
      .get(questRowId)
      ?.systemRewards.includes(systemReward) ?? false
  );
}
