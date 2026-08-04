import { useMemo, useState } from 'react';

import { Link } from 'react-router';

import { useProgressStore } from '../../../core/progress/progressStore';

import { QuestDetailsDrawer } from '../components/QuestDetailsDrawer';
import { QuestEntry } from '../components/QuestEntry';

import type { QuestCategory } from '../data/questSchemas';

import { useQuestCatalog } from '../hooks/useQuestCatalog';

import { createAvailableQuestCatalog } from '../utilities/questAvailability';

import {
  comparePatchVersions,
  formatExpansionName,
  QUEST_CATEGORY_OPTIONS,
  QUEST_STATUS_OPTIONS,
  questMatchesSearch,
  questMatchesStatus,
  type QuestStatusFilter,
} from '../utilities/questPresentation';

import { getPreviousQuestIds } from '../utilities/questProgression';

import './QuestLogPage.css';

function formatVerificationStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function QuestLogPage() {
  const state = useQuestCatalog();

  const profile = useProgressStore((store) => store.profile);

  const toggleQuestCompletion = useProgressStore(
    (store) => store.toggleQuestCompletion,
  );

  const markQuestsComplete = useProgressStore(
    (store) => store.markQuestsComplete,
  );

  const setCurrentQuest = useProgressStore((store) => store.setCurrentQuest);

  const toggleQuestBookmark = useProgressStore(
    (store) => store.toggleQuestBookmark,
  );

  const setQuestNote = useProgressStore((store) => store.setQuestNote);

  const [searchQuery, setSearchQuery] = useState('');

  const [expansionFilter, setExpansionFilter] = useState('all');

  const [patchFilter, setPatchFilter] = useState('all');

  const [categoryFilter, setCategoryFilter] = useState<QuestCategory | 'all'>(
    'all',
  );

  const [statusFilter, setStatusFilter] = useState<QuestStatusFilter>('all');

  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);

  const [expandedCollectionIds, setExpandedCollectionIds] = useState<
    ReadonlySet<string>
  >(() => new Set());

  const [expandedGroupIds, setExpandedGroupIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const completedQuestIdSet = useMemo(
    () => new Set(profile.completedQuestIds),
    [profile.completedQuestIds],
  );

  const bookmarkedQuestIdSet = useMemo(
    () => new Set(profile.bookmarkedQuestIds),
    [profile.bookmarkedQuestIds],
  );

  const catalog = useMemo(() => {
    if (state.status !== 'success') {
      return null;
    }

    return createAvailableQuestCatalog(state.catalog, {
      startingCity: profile.startingCity,
    });
  }, [state, profile.startingCity]);

  const expansionOptions = useMemo(() => {
    if (!catalog) {
      return [];
    }

    const expansionIds = new Set<string>();

    for (const collection of catalog.collections) {
      if (collection.expansionId) {
        expansionIds.add(collection.expansionId);
      }
    }

    return Array.from(expansionIds).sort((left, right) =>
      formatExpansionName(left).localeCompare(formatExpansionName(right)),
    );
  }, [catalog]);

  const patchOptions = useMemo(() => {
    if (!catalog || expansionFilter === 'all') {
      return [];
    }

    const patches = new Set<string>();

    for (const collection of catalog.collections) {
      for (const group of collection.groups) {
        for (const quest of group.quests) {
          if (quest.expansionId !== expansionFilter) {
            continue;
          }

          patches.add(quest.patch);
        }
      }
    }

    return Array.from(patches).sort(comparePatchVersions);
  }, [catalog, expansionFilter]);

  const filteredCollections = useMemo(() => {
    if (!catalog) {
      return [];
    }

    const progressContext = {
      completedQuestIds: completedQuestIdSet,

      bookmarkedQuestIds: bookmarkedQuestIdSet,

      currentQuestId: profile.currentQuestId,
    };

    return catalog.collections
      .map((collection) => {
        const groups = collection.groups
          .map((group) => {
            const quests = group.quests.filter((quest) => {
              const matchesExpansion =
                expansionFilter === 'all' ||
                quest.expansionId === expansionFilter;

              const matchesPatch =
                patchFilter === 'all' || quest.patch === patchFilter;

              const matchesCategory =
                categoryFilter === 'all' || quest.category === categoryFilter;

              const matchesSearch = questMatchesSearch(quest, searchQuery);

              const matchesStatus = questMatchesStatus(
                quest,
                statusFilter,
                progressContext,
              );

              return (
                matchesExpansion &&
                matchesPatch &&
                matchesCategory &&
                matchesSearch &&
                matchesStatus
              );
            });

            return {
              group,
              quests,
            };
          })
          .filter(({ quests }) => quests.length > 0);

        return {
          collection,
          groups,
        };
      })
      .filter(({ groups }) => groups.length > 0);
  }, [
    catalog,
    expansionFilter,
    patchFilter,
    categoryFilter,
    searchQuery,
    statusFilter,
    completedQuestIdSet,
    bookmarkedQuestIdSet,
    profile.currentQuestId,
  ]);

  const visibleQuestCount = useMemo(
    () =>
      filteredCollections.reduce(
        (collectionTotal, { groups }) =>
          collectionTotal +
          groups.reduce(
            (groupTotal, { quests }) => groupTotal + quests.length,
            0,
          ),
        0,
      ),
    [filteredCollections],
  );

  const loadedCompletedCount = useMemo(() => {
    if (!catalog) {
      return 0;
    }

    return profile.completedQuestIds.filter((questId) =>
      catalog.questsById.has(questId),
    ).length;
  }, [catalog, profile.completedQuestIds]);

  const selectedQuest =
    catalog && selectedQuestId
      ? catalog.questsById.get(selectedQuestId)
      : undefined;

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    expansionFilter !== 'all' ||
    patchFilter !== 'all' ||
    categoryFilter !== 'all' ||
    statusFilter !== 'all';

  const shouldAutoExpandMatches =
    searchQuery.trim().length > 0 ||
    statusFilter === 'current' ||
    statusFilter === 'bookmarked';

  function toggleCollection(collectionId: string): void {
    setExpandedCollectionIds((current) => {
      const next = new Set(current);

      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }

      return next;
    });
  }

  function toggleGroup(groupKey: string): void {
    setExpandedGroupIds((current) => {
      const next = new Set(current);

      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }

      return next;
    });
  }

  function clearFilters(): void {
    setSearchQuery('');
    setExpansionFilter('all');
    setPatchFilter('all');
    setCategoryFilter('all');
    setStatusFilter('all');
  }

  function handleExpansionChange(expansionId: string): void {
    setExpansionFilter(expansionId);

    // A selected patch may not exist in the
    // newly selected expansion.
    setPatchFilter('all');
  }

  function handleSetCurrentQuest(questId: string): void {
    if (!catalog) {
      return;
    }

    if (profile.currentQuestId === questId) {
      setCurrentQuest(null);
      return;
    }

    const previousQuestIds = getPreviousQuestIds(questId, catalog.questsById);

    markQuestsComplete(previousQuestIds);

    setCurrentQuest(questId);
  }

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
            catalog &&
            `${loadedCompletedCount.toLocaleString()} / ${catalog.questCount.toLocaleString()} complete`}
        </div>
      </header>

      {profile.startingCity === null && (
        <section className="quest-path-notice">
          <div className="quest-path-notice__icon" aria-hidden="true">
            !
          </div>

          <div>
            <p className="quest-path-notice__eyebrow">Character route needed</p>

            <h2>Select your starting city</h2>

            <p>
              Early ARR quests differ between Gridania, Limsa Lominsa, and
              Ul&apos;dah. Restricted quest collections remain hidden until your
              route is configured.
            </p>

            <Link to="/profile">Configure profile</Link>
          </div>
        </section>
      )}

      {state.status === 'loading' && (
        <section className="quest-data-state">
          <div className="quest-data-state__spinner" aria-hidden="true" />

          <div>
            <p className="quest-data-state__eyebrow">Loading dataset</p>

            <h2>Preparing the quest catalog</h2>

            <p>
              The manifest and every enabled quest collection are being loaded
              and validated.
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
            <p className="quest-data-state__eyebrow">Validation failed</p>

            <h2>The quest catalog could not be loaded</h2>

            <pre>{state.error}</pre>
          </div>
        </section>
      )}

      {state.status === 'success' && catalog && (
        <>
          <section className="quest-toolbar" aria-label="Quest filters">
            <label className="quest-filter quest-filter--search">
              <span>Search</span>

              <input
                type="search"
                value={searchQuery}
                placeholder="Quest, duty, unlock, NPC, zone, item..."
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                }}
              />
            </label>

            <div className="quest-toolbar__selects">
              <label className="quest-filter">
                <span>Expansion</span>

                <select
                  value={expansionFilter}
                  onChange={(event) => {
                    handleExpansionChange(event.target.value);
                  }}
                >
                  <option value="all">All expansions</option>

                  {expansionOptions.map((expansionId) => (
                    <option key={expansionId} value={expansionId}>
                      {formatExpansionName(expansionId)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="quest-filter">
                <span>Patch</span>

                <select
                  value={patchFilter}
                  disabled={expansionFilter === 'all'}
                  onChange={(event) => {
                    setPatchFilter(event.target.value);
                  }}
                >
                  <option value="all">
                    {expansionFilter === 'all'
                      ? 'Select an expansion first'
                      : 'All expansion patches'}
                  </option>

                  {patchOptions.map((patch) => (
                    <option key={patch} value={patch}>
                      Patch {patch}
                    </option>
                  ))}
                </select>
              </label>

              <label className="quest-filter">
                <span>Category</span>

                <select
                  value={categoryFilter}
                  onChange={(event) => {
                    setCategoryFilter(
                      event.target.value as QuestCategory | 'all',
                    );
                  }}
                >
                  <option value="all">All categories</option>

                  {QUEST_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="quest-filter">
                <span>Progress</span>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value as QuestStatusFilter);
                  }}
                >
                  {QUEST_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="quest-toolbar__summary">
              <p>
                {visibleQuestCount.toLocaleString()} of{' '}
                {catalog.questCount.toLocaleString()} quests shown
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
              {filteredCollections.map(({ collection, groups }) => {
                const collectionQuests = collection.groups.flatMap(
                  (group) => group.quests,
                );

                const completedCollectionCount = collectionQuests.filter(
                  (quest) => completedQuestIdSet.has(quest.id),
                ).length;

                const visibleCollectionCount = groups.reduce(
                  (total, { quests }) => total + quests.length,
                  0,
                );

                const isCollectionExpanded =
                  shouldAutoExpandMatches ||
                  expandedCollectionIds.has(collection.id);

                return (
                  <section
                    key={collection.id}
                    className={[
                      'quest-collection',
                      isCollectionExpanded ? 'quest-collection--expanded' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <header className="quest-collection__header">
                      <div>
                        <p className="quest-collection__eyebrow">
                          {collection.expansionId
                            ? formatExpansionName(collection.expansionId)
                            : 'Quest Collection'}

                          {collection.patch && ` · Patch ${collection.patch}`}
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

                      <div className="quest-collection__header-actions">
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

                        {visibleCollectionCount !== collectionQuests.length && (
                          <span className="quest-collection__visible-count">
                            {visibleCollectionCount} shown
                          </span>
                        )}

                        <button
                          className="quest-collection__collapse-button"
                          type="button"
                          aria-expanded={isCollectionExpanded}
                          aria-label={
                            isCollectionExpanded
                              ? `Collapse ${collection.title}`
                              : `Expand ${collection.title}`
                          }
                          title={
                            shouldAutoExpandMatches
                              ? 'Expanded automatically to show matching quests'
                              : undefined
                          }
                          disabled={shouldAutoExpandMatches}
                          onClick={() => {
                            toggleCollection(collection.id);
                          }}
                        >
                          <span
                            className={[
                              'quest-collection__chevron',
                              isCollectionExpanded
                                ? 'quest-collection__chevron--open'
                                : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            aria-hidden="true"
                          >
                            ›
                          </span>
                        </button>
                      </div>
                    </header>

                    {isCollectionExpanded && (
                      <div className="quest-groups">
                        {groups.map(({ group, quests }) => {
                          const groupKey = `${collection.id}:${group.id}`;

                          const isGroupExpanded =
                            shouldAutoExpandMatches ||
                            expandedGroupIds.has(groupKey);

                          const completedGroupCount = group.quests.filter(
                            (quest) => completedQuestIdSet.has(quest.id),
                          ).length;

                          return (
                            <section key={group.id} className="quest-group">
                              <button
                                className="quest-group__toggle"
                                type="button"
                                aria-expanded={isGroupExpanded}
                                disabled={shouldAutoExpandMatches}
                                title={
                                  shouldAutoExpandMatches
                                    ? 'Expanded automatically to show matching quests'
                                    : undefined
                                }
                                onClick={() => {
                                  toggleGroup(groupKey);
                                }}
                              >
                                <span className="quest-group__title">
                                  <span className="quest-group__eyebrow">
                                    Quest Range
                                  </span>

                                  <strong>{group.title}</strong>
                                </span>

                                <span className="quest-group__summary">
                                  <span>
                                    {completedGroupCount} /{' '}
                                    {group.quests.length} complete
                                  </span>

                                  {quests.length !== group.quests.length && (
                                    <span>{quests.length} shown</span>
                                  )}

                                  <span
                                    className={[
                                      'quest-group__chevron',
                                      isGroupExpanded
                                        ? 'quest-group__chevron--open'
                                        : '',
                                    ]
                                      .filter(Boolean)
                                      .join(' ')}
                                    aria-hidden="true"
                                  >
                                    ›
                                  </span>
                                </span>
                              </button>

                              {isGroupExpanded && (
                                <div className="quest-group__entries">
                                  {quests.map((quest) => (
                                    <QuestEntry
                                      key={quest.id}
                                      quest={quest}
                                      isCompleted={completedQuestIdSet.has(
                                        quest.id,
                                      )}
                                      isCurrent={
                                        profile.currentQuestId === quest.id
                                      }
                                      isBookmarked={bookmarkedQuestIdSet.has(
                                        quest.id,
                                      )}
                                      onToggleCompletion={() => {
                                        toggleQuestCompletion(quest.id);
                                      }}
                                      onToggleCurrent={() => {
                                        handleSetCurrentQuest(quest.id);
                                      }}
                                      onToggleBookmark={() => {
                                        toggleQuestBookmark(quest.id);
                                      }}
                                      onOpenDetails={() => {
                                        setSelectedQuestId(quest.id);
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                            </section>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          ) : (
            <section className="quest-empty-results">
              <div aria-hidden="true">◇</div>

              <h2>No quests match these filters</h2>

              <p>
                Try a broader search or clear the active expansion, patch,
                category, and progress filters.
              </p>

              <button type="button" onClick={clearFilters}>
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
          isCompleted={completedQuestIdSet.has(selectedQuest.id)}
          isCurrent={profile.currentQuestId === selectedQuest.id}
          isBookmarked={bookmarkedQuestIdSet.has(selectedQuest.id)}
          personalNote={profile.questNotes[selectedQuest.id] ?? ''}
          onClose={() => {
            setSelectedQuestId(null);
          }}
          onToggleCompletion={() => {
            toggleQuestCompletion(selectedQuest.id);
          }}
          onToggleCurrent={() => {
            handleSetCurrentQuest(selectedQuest.id);
          }}
          onToggleBookmark={() => {
            toggleQuestBookmark(selectedQuest.id);
          }}
          onSaveNote={(note) => {
            setQuestNote(selectedQuest.id, note);
          }}
        />
      )}
    </div>
  );
}
