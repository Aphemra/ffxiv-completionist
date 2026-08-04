import { useState } from 'react';
import { Link } from 'react-router';

import {
  createAvailableQuestCatalog,
} from '../utilities/questAvailability';

import { useProgressStore } from '../../../core/progress/progressStore';

import { QuestDetailsDrawer } from '../components/QuestDetailsDrawer';
import { QuestEntry } from '../components/QuestEntry';

import type {
  QuestCategory,
} from '../data/questSchemas';

import { useQuestCatalog } from '../hooks/useQuestCatalog';

import {
  QUEST_CATEGORY_OPTIONS,
  QUEST_STATUS_OPTIONS,
  questMatchesSearch,
  questMatchesStatus,
  type QuestStatusFilter,
} from '../utilities/questPresentation';

import './QuestLogPage.css';

function formatVerificationStatus(
  status: string,
): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function QuestLogPage() {
  const state = useQuestCatalog();

  const profile = useProgressStore(
    (store) => store.profile,
  );

  const toggleQuestCompletion = useProgressStore(
    (store) => store.toggleQuestCompletion,
  );

  const setCurrentQuest = useProgressStore(
    (store) => store.setCurrentQuest,
  );

  const toggleQuestBookmark = useProgressStore(
    (store) => store.toggleQuestBookmark,
  );

  const setQuestNote = useProgressStore(
    (store) => store.setQuestNote,
  );

  const [searchQuery, setSearchQuery] =
    useState('');

  const [categoryFilter, setCategoryFilter] =
    useState<QuestCategory | 'all'>('all');

  const [statusFilter, setStatusFilter] =
    useState<QuestStatusFilter>('all');

  const [selectedQuestId, setSelectedQuestId] =
    useState<string | null>(null);

  const [
    collapsedGroupIds,
    setCollapsedGroupIds,
  ] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const completedQuestIdSet = new Set(
    profile.completedQuestIds,
  );

  const bookmarkedQuestIdSet = new Set(
    profile.bookmarkedQuestIds,
  );

const catalog =
  state.status === 'success'
    ? createAvailableQuestCatalog(
        state.catalog,
        {
          startingCity: profile.startingCity,
        },
      )
    : null;

  const filteredCollections =
    catalog?.collections
      .map((collection) => {
        const groups = collection.groups
          .map((group) => {
            const quests = group.quests.filter(
              (quest) => {
                const matchesCategory =
                  categoryFilter === 'all' ||
                  quest.category === categoryFilter;

                const matchesSearch =
                  questMatchesSearch(
                    quest,
                    searchQuery,
                  );

                const matchesStatus =
                  questMatchesStatus(
                    quest,
                    statusFilter,
                    {
                      completedQuestIds:
                        completedQuestIdSet,

                      bookmarkedQuestIds:
                        bookmarkedQuestIdSet,

                      currentQuestId:
                        profile.currentQuestId,
                    },
                  );

                return (
                  matchesCategory &&
                  matchesSearch &&
                  matchesStatus
                );
              },
            );

            return {
              group,
              quests,
            };
          })
          .filter(
            ({ quests }) => quests.length > 0,
          );

        return {
          collection,
          groups,
        };
      })
      .filter(({ groups }) => groups.length > 0) ??
    [];

  const visibleQuestCount =
    filteredCollections.reduce(
      (collectionTotal, { groups }) =>
        collectionTotal +
        groups.reduce(
          (groupTotal, { quests }) =>
            groupTotal + quests.length,
          0,
        ),
      0,
    );

  const loadedCompletedCount = catalog
    ? profile.completedQuestIds.filter(
        (questId) =>
          catalog.questsById.has(questId),
      ).length
    : 0;

  const selectedQuest =
    catalog && selectedQuestId
      ? catalog.questsById.get(selectedQuestId)
      : undefined;

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    categoryFilter !== 'all' ||
    statusFilter !== 'all';

  function toggleGroup(groupKey: string) {
    setCollapsedGroupIds((current) => {
      const next = new Set(current);

      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }

      return next;
    });
  }

  function clearFilters() {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
  }

  return (
    <div className="quest-log-page">
      <header className="page-header">
        <div>
          <p className="page-header__eyebrow">
            Progression
          </p>

          <h1>Quest Log</h1>

          <p className="page-header__description">
            Track the main scenario and every class,
            job, crafting, and gathering quest.
          </p>
        </div>

        <div className="page-header__badge">
          {state.status === 'loading' &&
            'Loading quest data'}

          {state.status === 'error' &&
            'Quest data error'}

          {state.status === 'success' &&
  catalog &&
  `${loadedCompletedCount.toLocaleString()} / ${catalog.questCount.toLocaleString()} complete`}
        </div>
      </header>

      {profile.startingCity === null && (
  <section className="quest-path-notice">
    <div
      className="quest-path-notice__icon"
      aria-hidden="true"
    >
      !
    </div>

    <div>
      <p className="quest-path-notice__eyebrow">
        Character route needed
      </p>

      <h2>Select your starting city</h2>

      <p>
        Early ARR quests differ between Gridania,
        Limsa Lominsa, and Ul&apos;dah. Restricted
        quest collections will remain hidden until
        your route is configured.
      </p>

      <Link to="/profile">
        Configure profile
      </Link>
    </div>
  </section>
)}

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
              The manifest and every enabled quest
              collection are being loaded and
              validated.
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
        <>
          <section
            className="quest-toolbar"
            aria-label="Quest filters"
          >
            <label className="quest-filter quest-filter--search">
              <span>Search</span>

              <input
                type="search"
                value={searchQuery}
                placeholder="Quest, duty, unlock, NPC, zone, item..."
                onChange={(event) => {
                  setSearchQuery(
                    event.target.value,
                  );
                }}
              />
            </label>

            <div className="quest-toolbar__selects">
              <label className="quest-filter">
                <span>Category</span>

                <select
                  value={categoryFilter}
                  onChange={(event) => {
                    setCategoryFilter(
                      event.target.value as
                        | QuestCategory
                        | 'all',
                    );
                  }}
                >
                  <option value="all">
                    All categories
                  </option>

                  {QUEST_CATEGORY_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="quest-filter">
                <span>Progress</span>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(
                      event.target
                        .value as QuestStatusFilter,
                    );
                  }}
                >
                  {QUEST_STATUS_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>

            <div className="quest-toolbar__summary">
              <p>
                {visibleQuestCount.toLocaleString()} of{' '}
                {catalog?.questCount.toLocaleString() ?? 0}{' '}
                quests shown
              </p>

              <button
                type="button"
                disabled={!hasActiveFilters}
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          </section>

          {filteredCollections.length > 0 ? (
            <div className="quest-collections">
              {filteredCollections.map(
                ({ collection, groups }) => {
                  const collectionQuests =
                    collection.groups.flatMap(
                      (group) => group.quests,
                    );

                  const completedCollectionCount =
                    collectionQuests.filter(
                      (quest) =>
                        completedQuestIdSet.has(
                          quest.id,
                        ),
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

                          <h2>
                            {collection.title}
                          </h2>

                          <p className="quest-collection__description">
                            {collection.description}
                          </p>

                          <p className="quest-collection__progress">
                            {
                              completedCollectionCount
                            }{' '}
                            of{' '}
                            {
                              collectionQuests.length
                            }{' '}
                            complete
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
                        {groups.map(
                          ({ group, quests }) => {
                            const groupKey = `${collection.id}:${group.id}`;

                            const isCollapsed =
                              collapsedGroupIds.has(
                                groupKey,
                              );

                            const completedGroupCount =
                              group.quests.filter(
                                (quest) =>
                                  completedQuestIdSet.has(
                                    quest.id,
                                  ),
                              ).length;

                            return (
                              <section
                                key={group.id}
                                className="quest-group"
                              >
                                <button
                                  className="quest-group__toggle"
                                  type="button"
                                  aria-expanded={
                                    !isCollapsed
                                  }
                                  onClick={() => {
                                    toggleGroup(
                                      groupKey,
                                    );
                                  }}
                                >
                                  <span className="quest-group__title">
                                    <span className="quest-group__eyebrow">
                                      Quest Range
                                    </span>

                                    <strong>
                                      {group.title}
                                    </strong>
                                  </span>

                                  <span className="quest-group__summary">
                                    <span>
                                      {
                                        completedGroupCount
                                      }{' '}
                                      /{' '}
                                      {
                                        group.quests
                                          .length
                                      }{' '}
                                      complete
                                    </span>

                                    {quests.length !==
                                      group.quests
                                        .length && (
                                      <span>
                                        {quests.length}{' '}
                                        shown
                                      </span>
                                    )}

                                    <span
                                      className={[
                                        'quest-group__chevron',
                                        isCollapsed
                                          ? ''
                                          : 'quest-group__chevron--open',
                                      ]
                                        .filter(
                                          Boolean,
                                        )
                                        .join(' ')}
                                      aria-hidden="true"
                                    >
                                      ›
                                    </span>
                                  </span>
                                </button>

                                {!isCollapsed && (
                                  <div className="quest-group__entries">
                                    {quests.map(
                                      (quest) => (
                                        <QuestEntry
                                          key={
                                            quest.id
                                          }
                                          quest={
                                            quest
                                          }
                                          isCompleted={completedQuestIdSet.has(
                                            quest.id,
                                          )}
                                          isCurrent={
                                            profile.currentQuestId ===
                                            quest.id
                                          }
                                          isBookmarked={bookmarkedQuestIdSet.has(
                                            quest.id,
                                          )}
                                          onToggleCompletion={() => {
                                            toggleQuestCompletion(
                                              quest.id,
                                            );
                                          }}
                                          onToggleCurrent={() => {
                                            setCurrentQuest(
                                              profile.currentQuestId ===
                                                quest.id
                                                ? null
                                                : quest.id,
                                            );
                                          }}
                                          onToggleBookmark={() => {
                                            toggleQuestBookmark(
                                              quest.id,
                                            );
                                          }}
                                          onOpenDetails={() => {
                                            setSelectedQuestId(
                                              quest.id,
                                            );
                                          }}
                                        />
                                      ),
                                    )}
                                  </div>
                                )}
                              </section>
                            );
                          },
                        )}
                      </div>
                    </section>
                  );
                },
              )}
            </div>
          ) : (
            <section className="quest-empty-results">
              <div aria-hidden="true">◇</div>

              <h2>No quests match these filters</h2>

              <p>
                Try a broader search or clear the
                active category and progress filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </section>
          )}
        </>
      )}

      {selectedQuest && catalog && (
        <QuestDetailsDrawer
          quest={selectedQuest}
          questsById={catalog.questsById}
          isCompleted={completedQuestIdSet.has(
            selectedQuest.id,
          )}
          isCurrent={
            profile.currentQuestId ===
            selectedQuest.id
          }
          isBookmarked={bookmarkedQuestIdSet.has(
            selectedQuest.id,
          )}
          personalNote={
            profile.questNotes[
              selectedQuest.id
            ] ?? ''
          }
          onClose={() => {
            setSelectedQuestId(null);
          }}
          onToggleCompletion={() => {
            toggleQuestCompletion(
              selectedQuest.id,
            );
          }}
          onToggleCurrent={() => {
            setCurrentQuest(
              profile.currentQuestId ===
                selectedQuest.id
                ? null
                : selectedQuest.id,
            );
          }}
          onToggleBookmark={() => {
            toggleQuestBookmark(
              selectedQuest.id,
            );
          }}
          onSaveNote={(note) => {
            setQuestNote(
              selectedQuest.id,
              note,
            );
          }}
        />
      )}
    </div>
  );
}