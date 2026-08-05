import type { KeyboardEvent, MouseEvent } from 'react';

import type { Quest } from '../data/questSchemas';

import { formatQuestCategory } from '../utilities/questPresentation';

import './QuestEntry.css';

interface QuestEntryProps {
  quest: Quest;

  isCompleted: boolean;
  isCurrent: boolean;
  isBookmarked: boolean;

  onToggleCompletion: () => void;
  onToggleCurrent: () => void;
  onToggleBookmark: () => void;
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

function getUnlockIcon(type: string): string {
  const normalizedType = type.toLocaleLowerCase('en-US');

  if (
    normalizedType.includes('dungeon') ||
    normalizedType.includes('trial') ||
    normalizedType.includes('raid') ||
    normalizedType.includes('duty')
  ) {
    return '⚔';
  }

  if (normalizedType.includes('emote')) {
    return '☺';
  }

  if (normalizedType.includes('mount-speed')) {
    return '⇧';
  }

  if (normalizedType.includes('mount')) {
    return '◆';
  }

  if (normalizedType.includes('action') || normalizedType.includes('ability')) {
    return '✦';
  }

  return '◇';
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
  isBookmarked,
  onToggleCompletion,
  onToggleCurrent,
  onToggleBookmark,
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

            <div className="quest-entry__actions">
              <button
                className={[
                  'quest-entry__bookmark-button',
                  isBookmarked ? 'quest-entry__bookmark-button--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                type="button"
                aria-label={
                  isBookmarked
                    ? `Remove ${quest.name} bookmark`
                    : `Bookmark ${quest.name}`
                }
                aria-pressed={isBookmarked}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark quest'}
                onClick={onToggleBookmark}
              >
                <span aria-hidden="true">{isBookmarked ? '★' : '☆'}</span>
              </button>

              <button
                className={[
                  'quest-entry__current-button',
                  isCurrent ? 'quest-entry__current-button--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                type="button"
                aria-pressed={isCurrent}
                title={
                  isCurrent
                    ? 'Clear the current quest'
                    : 'Set current and mark all previous quests complete'
                }
                onClick={onToggleCurrent}
              >
                {isCurrent ? 'Current' : 'Set current'}
              </button>
            </div>
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
                    XP
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
                    G
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
                    ⚔
                  </span>

                  <span>{duty.name}</span>
                </span>
              ))}

              {additionalUnlocks.map((unlock) => (
                <span
                  key={`${unlock.type}-${unlock.targetId ?? unlock.name}`}
                  className="quest-entry__indicator quest-entry__indicator--unlock"
                  title={`Unlocks ${formatUnlockType(unlock.type)}: ${unlock.name}`}
                >
                  <span
                    className="quest-entry__indicator-icon"
                    aria-hidden="true"
                  >
                    {getUnlockIcon(unlock.type)}
                  </span>

                  <span>{unlock.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
