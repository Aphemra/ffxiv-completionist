import { useEffect, useRef, useState } from 'react';

import type { Quest, QuestRequirement } from '../data/questSchemas';

import { formatQuestCategory } from '../utilities/questPresentation';

import './QuestDetailsDrawer.css';

interface QuestDetailsDrawerProps {
  quest: Quest;
  questsById: ReadonlyMap<string, Quest>;

  isCompleted: boolean;
  isCurrent: boolean;
  isBookmarked: boolean;

  personalNote: string;

  onClose: () => void;
  onToggleCompletion: () => void;
  onToggleCurrent: () => void;
  onToggleBookmark: () => void;
  onSaveNote: (note: string) => void;
}

function formatQuality(quality: 'normal' | 'high-quality' | 'either'): string {
  switch (quality) {
    case 'normal':
      return 'Normal quality';

    case 'high-quality':
      return 'High quality';

    case 'either':
      return 'Any quality';
  }
}

function formatRequirement(requirement: QuestRequirement): {
  title: string;
  detail: string;
} {
  switch (requirement.type) {
    case 'class-job-level':
      return {
        title: `${requirement.classJobName} level ${requirement.level}`,
        detail: requirement.notes ?? 'Class or job level requirement.',
      };

    case 'item':
      return {
        title: `${requirement.quantity}× ${requirement.itemName}`,
        detail: [formatQuality(requirement.quality), requirement.notes]
          .filter(Boolean)
          .join(' · '),
      };

    case 'craft':
      return {
        title: `${requirement.quantity}× ${requirement.itemName}`,
        detail: [
          `${requirement.craftingJobName} craft`,
          requirement.recipeLevel
            ? `Recipe level ${requirement.recipeLevel}`
            : undefined,
          formatQuality(requirement.quality),
          requirement.notes,
        ]
          .filter(Boolean)
          .join(' · '),
      };

    case 'gather':
      return {
        title: `${requirement.quantity}× ${requirement.itemName}`,
        detail: [
          `Gather with ${requirement.gatheringJobName}`,
          requirement.gatheringLevel
            ? `Gathering level ${requirement.gatheringLevel}`
            : undefined,
          formatQuality(requirement.quality),
          requirement.notes,
        ]
          .filter(Boolean)
          .join(' · '),
      };

    case 'feature':
      return {
        title: requirement.name,
        detail: requirement.notes ?? 'Required game feature or system.',
      };
  }
}

function getRelatedQuestName(
  questId: string,
  questsById: ReadonlyMap<string, Quest>,
): string {
  return questsById.get(questId)?.name ?? questId;
}

