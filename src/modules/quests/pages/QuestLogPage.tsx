import { useMemo, useState } from 'react';

import { Link } from 'react-router';

import { useProgressStore } from '../../../core/progress/progressStore';

import { QuestDetailsDrawer } from '../components/QuestDetailsDrawer';
import { QuestEntry } from '../components/QuestEntry';

import type {
  Quest,
  QuestCategory,
  QuestCollection,
} from '../data/questSchemas';

import { useQuestCatalog } from '../hooks/useQuestCatalog';

import { createAvailableQuestCatalog } from '../utilities/questAvailability';

import {
  comparePatchVersions,
  formatExpansionName,
  formatQuestCategory,
  QUEST_CATEGORY_OPTIONS,
  QUEST_STATUS_OPTIONS,
  questMatchesSearch,
  questMatchesStatus,
  type QuestStatusFilter,
} from '../utilities/questPresentation';

import { getPreviousQuestIds } from '../utilities/questProgression';

import './QuestLogPage.css';

function formatVerificationStatus(status: string): string {
  return status
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const VERIFICATION_STATUS_ORDER: ReadonlyArray<
  QuestCollection['verificationStatus']
> = ['incomplete', 'partially-complete', 'in-review', 'verified'];

function getCombinedVerificationStatus(
  statuses: ReadonlyArray<QuestCollection['verificationStatus']>,
): QuestCollection['verificationStatus'] {
  return (
    VERIFICATION_STATUS_ORDER.find((status) => statuses.includes(status)) ??
    'incomplete'
  );
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

  const [expandedPatchIds, setExpandedPatchIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const [expandedRangeIds, setExpandedRangeIds] = useState<ReadonlySet<string>>(
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

      initialGrandCompany: profile.initialGrandCompany,

      currentGrandCompany: profile.currentGrandCompany,
    });
  }, [
    state,
    profile.startingCity,
    profile.initialGrandCompany,
    profile.currentGrandCompany,
  ]);

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

  const patchSections = useMemo(() => {
    const sections = new Map<
      string,
      {
        id: string;
        expansionId: string | undefined;
        patch: string | undefined;
        category: QuestCategory;
        sortOrder: number;
        ranges: typeof filteredCollections;
      }
    >();

    for (const filteredCollection of filteredCollections) {
      const { collection } = filteredCollection;

      const sectionId = [
        collection.category,
        collection.expansionId ?? 'unknown-expansion',
        collection.patch ?? 'unknown-patch',
      ].join(':');

      const existingSection = sections.get(sectionId);

      if (existingSection) {
        existingSection.ranges.push(filteredCollection);
        existingSection.sortOrder = Math.min(
          existingSection.sortOrder,
          collection.sortOrder,
        );

        continue;
      }

      sections.set(sectionId, {
        id: sectionId,
        expansionId: collection.expansionId,
        patch: collection.patch,
        category: collection.category,
        sortOrder: collection.sortOrder,
        ranges: [filteredCollection],
      });
    }

    return Array.from(sections.values()).sort(
      (left, right) => left.sortOrder - right.sortOrder,
    );
  }, [filteredCollections]);

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

  function togglePatch(patchId: string): void {
    setExpandedPatchIds((current) => {
      const next = new Set(current);

      if (next.has(patchId)) {
        next.delete(patchId);
      } else {
        next.add(patchId);
      }

      return next;
    });
  }

  function toggleRange(rangeId: string): void {
    setExpandedRangeIds((current) => {
      const next = new Set(current);

      if (next.has(rangeId)) {
        next.delete(rangeId);
      } else {
        next.add(rangeId);
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

    const previousQuestIds = getPreviousQuestIds(
      questId,
      catalog.questsById,
      completedQuestIdSet,
    );

    markQuestsComplete(previousQuestIds);

    setCurrentQuest(questId);
  }

  function renderQuestEntry(quest: Quest) {
    return (
      <QuestEntry
        key={quest.id}
        quest={quest}
        isCompleted={completedQuestIdSet.has(quest.id)}
        isCurrent={profile.currentQuestId === quest.id}
        isBookmarked={bookmarkedQuestIdSet.has(quest.id)}
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
    );
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

      {profile.startingCity !== null &&
        profile.initialGrandCompany === null && (
          <section className="quest-path-notice">
            <div className="quest-path-notice__icon" aria-hidden="true">
              !
            </div>

            <div>
              <p className="quest-path-notice__eyebrow">
                Grand Company route needed
              </p>

              <h2>Select your initial Grand Company</h2>

              <p>
                ARR includes a mutually exclusive Grand Company story branch.
                Those quests remain hidden until the company originally chosen
                by this character is configured.
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

          {patchSections.length > 0 ? (
            <div className="quest-collections">
              {patchSections.map((section) => {
                const sectionQuests = section.ranges.flatMap(({ collection }) =>
                  collection.groups.flatMap((group) => group.quests),
                );

                const completedSectionCount = sectionQuests.filter((quest) =>
                  completedQuestIdSet.has(quest.id),
                ).length;

                const visibleSectionCount = section.ranges.reduce(
                  (rangeTotal, { groups }) =>
                    rangeTotal +
                    groups.reduce(
                      (groupTotal, { quests }) => groupTotal + quests.length,
                      0,
                    ),
                  0,
                );

                const verificationStatus = getCombinedVerificationStatus(
                  section.ranges.map(
                    ({ collection }) => collection.verificationStatus,
                  ),
                );

                const isPatchExpanded =
                  shouldAutoExpandMatches || expandedPatchIds.has(section.id);

                const expansionName = section.expansionId
                  ? formatExpansionName(section.expansionId)
                  : 'Quest Collection';

                const patchName = section.patch
                  ? `Patch ${section.patch}`
                  : 'Unassigned Patch';

                const onlyRange =
                  section.ranges.length === 1 ? section.ranges[0] : undefined;

                const onlyRangeVisibleQuests = onlyRange
                  ? onlyRange.groups.flatMap(({ quests }) => quests)
                  : [];

                return (
                  <section
                    key={section.id}
                    className={[
                      'quest-collection',
                      isPatchExpanded ? 'quest-collection--expanded' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <header className="quest-collection__header">
                      <div>
                        <p className="quest-collection__eyebrow">
                          {expansionName} ·{' '}
                          {formatQuestCategory(section.category)}
                        </p>

                        <h2>{patchName}</h2>

                        <p className="quest-collection__description">
                          {expansionName}{' '}
                          {formatQuestCategory(section.category).toLowerCase()}{' '}
                          quests introduced in {patchName}.
                        </p>

                        <p className="quest-collection__progress">
                          {completedSectionCount} of {sectionQuests.length}{' '}
                          complete
                        </p>
                      </div>

                      <div className="quest-collection__header-actions">
                        <span
                          className={[
                            'quest-collection__status',
                            `quest-collection__status--${verificationStatus}`,
                          ].join(' ')}
                        >
                          {formatVerificationStatus(verificationStatus)}
                        </span>

                        {visibleSectionCount !== sectionQuests.length && (
                          <span className="quest-collection__visible-count">
                            {visibleSectionCount} shown
                          </span>
                        )}

                        <button
                          className="quest-collection__collapse-button"
                          type="button"
                          aria-expanded={isPatchExpanded}
                          aria-label={
                            isPatchExpanded
                              ? `Collapse ${patchName}`
                              : `Expand ${patchName}`
                          }
                          title={
                            shouldAutoExpandMatches
                              ? 'Expanded automatically to show matching quests'
                              : undefined
                          }
                          disabled={shouldAutoExpandMatches}
                          onClick={() => {
                            togglePatch(section.id);
                          }}
                        >
                          <span
                            className={[
                              'quest-collection__chevron',
                              isPatchExpanded
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

                    {isPatchExpanded &&
                      (onlyRange ? (
                        <div className="quest-group__entries quest-group__entries--single-range">
                          {onlyRangeVisibleQuests.map(renderQuestEntry)}
                        </div>
                      ) : (
                        <div className="quest-groups">
                          {section.ranges.map(({ collection, groups }) => {
                            const rangeKey = `${section.id}:${collection.id}`;

                            const rangeQuests = collection.groups.flatMap(
                              (group) => group.quests,
                            );

                            const visibleRangeQuests = groups.flatMap(
                              ({ quests }) => quests,
                            );

                            const completedRangeCount = rangeQuests.filter(
                              (quest) => completedQuestIdSet.has(quest.id),
                            ).length;

                            const isRangeExpanded =
                              shouldAutoExpandMatches ||
                              expandedRangeIds.has(rangeKey);

                            return (
                              <section
                                key={collection.id}
                                className="quest-group"
                              >
                                <button
                                  className="quest-group__toggle"
                                  type="button"
                                  aria-expanded={isRangeExpanded}
                                  disabled={shouldAutoExpandMatches}
                                  title={
                                    shouldAutoExpandMatches
                                      ? 'Expanded automatically to show matching quests'
                                      : undefined
                                  }
                                  onClick={() => {
                                    toggleRange(rangeKey);
                                  }}
                                >
                                  <span className="quest-group__title">
                                    <span className="quest-group__eyebrow">
                                      Quest Range
                                    </span>

                                    <strong>{collection.title}</strong>
                                  </span>

                                  <span className="quest-group__summary">
                                    <span>
                                      {completedRangeCount} /{' '}
                                      {rangeQuests.length} complete
                                    </span>

                                    {visibleRangeQuests.length !==
                                      rangeQuests.length && (
                                      <span>
                                        {visibleRangeQuests.length} shown
                                      </span>
                                    )}

                                    <span
                                      className={[
                                        'quest-group__chevron',
                                        isRangeExpanded
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

                                {isRangeExpanded && (
                                  <div className="quest-group__entries">
                                    {visibleRangeQuests.map(renderQuestEntry)}
                                  </div>
                                )}
                              </section>
                            );
                          })}
                        </div>
                      ))}
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
          key={selectedQuest.id}
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
