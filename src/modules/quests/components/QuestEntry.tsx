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
  return (
    <article
      className={[
        'quest-entry',
        isCompleted ? 'quest-entry--complete' : '',
        isCurrent ? 'quest-entry--current' : '',
      ]
        .filter(Boolean)
        .join(' ')}
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
                onClick={onToggleCurrent}
              >
                {isCurrent ? 'Current' : 'Set current'}
              </button>

              <button
                className="quest-entry__details-button"
                type="button"
                onClick={onOpenDetails}
              >
                Details
              </button>
            </div>
          </div>

          {quest.duties && quest.duties.length > 0 && (
            <div className="quest-entry__metadata" aria-label="Quest duties">
              {quest.duties.map((duty) => (
                <span
                  key={duty.id}
                  className="quest-entry__tag quest-entry__tag--duty"
                >
                  {duty.type}: {duty.name}
                </span>
              ))}
            </div>
          )}

          {quest.unlocks && quest.unlocks.length > 0 && (
            <div className="quest-entry__metadata" aria-label="Quest unlocks">
              {quest.unlocks.map((unlock) => (
                <span
                  key={`${unlock.type}-${unlock.targetId ?? unlock.name}`}
                  className="quest-entry__tag"
                >
                  Unlocks: {unlock.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
