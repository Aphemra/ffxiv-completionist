import type { KeyboardEvent, MouseEvent } from 'react';

import {
  Coins,
  Crosshair,
  Gauge,
  Gem,
  Smile,
  Sparkles,
  Swords,
  TrendingUp,
  Zap,
  type LucideIcon,
} from 'lucide-react';

import type { Quest } from '../data/questSchemas';

import { formatQuestCategory } from '../utilities/questPresentation';

import './QuestEntry.css';

interface QuestEntryProps {
  quest: Quest;

  isCompleted: boolean;
  isCurrent: boolean;

  onToggleCompletion: () => void;
  onOpenDetails: () => void;
}

function formatUnlockType(type: string): string {
  return type
    .split('-')
    .map((segment) =>
      segment.length > 0
        ? segment[0]?.toUpperCase() + segment.slice(1)
        : segment,
    )
    .join(' ');
}

function getUnlockIcon(type: string): LucideIcon {
  const normalizedType = type.toLocaleLowerCase('en-US');

  if (
    normalizedType.includes('dungeon') ||
    normalizedType.includes('trial') ||
    normalizedType.includes('raid') ||
    normalizedType.includes('duty')
  ) {
    return Swords;
  }

  if (normalizedType.includes('emote')) {
    return Smile;
  }

  if (normalizedType.includes('mount-speed')) {
    return Gauge;
  }

  if (normalizedType.includes('mount')) {
    return Gem;
  }

  if (normalizedType.includes('action') || normalizedType.includes('ability')) {
    return Zap;
  }

  return Sparkles;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    target.closest('button, input, label, a, select, textarea') !== null
  );
}

export function QuestEntry({
  quest,
  isCompleted,
  isCurrent,
  onToggleCompletion,
  onOpenDetails,
}: QuestEntryProps) {
  const experience = quest.rewards?.experience;
  const gil = quest.rewards?.gil;

  const dutyNames = new Set(
    quest.duties?.map((duty) => duty.name.toLocaleLowerCase('en-US')) ?? [],
  );

  const additionalUnlocks =
    quest.unlocks?.filter(
      (unlock) => !dutyNames.has(unlock.name.toLocaleLowerCase('en-US')),
    ) ?? [];

  function handleClick(event: MouseEvent<HTMLElement>): void {
    if (isInteractiveTarget(event.target)) {
      return;
    }

    onOpenDetails();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    onOpenDetails();
  }

  return (
    <article
      className={[
        'quest-entry',
        isCompleted ? 'quest-entry--complete' : '',
        isCurrent ? 'quest-entry--current' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${quest.name}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="quest-entry__main">
        <label className="quest-entry__check">
          <input
            type="checkbox"
            checked={isCompleted}
            aria-label={`Mark ${quest.name} complete`}
            onChange={onToggleCompletion}
          />

          <span className="quest-entry__custom-check" aria-hidden="true" />
        </label>

        <div className="quest-entry__content">
          <div className="quest-entry__heading">
            <div className="quest-entry__title">
              <h4>{quest.name}</h4>

              <p>
                Level {quest.level} · {formatQuestCategory(quest.category)}
              </p>
            </div>

            {isCurrent && (
              <div className="quest-entry__actions">
                <span className="quest-entry__current-indicator">
                  <Crosshair aria-hidden="true" />

                  <span>Current</span>
                </span>
              </div>
            )}
          </div>

          {((experience !== undefined && experience > 0) ||
            (gil !== undefined && gil > 0) ||
            (quest.duties && quest.duties.length > 0) ||
            additionalUnlocks.length > 0) && (
            <div
              className="quest-entry__indicators"
              aria-label="Quest rewards and unlocks"
            >
              {experience !== undefined && experience > 0 && (
                <span
                  className="quest-entry__indicator quest-entry__indicator--experience"
                  title={`${experience.toLocaleString()} experience`}
                >
                  <span
                    className="quest-entry__indicator-icon"
                    aria-hidden="true"
                  >
                    <TrendingUp />
                  </span>

                  <span>{experience.toLocaleString()}</span>
                </span>
              )}

              {gil !== undefined && gil > 0 && (
                <span
                  className="quest-entry__indicator quest-entry__indicator--gil"
                  title={`${gil.toLocaleString()} gil`}
                >
                  <span
                    className="quest-entry__indicator-icon"
                    aria-hidden="true"
                  >
                    <Coins />
                  </span>

                  <span>{gil.toLocaleString()}</span>
                </span>
              )}

              {quest.duties?.map((duty) => (
                <span
                  key={duty.id}
                  className="quest-entry__indicator quest-entry__indicator--unlock"
                  title={`Unlocks ${formatUnlockType(duty.type)}: ${duty.name}`}
                >
                  <span
                    className="quest-entry__indicator-icon"
                    aria-hidden="true"
                  >
                    <Swords />
                  </span>

                  <span>{duty.name}</span>
                </span>
              ))}

              {additionalUnlocks.map((unlock) => {
                const UnlockIcon = getUnlockIcon(unlock.type);

                return (
                  <span
                    key={`${unlock.type}-${unlock.targetId ?? unlock.name}`}
                    className="quest-entry__indicator quest-entry__indicator--unlock"
                    title={`Unlocks ${formatUnlockType(unlock.type)}: ${unlock.name}`}
                  >
                    <span
                      className="quest-entry__indicator-icon"
                      aria-hidden="true"
                    >
                      <UnlockIcon />
                    </span>

                    <span>{unlock.name}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
