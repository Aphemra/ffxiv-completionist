import { useMemo, useState } from 'react';

import {
  AlertTriangle,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  SearchX,
} from 'lucide-react';

import { Link } from 'react-router';

import { useProgressStore } from '../../../core/progress/progressStore';

import { AnimatedCollapse } from '../../../shared/components/AnimatedCollapse';

import { QuestDetailsDrawer } from '../components/QuestDetailsDrawer';
import { QuestEntry } from '../components/QuestEntry';

import { useQuestFilterStore } from '../state/questFilterStore';

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
  QUEST_FAMILY_OPTIONS,
  questCategoryMatchesFamily,
  questMatchesFamily,
  questMatchesSearch,
  type QuestFamily,
} from '../utilities/questPresentation';

import {
  getAutomaticCurrentQuestId,
  getPreviousQuestIds,
} from '../utilities/questProgression';

import './QuestLogPage.css';

function getQuestSectionId(
  collection: Pick<
    QuestCollection,
    'id' | 'category' | 'expansionId' | 'patch'
  >,
): string {
  if (collection.category !== 'msq') {
    return `collection:${collection.id}`;
  }

  return [
    collection.category,
    collection.expansionId ?? 'unknown-expansion',
    collection.patch ?? 'unknown-patch',
  ].join(':');
}

