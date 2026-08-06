export interface CuratedQuestUnlock {
  type: string;
  targetId: string;
  name: string;
  notes?: string;
}

interface ReviewedSystemReward {
  systemReward: number;
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
      69408,
      {
        systemReward: 247,
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

export function getCuratedQuestUnlocks(
  questRowId: number,
): CuratedQuestUnlock[] {
  return [
    ...(reviewedSystemRewardsByQuestRowId.get(questRowId)?.unlocks ?? []),
  ];
}

export function isReviewedSystemReward(
  questRowId: number,
  systemReward: number,
): boolean {
  return (
    reviewedSystemRewardsByQuestRowId.get(questRowId)?.systemReward ===
    systemReward
  );
}