export function QuestDetailsDrawer({
  quest,
  questsById,
  isCompleted,
  isCurrent,
  isBookmarked,
  personalNote,
  onClose,
  onToggleCompletion,
  onToggleCurrent,
  onToggleBookmark,
  onSaveNote,
}: QuestDetailsDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [noteDraft, setNoteDraft] = useState(personalNote);

  const [noteMessage, setNoteMessage] = useState('');

  useEffect(() => {
    setNoteDraft(personalNote);
    setNoteMessage('');
  }, [personalNote, quest.id]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  function handleSaveNote() {
    const trimmedNote = noteDraft.trim();

    onSaveNote(trimmedNote);
    setNoteDraft(trimmedNote);
    setNoteMessage(trimmedNote.length > 0 ? 'Note saved.' : 'Note removed.');
  }

  const hasRewards =
    quest.rewards &&
    (quest.rewards.experience !== undefined ||
      quest.rewards.gil !== undefined ||
      (quest.rewards.items && quest.rewards.items.length > 0) ||
      (quest.rewards.optionalItems && quest.rewards.optionalItems.length > 0));

  return (
    <div
      className="quest-details-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <aside
        className="quest-details"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quest-details-title"
      >
        <header className="quest-details__header">
          <div>
            <p className="quest-details__eyebrow">
              {quest.expansionId.toUpperCase()} · Patch {quest.patch}
            </p>

            <h2 id="quest-details-title">{quest.name}</h2>

            <p className="quest-details__subtitle">
              Level {quest.level} · {formatQuestCategory(quest.category)}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            className="quest-details__close"
            type="button"
            aria-label="Close quest details"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="quest-details__actions">
          <button
            className={[
              'quest-details__action',
              isCompleted ? 'quest-details__action--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            type="button"
            aria-pressed={isCompleted}
            onClick={onToggleCompletion}
          >
            {isCompleted ? 'Completed' : 'Mark complete'}
          </button>

          <button
            className={[
              'quest-details__action',
              isCurrent ? 'quest-details__action--active' : '',
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
            {isCurrent ? 'Current quest' : 'Set current'}
          </button>

          <button
            className={[
              'quest-details__action',
              isBookmarked ? 'quest-details__action--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            type="button"
            aria-pressed={isBookmarked}
            onClick={onToggleBookmark}
          >
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
        </div>

        <div className="quest-details__body">
          {quest.start && (
            <section className="quest-details__section">
              <header>
                <p>Starting Point</p>
                <h3>Where to begin</h3>
              </header>

              <dl className="quest-details__facts">
                <div>
                  <dt>NPC</dt>
                  <dd>{quest.start.npcName}</dd>
                </div>

                {quest.start.zoneName && (
                  <div>
                    <dt>Zone</dt>
                    <dd>{quest.start.zoneName}</dd>
                  </div>
                )}

                {quest.start.coordinates && (
                  <div>
                    <dt>Coordinates</dt>
                    <dd>
                      X: {quest.start.coordinates.x.toFixed(1)}, Y:{' '}
                      {quest.start.coordinates.y.toFixed(1)}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          <section className="quest-details__section">
            <header>
              <p>Requirements</p>
              <h3>Before starting</h3>
            </header>

            {quest.requirements && quest.requirements.length > 0 ? (
              <div className="quest-details__list">
                {quest.requirements.map((requirement, index) => {
                  const formatted = formatRequirement(requirement);

                  return (
                    <article
                      key={`${requirement.type}-${index}`}
                      className="quest-details__list-item"
                    >
                      <strong>{formatted.title}</strong>

                      <span>{formatted.detail}</span>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="quest-details__empty">
                No detailed requirement data has been entered for this quest
                yet.
              </p>
            )}
          </section>

          {quest.duties && quest.duties.length > 0 && (
            <section className="quest-details__section">
              <header>
                <p>Instanced Content</p>
                <h3>Duties</h3>
              </header>

              <div className="quest-details__list">
                {quest.duties.map((duty) => (
                  <article key={duty.id} className="quest-details__list-item">
                    <strong>{duty.name}</strong>

                    <span>
                      Level {duty.level} · {duty.type}
                      {duty.minimumItemLevel !== undefined &&
                        ` · Minimum item level ${duty.minimumItemLevel}`}
                      {duty.dutySupportAvailable === true &&
                        ' · Duty Support available'}
                    </span>

                    {duty.notes && <span>{duty.notes}</span>}
                  </article>
                ))}
              </div>
            </section>
          )}

          {quest.unlocks && quest.unlocks.length > 0 && (
            <section className="quest-details__section">
              <header>
                <p>Progression</p>
                <h3>Unlocks</h3>
              </header>

              <div className="quest-details__list">
                {quest.unlocks.map((unlock) => (
                  <article
                    key={`${unlock.type}-${unlock.targetId ?? unlock.name}`}
                    className="quest-details__list-item"
                  >
                    <strong>{unlock.name}</strong>

                    <span>{unlock.type}</span>

                    {unlock.notes && <span>{unlock.notes}</span>}
                  </article>
                ))}
              </div>
            </section>
          )}

          {hasRewards && quest.rewards && (
            <section className="quest-details__section">
              <header>
                <p>Completion</p>
                <h3>Rewards</h3>
              </header>

              <dl className="quest-details__facts">
                {quest.rewards.experience !== undefined && (
                  <div>
                    <dt>Experience</dt>
                    <dd>{quest.rewards.experience.toLocaleString()}</dd>
                  </div>
                )}

                {quest.rewards.gil !== undefined && (
                  <div>
                    <dt>Gil</dt>
                    <dd>{quest.rewards.gil.toLocaleString()}</dd>
                  </div>
                )}
              </dl>

              {quest.rewards.items && quest.rewards.items.length > 0 && (
                <div className="quest-details__list">
                  {quest.rewards.items.map((item) => (
                    <article
                      key={item.itemId}
                      className="quest-details__list-item"
                    >
                      <strong>{item.itemName}</strong>
                      <span>Quantity: {item.quantity}</span>
                    </article>
                  ))}
                </div>
              )}

              {quest.rewards.optionalItems &&
                quest.rewards.optionalItems.length > 0 && (
                  <div className="quest-details__relationship">
                    <h4>Choose one</h4>

                    <div className="quest-details__list">
                      {quest.rewards.optionalItems.map((item, index) => (
                        <article
                          key={`${item.itemId}-${item.stainId ?? 'unstained'}-${index}`}
                          className="quest-details__list-item"
                        >
                          <strong>{item.itemName}</strong>
                          <span>Quantity: {item.quantity}</span>

                          {item.notes && <span>{item.notes}</span>}
                        </article>
                      ))}
                    </div>
                  </div>
                )}
            </section>
          )}

          {((quest.prerequisiteQuestIds &&
            quest.prerequisiteQuestIds.length > 0) ||
            (quest.nextQuestIds && quest.nextQuestIds.length > 0)) && (
            <section className="quest-details__section">
              <header>
                <p>Quest Chain</p>
                <h3>Related quests</h3>
              </header>

              {quest.prerequisiteQuestIds &&
                quest.prerequisiteQuestIds.length > 0 && (
                  <div className="quest-details__relationship">
                    <h4>
                      Previous{' '}
                      {quest.prerequisiteQuestMode === 'any'
                        ? '(complete any one)'
                        : '(all required)'}
                    </h4>

                    <ul>
                      {quest.prerequisiteQuestIds.map((questId) => (
                        <li key={questId}>
                          {getRelatedQuestName(questId, questsById)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {quest.nextQuestIds && quest.nextQuestIds.length > 0 && (
                <div className="quest-details__relationship">
                  <h4>Next</h4>

                  <ul>
                    {quest.nextQuestIds.map((questId) => (
                      <li key={questId}>
                        {getRelatedQuestName(questId, questsById)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {quest.notes && quest.notes.length > 0 && (
            <section className="quest-details__section">
              <header>
                <p>Game Information</p>
                <h3>Notes</h3>
              </header>

              <div className="quest-details__list">
                {quest.notes.map((note, index) => (
                  <article
                    key={`${note.type}-${index}`}
                    className={[
                      'quest-details__game-note',
                      `quest-details__game-note--${note.type}`,
                    ].join(' ')}
                  >
                    <strong>{note.type}</strong>
                    <span>{note.text}</span>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="quest-details__section">
            <header>
              <p>Personal Tracking</p>
              <h3>Your note</h3>
            </header>

            <textarea
              className="quest-details__note"
              value={noteDraft}
              maxLength={5000}
              placeholder="Add reminders, preparation notes, or anything else you want to remember about this quest."
              onChange={(event) => {
                setNoteDraft(event.target.value);
                setNoteMessage('');
              }}
            />

            <div className="quest-details__note-actions">
              <button
                className="quest-details__save-note"
                type="button"
                onClick={handleSaveNote}
              >
                Save note
              </button>

              <p aria-live="polite">{noteMessage}</p>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
