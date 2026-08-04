import { useProgressStore } from '../../../core/progress/progressStore';

import type { Quest } from '../data/questSchemas';
import { useQuestCatalog } from '../hooks/useQuestCatalog';

import './QuestLogPage.css';

function formatVerificationStatus(
  status: string,
): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

interface QuestEntryProps {
  quest: Quest;
  isCompleted: boolean;
  isCurrent: boolean;
  onToggleCompletion: () => void;
  onToggleCurrent: () => void;
}

function QuestEntry({
  quest,
  isCompleted,
  isCurrent,
  onToggleCompletion,
  onToggleCurrent,
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

          <span
            className="quest-entry__custom-check"
            aria-hidden="true"
          />
        </label>

        <div className="quest-entry__content">
          <div className="quest-entry__heading">
            <h4>{quest.name}</h4>

            <div className="quest-entry__actions">
              <span className="quest-entry__level">
                Level {quest.level}
              </span>

              <button
                className={[
                  'quest-entry__current-button',
                  isCurrent
                    ? 'quest-entry__current-button--active'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                type="button"
                aria-pressed={isCurrent}
                onClick={onToggleCurrent}
              >
                {isCurrent ? 'Current' : 'Set current'}
              </button>
            </div>
          </div>

          {quest.duties && quest.duties.length > 0 && (
            <div
              className="quest-entry__metadata"
              aria-label="Quest duties"
            >
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
            <div
              className="quest-entry__metadata"
              aria-label="Quest unlocks"
            >
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

export function QuestLogPage() {
  const state = useQuestCatalog();

  const completedQuestIds = useProgressStore(
    (store) => store.profile.completedQuestIds,
  );

  const currentQuestId = useProgressStore(
    (store) => store.profile.currentQuestId,
  );

  const toggleQuestCompletion = useProgressStore(
    (store) => store.toggleQuestCompletion,
  );

  const setCurrentQuest = useProgressStore(
    (store) => store.setCurrentQuest,
  );

  const completedQuestIdSet = new Set(
    completedQuestIds,
  );

  const loadedCompletedCount =
    state.status === 'success'
      ? completedQuestIds.filter((questId) =>
          state.catalog.questsById.has(questId),
        ).length
      : 0;

  return (
    <div className="quest-log-page">
      <header className="page-header">
        <div>
          <p className="page-header__eyebrow">
            Progression
          </p>

          <h1>Quest Log</h1>

          <p className="page-header__description">
            Track the main scenario and every class, job,
            crafting, and gathering quest.
          </p>
        </div>

        <div className="page-header__badge">
          {state.status === 'loading' &&
            'Loading quest data'}

          {state.status === 'error' &&
            'Quest data error'}

          {state.status === 'success' &&
            `${loadedCompletedCount.toLocaleString()} / ${state.catalog.questCount.toLocaleString()} complete`}
        </div>
      </header>

      {state.status === 'loading' && (
        <section className="quest-data-state">
          <div
            className="quest-data-state__spinner"
            aria-hidden="true"
          />

          <div>
            <p className="quest-data-state__eyebrow">
              Loading dataset
            </p>

            <h2>Preparing the quest catalog</h2>

            <p>
              The manifest and every enabled quest collection
              are being loaded and validated.
            </p>
          </div>
        </section>
      )}

      {state.status === 'error' && (
        <section className="quest-data-state quest-data-state--error">
          <div
            className="quest-data-state__icon"
            aria-hidden="true"
          >
            !
          </div>

          <div className="quest-data-state__error-content">
            <p className="quest-data-state__eyebrow">
              Validation failed
            </p>

            <h2>
              The quest catalog could not be loaded
            </h2>

            <pre>{state.error}</pre>
          </div>
        </section>
      )}

      {state.status === 'success' && (
        <div className="quest-collections">
          {state.catalog.collections.map(
            (collection) => {
              const collectionQuests =
                collection.groups.flatMap(
                  (group) => group.quests,
                );

              const completedCollectionCount =
                collectionQuests.filter((quest) =>
                  completedQuestIdSet.has(quest.id),
                ).length;

              return (
                <section
                  key={collection.id}
                  className="quest-collection"
                >
                  <header className="quest-collection__header">
                    <div>
                      <p className="quest-collection__eyebrow">
                        {collection.expansionId?.toUpperCase() ??
                          'Quest Collection'}

                        {collection.patch &&
                          ` · Patch ${collection.patch}`}
                      </p>

                      <h2>{collection.title}</h2>

                      <p className="quest-collection__description">
                        {collection.description}
                      </p>

                      <p className="quest-collection__progress">
                        {completedCollectionCount} of{' '}
                        {collectionQuests.length} complete
                      </p>
                    </div>

                    <span
                      className={[
                        'quest-collection__status',
                        `quest-collection__status--${collection.verificationStatus}`,
                      ].join(' ')}
                    >
                      {formatVerificationStatus(
                        collection.verificationStatus,
                      )}
                    </span>
                  </header>

                  <div className="quest-groups">
                    {collection.groups.map((group) => {
                      const completedGroupCount =
                        group.quests.filter((quest) =>
                          completedQuestIdSet.has(
                            quest.id,
                          ),
                        ).length;

                      return (
                        <section
                          key={group.id}
                          className="quest-group"
                        >
                          <header className="quest-group__header">
                            <div>
                              <p className="quest-group__eyebrow">
                                Quest Range
                              </p>

                              <h3>{group.title}</h3>
                            </div>

                            <span className="quest-group__count">
                              {completedGroupCount} /{' '}
                              {group.quests.length} complete
                            </span>
                          </header>

                          <div className="quest-group__entries">
                            {group.quests.map((quest) => (
                              <QuestEntry
                                key={quest.id}
                                quest={quest}
                                isCompleted={completedQuestIdSet.has(
                                  quest.id,
                                )}
                                isCurrent={
                                  currentQuestId === quest.id
                                }
                                onToggleCompletion={() => {
                                  toggleQuestCompletion(
                                    quest.id,
                                  );
                                }}
                                onToggleCurrent={() => {
                                  setCurrentQuest(
                                    currentQuestId ===
                                      quest.id
                                      ? null
                                      : quest.id,
                                  );
                                }}
                              />
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                </section>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}