function formatPatchTitle(
  patch: string,
  expansionId: string | undefined,
  manifestTitle?: string,
): string {
  const patchLabel = `Patch ${patch}`;

  if (patch.endsWith('.0') && expansionId) {
    return `${patchLabel} - ${formatExpansionName(expansionId)}`;
  }

  const normalizedManifestTitle = manifestTitle?.trim();

  return normalizedManifestTitle || patchLabel;
}

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

  const setQuestNote = useProgressStore((store) => store.setQuestNote);

  const [searchQuery, setSearchQuery] = useState('');

  const categoryFilter = useQuestFilterStore((store) => store.categoryFilter);

  const primaryFilter = useQuestFilterStore((store) => store.primaryFilter);

  const secondaryFilter = useQuestFilterStore((store) => store.secondaryFilter);

  const showCompleted = useQuestFilterStore((store) => store.showCompleted);

  const setCategoryFilter = useQuestFilterStore(
    (store) => store.setCategoryFilter,
  );

  const setPrimaryFilter = useQuestFilterStore(
    (store) => store.setPrimaryFilter,
  );

  const setSecondaryFilter = useQuestFilterStore(
    (store) => store.setSecondaryFilter,
  );

  const setShowCompleted = useQuestFilterStore(
    (store) => store.setShowCompleted,
  );

  const resetFilters = useQuestFilterStore((store) => store.resetFilters);

  const selectedQuestFamily =
    QUEST_FAMILY_OPTIONS.find((option) => option.value === categoryFilter) ??
    QUEST_FAMILY_OPTIONS[0];

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

  const automaticCurrentQuestId = useMemo(
    () =>
      catalog
        ? getAutomaticCurrentQuestId(
            catalog.collections,
            profile.completedQuestIds,
          )
        : null,
    [catalog, profile.completedQuestIds],
  );

  const questsByPatchSectionId = useMemo(() => {
    const questsBySectionId = new Map<string, Quest[]>();

    if (!catalog) {
      return questsBySectionId;
    }

    for (const collection of catalog.collections) {
      const sectionId = getQuestSectionId(collection);

      const sectionQuests = questsBySectionId.get(sectionId) ?? [];

      sectionQuests.push(...collection.groups.flatMap((group) => group.quests));

      questsBySectionId.set(sectionId, sectionQuests);
    }

    return questsBySectionId;
  }, [catalog]);

  const expansionOptions = useMemo(() => {
    if (!catalog) {
      return [];
    }

    const expansionIds = new Set<string>();

    for (const collection of catalog.collections) {
      if (collection.category === 'msq' && collection.expansionId) {
        expansionIds.add(collection.expansionId);
      }
    }

    return Array.from(expansionIds);
  }, [catalog]);

  const patchOptions = useMemo(() => {
    if (!catalog || categoryFilter !== 'msq' || primaryFilter === 'all') {
      return [];
    }

    const patches = new Map<string, string>();

    for (const collection of catalog.collections) {
      if (
        collection.category !== 'msq' ||
        collection.expansionId !== primaryFilter ||
        !collection.patch ||
        patches.has(collection.patch)
      ) {
        continue;
      }

      patches.set(
        collection.patch,
        formatPatchTitle(
          collection.patch,
          collection.expansionId,
          collection.title,
        ),
      );
    }

    return Array.from(patches, ([value, label]) => ({
      value,
      label,
    })).sort((left, right) => comparePatchVersions(left.value, right.value));
  }, [catalog, categoryFilter, primaryFilter]);

  const nonMsqPrimaryOptions = useMemo(() => {
    if (!catalog || categoryFilter === 'msq') {
      return [];
    }

    const options = new Map<string, string>();

    for (const collection of catalog.collections) {
      if (!questCategoryMatchesFamily(collection.category, categoryFilter)) {
        continue;
      }

      const primaryFacet = collection.filterFacets?.primary;

      if (!primaryFacet) {
        continue;
      }

      options.set(primaryFacet.id, primaryFacet.name);
    }

    return Array.from(options, ([value, label]) => ({
      value,
      label,
    })).sort((left, right) => left.label.localeCompare(right.label));
  }, [catalog, categoryFilter]);

  const nonMsqSecondaryOptions = useMemo(() => {
    if (!catalog || categoryFilter === 'msq' || primaryFilter === 'all') {
      return [];
    }

    const options = new Map<string, string>();

    for (const collection of catalog.collections) {
      if (
        !questCategoryMatchesFamily(collection.category, categoryFilter) ||
        collection.filterFacets?.primary.id !== primaryFilter
      ) {
        continue;
      }

      const secondaryFacet = collection.filterFacets.secondary;

      options.set(secondaryFacet.id, secondaryFacet.name);
    }

    return Array.from(options, ([value, label]) => ({
      value,
      label,
    })).sort((left, right) => left.label.localeCompare(right.label));
  }, [catalog, categoryFilter, primaryFilter]);

  const primaryFilterOptions =
    categoryFilter === 'msq'
      ? expansionOptions.map((expansionId) => ({
          value: expansionId,
          label: formatExpansionName(expansionId),
        }))
      : nonMsqPrimaryOptions;

  const secondaryFilterOptions =
    categoryFilter === 'msq' ? patchOptions : nonMsqSecondaryOptions;

  const filteredCollections = useMemo(() => {
    if (!catalog) {
      return [];
    }

    return catalog.collections
      .map((collection) => {
        const groups = collection.groups
          .map((group) => {
            const quests = group.quests.filter((quest) => {
              const matchesCategory = questMatchesFamily(quest, categoryFilter);

              const matchesPrimaryFilter =
                primaryFilter === 'all' ||
                (categoryFilter === 'msq'
                  ? quest.expansionId === primaryFilter
                  : collection.filterFacets?.primary.id === primaryFilter);

              const matchesSecondaryFilter =
                secondaryFilter === 'all' ||
                (categoryFilter === 'msq'
                  ? quest.patch === secondaryFilter
                  : collection.filterFacets?.secondary.id === secondaryFilter);

              const matchesSearch = questMatchesSearch(quest, searchQuery);

              const matchesCompletion =
                showCompleted || !completedQuestIdSet.has(quest.id);

              return (
                matchesCategory &&
                matchesPrimaryFilter &&
                matchesSecondaryFilter &&
                matchesSearch &&
                matchesCompletion
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
    categoryFilter,
    primaryFilter,
    secondaryFilter,
    searchQuery,
    completedQuestIdSet,
    showCompleted,
  ]);

  const patchSections = useMemo(() => {
    const sections = new Map<
      string,
      {
        id: string;
        title: string;
        expansionId: string | undefined;
        patch: string | undefined;
        category: QuestCategory;
        sortOrder: number;
        ranges: typeof filteredCollections;
      }
    >();

    for (const filteredCollection of filteredCollections) {
      const { collection } = filteredCollection;

      const sectionId = getQuestSectionId(collection);

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
        title: collection.title,
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
    categoryFilter !== 'msq' ||
    primaryFilter !== 'all' ||
    secondaryFilter !== 'all' ||
    !showCompleted;

  const shouldAutoExpandMatches = searchQuery.trim().length > 0;

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
    resetFilters();
  }

  function handleToggleQuestCompletion(quest: Quest): void {
    if (!catalog || completedQuestIdSet.has(quest.id)) {
      toggleQuestCompletion(quest.id);
      return;
    }

    const previousQuestIds = getPreviousQuestIds(
      quest.id,
      catalog.questsById,
      completedQuestIdSet,
    );

    markQuestsComplete([...previousQuestIds, quest.id]);
  }

  function renderQuestEntry(quest: Quest) {
    return (
      <QuestEntry
        key={quest.id}
        quest={quest}
        isCompleted={completedQuestIdSet.has(quest.id)}
        isCurrent={automaticCurrentQuestId === quest.id}
        onToggleCompletion={() => {
          handleToggleQuestCompletion(quest);
        }}
        onOpenDetails={() => {
          setSelectedQuestId(quest.id);
        }}
      />
    );
  }

  const primaryAllLabel =
    categoryFilter === 'msq'
      ? 'All expansions'
      : `All ${selectedQuestFamily.primaryFilterLabel.toLowerCase()} options`;

  const secondaryAllLabel =
    categoryFilter === 'msq'
      ? 'All expansion patches'
      : `All ${selectedQuestFamily.secondaryFilterLabel.toLowerCase()} options`;

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
            <AlertTriangle />
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
              <AlertTriangle />
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
            <div className="quest-toolbar__primary">
              <div className="quest-toolbar__primary-heading">
                <span>Search</span>

                <small>
                  {visibleQuestCount.toLocaleString()} of{' '}
                  {catalog.questCount.toLocaleString()} quests shown
                </small>
              </div>

              <label className="quest-filter quest-filter--search">
                <input
                  type="search"
                  aria-label="Search quests"
                  value={searchQuery}
                  placeholder="Quest, duty, unlock, NPC, zone, item..."
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                  }}
                />
              </label>

              <button
                className="quest-toolbar__completed-button"
                type="button"
                onClick={() => {
                  setShowCompleted(!showCompleted);
                }}
              >
                {showCompleted ? (
                  <EyeOff aria-hidden="true" />
                ) : (
                  <Eye aria-hidden="true" />
                )}

                <span>
                  {showCompleted ? 'Hide completed' : 'Show completed'}
                </span>
              </button>

              <button
                className="quest-toolbar__clear-button"
                type="button"
                disabled={!hasActiveFilters}
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>

            <div className="quest-toolbar__selects">
              <label className="quest-filter">
                <span>Category</span>

                <select
                  value={categoryFilter}
                  onChange={(event) => {
                    setCategoryFilter(event.target.value as QuestFamily);
                  }}
                >
                  {QUEST_FAMILY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="quest-filter">
                <span>{selectedQuestFamily.primaryFilterLabel}</span>

                <select
                  value={primaryFilter}
                  disabled={primaryFilterOptions.length === 0}
                  onChange={(event) => {
                    setPrimaryFilter(event.target.value);
                  }}
                >
                  <option value="all">
                    {primaryFilterOptions.length === 0
                      ? `No ${selectedQuestFamily.primaryFilterLabel.toLowerCase()} data loaded`
                      : primaryAllLabel}
                  </option>

                  {primaryFilterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="quest-filter">
                <span>{selectedQuestFamily.secondaryFilterLabel}</span>

                <select
                  value={secondaryFilter}
                  disabled={
                    primaryFilter === 'all' ||
                    secondaryFilterOptions.length === 0
                  }
                  onChange={(event) => {
                    setSecondaryFilter(event.target.value);
                  }}
                >
                  <option value="all">
                    {primaryFilter === 'all'
                      ? `Select a ${selectedQuestFamily.primaryFilterLabel.toLowerCase()} first`
                      : secondaryFilterOptions.length === 0
                        ? `No ${selectedQuestFamily.secondaryFilterLabel.toLowerCase()} data loaded`
                        : secondaryAllLabel}
                  </option>

                  {secondaryFilterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {patchSections.length > 0 ? (
            <div className="quest-collections">
              {patchSections.map((section) => {
                const sectionQuests =
                  questsByPatchSectionId.get(section.id) ?? [];

                const completedSectionCount = sectionQuests.filter((quest) =>
                  completedQuestIdSet.has(quest.id),
                ).length;

                const isPatchComplete =
                  sectionQuests.length > 0 &&
                  completedSectionCount === sectionQuests.length;

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

                const representativeCollection = section.ranges[0]?.collection;

                const isMainScenarioSection = section.category === 'msq';

                const sectionContext = isMainScenarioSection
                  ? section.expansionId
                    ? formatExpansionName(section.expansionId)
                    : 'Main Scenario'
                  : (representativeCollection?.filterFacets?.primary.name ??
                    formatQuestCategory(section.category));

                const sectionName =
                  isMainScenarioSection && section.patch
                    ? formatPatchTitle(
                        section.patch,
                        section.expansionId,
                        section.title,
                      )
                    : section.title;

                const sectionDescription =
                  isMainScenarioSection && section.patch
                    ? `${
                        section.expansionId
                          ? formatExpansionName(section.expansionId)
                          : 'Main scenario'
                      } ${formatQuestCategory(section.category).toLowerCase()} quests introduced in Patch ${section.patch}.`
                    : (representativeCollection?.description ??
                      `${formatQuestCategory(section.category)} collection.`);

                const visibleGroups = section.ranges.flatMap(
                  ({ collection, groups }) =>
                    groups.map(({ group, quests }) => ({
                      collection,
                      group,
                      quests,
                    })),
                );

                const onlyGroup =
                  visibleGroups.length === 1 ? visibleGroups[0] : undefined;

                return (
                  <section
                    key={section.id}
                    className={[
                      'quest-collection',
                      isPatchExpanded ? 'quest-collection--expanded' : '',
                      isPatchComplete ? 'quest-collection--complete' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <header className="quest-collection__header">
                      <div>
                        <p className="quest-collection__eyebrow">
                          {sectionContext} ·{' '}
                          {formatQuestCategory(section.category)}
                        </p>

                        <h2>{sectionName}</h2>

                        <p className="quest-collection__description">
                          {sectionDescription}
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
                              ? `Collapse ${sectionName}`
                              : `Expand ${sectionName}`
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
                            <ChevronRight />
                          </span>
                        </button>
                      </div>
                    </header>

                    <AnimatedCollapse
                      isOpen={isPatchExpanded}
                      className="quest-collection__content"
                      unmountOnExit
                    >
                      {onlyGroup ? (
                        <div className="quest-group__entries quest-group__entries--single-range">
                          {onlyGroup.quests.map(renderQuestEntry)}
                        </div>
                      ) : (
                        <div className="quest-groups">
                          {visibleGroups.map(
                            ({ collection, group, quests }) => {
                              const rangeKey = `${section.id}:${collection.id}:${group.id}`;

                              const rangeQuests = group.quests;

                              const visibleRangeQuests = quests;

                              const completedRangeCount = rangeQuests.filter(
                                (quest) => completedQuestIdSet.has(quest.id),
                              ).length;

                              const isRangeComplete =
                                rangeQuests.length > 0 &&
                                completedRangeCount === rangeQuests.length;

                              const isRangeExpanded =
                                shouldAutoExpandMatches ||
                                expandedRangeIds.has(rangeKey);

                              return (
                                <section
                                  key={rangeKey}
                                  className={[
                                    'quest-group',
                                    isRangeComplete
                                      ? 'quest-group--complete'
                                      : '',
                                  ]
                                    .filter(Boolean)
                                    .join(' ')}
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

                                      <strong>{group.title}</strong>
                                    </span>

                                    <span className="quest-group__summary">
                                      {isRangeComplete && (
                                        <span className="quest-group__complete-marker">
                                          <Check aria-hidden="true" />
                                          Complete
                                        </span>
                                      )}

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
                                        <ChevronRight />
                                      </span>
                                    </span>
                                  </button>

                                  <AnimatedCollapse
                                    isOpen={isRangeExpanded}
                                    className="quest-group__content"
                                    unmountOnExit
                                  >
                                    <div className="quest-group__entries">
                                      {visibleRangeQuests.map(renderQuestEntry)}
                                    </div>
                                  </AnimatedCollapse>
                                </section>
                              );
                            },
                          )}
                        </div>
                      )}
                    </AnimatedCollapse>
                  </section>
                );
              })}
            </div>
          ) : (
            <section className="quest-empty-results">
              <div aria-hidden="true">
                <SearchX />
              </div>

              <h2>No quests match these filters</h2>

              <p>
                Try a broader search, show completed quests, or clear the active
                filters.
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
          isCurrent={automaticCurrentQuestId === selectedQuest.id}
          personalNote={profile.questNotes[selectedQuest.id] ?? ''}
          onClose={() => {
            setSelectedQuestId(null);
          }}
          onToggleCompletion={() => {
            handleToggleQuestCompletion(selectedQuest);
          }}
          onSaveNote={(note) => {
            setQuestNote(selectedQuest.id, note);
          }}
        />
      )}
    </div>
  );
}
