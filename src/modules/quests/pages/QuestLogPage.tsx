import type { Quest } from '../data/questSchemas';
import { useQuestCatalog } from '../hooks/useQuestCatalog';

import './QuestLogPage.css';

function formatVerificationStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function QuestEntry({ quest }: { quest: Quest }) {
  return (
    <article className="quest-entry">
      <div className="quest-entry__main">
        <label className="quest-entry__check">
          <input
            type="checkbox"
            disabled
            aria-label={`Mark ${quest.name} complete`}
          />

          <span className="quest-entry__custom-check" aria-hidden="true" />
        </label>

        <div className="quest-entry__content">
          <div className="quest-entry__heading">
            <h4>{quest.name}</h4>

            <span className="quest-entry__level">
              Level {quest.level}
            </span>
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

  const questCount =
    state.status === 'success' ? state.catalog.questCount : 0;

  return (
    <div className="quest-log-page">
      <header className="page-header">
        <div>
          <p className="page-header__eyebrow">Progression</p>

          <h1>Quest Log</h1>

          <p className="page-header__description">
            Track the main scenario and every class, job, crafting, and
            gathering quest.
          </p>
        </div>

        <div className="page-header__badge">
          {state.status === 'loading' && 'Loading quest data'}
          {state.status === 'error' && 'Quest data error'}
          {state.status === 'success' &&
            `${questCount.toLocaleString()} quests loaded`}
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
              The manifest and every enabled quest collection are being
              loaded and validated.
            </p>
          </div>
        </section>
      )}

      {state.status === 'error' && (
        <section className="quest-data-state quest-data-state--error">
          <div className="quest-data-state__icon" aria-hidden="true">
            !
          </div>

          <div className="quest-data-state__error-content">
            <p className="quest-data-state__eyebrow">
              Validation failed
            </p>

            <h2>The quest catalog could not be loaded</h2>

            <pre>{state.error}</pre>
          </div>
        </section>
      )}

      {state.status === 'success' && (
        <div className="quest-collections">
          {state.catalog.collections.map((collection) => (
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
                {collection.groups.map((group) => (
                  <section key={group.id} className="quest-group">
                    <header className="quest-group__header">
                      <div>
                        <p className="quest-group__eyebrow">
                          Quest Range
                        </p>

                        <h3>{group.title}</h3>
                      </div>

                      <span className="quest-group__count">
                        {group.quests.length}{' '}
                        {group.quests.length === 1
                          ? 'quest'
                          : 'quests'}
                      </span>
                    </header>

                    <div className="quest-group__entries">
                      {group.quests.map((quest) => (
                        <QuestEntry key={quest.id} quest={quest} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}