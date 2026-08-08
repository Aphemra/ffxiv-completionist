import type { ReactNode } from 'react';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Coins,
  Crosshair,
  Gift,
  GitBranch,
  Info,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  StickyNote,
  Swords,
  TrendingUp,
  X,
  type LucideIcon,
} from 'lucide-react';

import { isQuestCompletionEligible } from '../utilities/questCompletion';

import { AnimatedCollapse } from '../../../shared/components/AnimatedCollapse';

import type { Quest, QuestItem, QuestRequirement } from '../data/questSchemas';

import { formatQuestCategory } from '../utilities/questPresentation';

import './QuestDetailsDrawer.css';

const DRAWER_EXIT_DURATION_MS = 240;

interface QuestDetailsDrawerProps {
  quest: Quest;
  questsById: ReadonlyMap<string, Quest>;

  isCompleted: boolean;
  isCurrent: boolean;

  personalNote: string;

  onClose: () => void;
  onToggleCompletion: () => void;
  onSaveNote: (note: string) => void;
}

interface FormattedEntry {
  title: string;
  detail?: string;
  badge?: string;
}

interface DetailRowProps extends FormattedEntry {
  icon: LucideIcon;
  tone?: 'default' | 'accent' | 'blue' | 'success';
}

interface DetailSectionProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  count?: string;
  children: ReactNode;
}

interface CollapsibleDetailSectionProps extends DetailSectionProps {
  initiallyOpen?: boolean;
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

function formatLabel(value: string): string {
  return value
    .split('-')
    .map((segment) =>
      segment.length > 0
        ? segment[0]?.toUpperCase() + segment.slice(1)
        : segment,
    )
    .join(' ');
}

function formatSentenceCase(value: string): string {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return value;
  }

  return trimmedValue.charAt(0).toUpperCase() + trimmedValue.slice(1);
}

function formatRequirement(requirement: QuestRequirement): FormattedEntry {
  switch (requirement.type) {
    case 'class-job-level':
      return {
        title: requirement.classJobName,
        detail: requirement.notes ?? `Level ${requirement.level} required`,
        badge: `LV ${requirement.level}`,
      };

    case 'item':
      return {
        title: `${requirement.quantity}× ${requirement.itemName}`,
        detail: [formatQuality(requirement.quality), requirement.notes]
          .filter(Boolean)
          .join(' · '),
        badge: 'Bring',
      };

    case 'craft':
      return {
        title: `${requirement.quantity}× ${requirement.itemName}`,
        detail: [
          requirement.craftingJobName,
          requirement.recipeLevel
            ? `Recipe level ${requirement.recipeLevel}`
            : undefined,
          formatQuality(requirement.quality),
          requirement.notes,
        ]
          .filter(Boolean)
          .join(' · '),
        badge: 'Craft',
      };

    case 'gather':
      return {
        title: `${requirement.quantity}× ${requirement.itemName}`,
        detail: [
          requirement.gatheringJobName,
          requirement.gatheringLevel
            ? `Gathering level ${requirement.gatheringLevel}`
            : undefined,
          formatQuality(requirement.quality),
          requirement.notes,
        ]
          .filter(Boolean)
          .join(' · '),
        badge: 'Gather',
      };

    case 'feature':
      return {
        title: requirement.name,
        detail: requirement.notes ?? 'Required game feature',
        badge: 'Required',
      };
  }
}

function formatQuestItem(item: QuestItem): FormattedEntry {
  const usageDetails: Record<QuestItem['usage'], string> = {
    'required-before-starting': 'Bring this before starting',

    'obtained-during-quest': 'Obtained during this quest',

    'used-during-quest': 'Used during this quest',

    'turn-in': 'Turn in during this quest',

    equip: 'Equip during this quest',

    craft: 'Craft for this quest',

    gather: 'Gather for this quest',

    unknown: 'Item involved in this quest',
  };

  const usageBadges: Record<QuestItem['usage'], string> = {
    'required-before-starting': 'Bring',
    'obtained-during-quest': 'Obtain',
    'used-during-quest': 'Use',
    'turn-in': 'Turn in',
    equip: 'Equip',
    craft: 'Craft',
    gather: 'Gather',
    unknown: 'Quest item',
  };

  return {
    title:
      item.quantity !== undefined
        ? `${item.quantity}× ${item.itemName}`
        : item.itemName,

    detail: [
      usageDetails[item.usage],

      item.quality ? formatQuality(item.quality) : undefined,

      item.notes,
    ]
      .filter(Boolean)
      .join(' · '),

    badge: usageBadges[item.usage],
  };
}

function getRelatedQuestName(
  questId: string,
  questsById: ReadonlyMap<string, Quest>,
): string {
  return questsById.get(questId)?.name ?? questId;
}

function DetailRow({
  icon: Icon,
  title,
  detail,
  badge,
  tone = 'default',
}: DetailRowProps) {
  return (
    <article
      className={['quest-details__row', `quest-details__row--${tone}`].join(
        ' ',
      )}
    >
      <span className="quest-details__row-icon" aria-hidden="true">
        <Icon />
      </span>

      <span className="quest-details__row-copy">
        <strong>{title}</strong>

        {detail && <span>{detail}</span>}
      </span>

      {badge && <span className="quest-details__row-badge">{badge}</span>}
    </article>
  );
}

function DetailSection({
  icon: Icon,
  eyebrow,
  title,
  count,
  children,
}: DetailSectionProps) {
  return (
    <section className="quest-details__section">
      <header className="quest-details__section-header">
        <span className="quest-details__section-icon" aria-hidden="true">
          <Icon />
        </span>

        <span className="quest-details__section-title">
          <span>{eyebrow}</span>
          <strong>{title}</strong>
        </span>

        {count && <span className="quest-details__section-count">{count}</span>}
      </header>

      {children}
    </section>
  );
}

function CollapsibleDetailSection({
  icon: Icon,
  eyebrow,
  title,
  count,
  children,
  initiallyOpen = false,
}: CollapsibleDetailSectionProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  return (
    <section className="quest-details__section quest-details__section--collapsible">
      <button
        className="quest-details__section-toggle"
        type="button"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((current) => !current);
        }}
      >
        <span className="quest-details__section-icon" aria-hidden="true">
          <Icon />
        </span>

        <span className="quest-details__section-title">
          <span>{eyebrow}</span>
          <strong>{title}</strong>
        </span>

        {count && <span className="quest-details__section-count">{count}</span>}

        <ChevronDown
          className={[
            'quest-details__section-chevron',
            isOpen ? 'quest-details__section-chevron--open' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        />
      </button>

      <AnimatedCollapse isOpen={isOpen}>
        <div className="quest-details__collapsible-content">{children}</div>
      </AnimatedCollapse>
    </section>
  );
}

export function QuestDetailsDrawer({
  quest,
  questsById,
  isCompleted,
  isCurrent,
  personalNote,
  onClose,
  onToggleCompletion,
  onSaveNote,
}: QuestDetailsDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const drawerRef = useRef<HTMLElement>(null);

  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const closeTimerRef = useRef<number | null>(null);

  const onCloseRef = useRef(onClose);

  const [isClosing, setIsClosing] = useState(false);

  const [noteDraft, setNoteDraft] = useState(personalNote);

  const [noteMessage, setNoteMessage] = useState('');

  const isCompletable = isQuestCompletionEligible(quest);

  const referenceLabel = quest.isSeasonalQuest
    ? 'Seasonal reference'
    : 'Repeatable reference';

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const requestClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      onCloseRef.current();
      return;
    }

    setIsClosing(true);

    closeTimerRef.current = window.setTimeout(() => {
      onCloseRef.current();
    }, DRAWER_EXIT_DURATION_MS);
  }, []);

  useEffect(() => {
    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;

      previouslyFocusedElementRef.current?.focus();

      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        requestClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const drawer = drawerRef.current;

      if (!drawer) {
        return;
      }

      const focusableElements = Array.from(
        drawer.querySelectorAll<HTMLElement>(
          [
            'button:not([disabled])',
            'a[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
          ].join(','),
        ),
      ).filter(
        (element) => window.getComputedStyle(element).visibility !== 'hidden',
      );

      const firstElement = focusableElements[0];

      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [requestClose]);

  function handleSaveNote() {
    const trimmedNote = noteDraft.trim();

    onSaveNote(trimmedNote);
    setNoteDraft(trimmedNote);

    setNoteMessage(trimmedNote.length > 0 ? 'Note saved.' : 'Note removed.');
  }

  const questContextLabel =
    quest.expansionId && quest.patch
      ? `${quest.expansionId.toUpperCase()} · Patch ${quest.patch}`
      : formatQuestCategory(quest.category);

  const preparationItems =
    quest.questItems?.filter((item) =>
      ['required-before-starting', 'craft', 'gather'].includes(item.usage),
    ) ?? [];

  const duringQuestItems =
    quest.questItems?.filter(
      (item) =>
        !['required-before-starting', 'craft', 'gather'].includes(item.usage),
    ) ?? [];

  const dutyNames = new Set(
    quest.duties?.map((duty) => duty.name.toLocaleLowerCase('en-US')) ?? [],
  );

  const additionalUnlocks =
    quest.unlocks?.filter(
      (unlock) => !dutyNames.has(unlock.name.toLocaleLowerCase('en-US')),
    ) ?? [];

  const preparationCount =
    (quest.requirements?.length ?? 0) + preparationItems.length;

  const progressionCount =
    (quest.duties?.length ?? 0) + additionalUnlocks.length;

  const rewardItemCount =
    (quest.rewards?.items?.length ?? 0) +
    (quest.rewards?.optionalItems?.length ?? 0);

  const relationshipCount =
    (quest.prerequisiteQuestIds?.length ?? 0) +
    (quest.nextQuestIds?.length ?? 0);

  const experience = quest.rewards?.experience;
  const gil = quest.rewards?.gil;

  const hasSummary =
    (experience !== undefined && experience > 0) ||
    (gil !== undefined && gil > 0) ||
    progressionCount > 0;

  const startDetail = [
    quest.start?.zoneName,

    quest.start?.coordinates
      ? `X: ${quest.start.coordinates.x.toFixed(
          1,
        )}, Y: ${quest.start.coordinates.y.toFixed(1)}`
      : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className={[
        'quest-details-backdrop',
        isClosing ? 'quest-details-backdrop--closing' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          requestClose();
        }
      }}
    >
      <aside
        ref={drawerRef}
        className={['quest-details', isClosing ? 'quest-details--closing' : '']
          .filter(Boolean)
          .join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quest-details-title"
      >
        <header className="quest-details__header">
          <div>
            <p className="quest-details__eyebrow">{questContextLabel}</p>

            <h2 id="quest-details-title">{quest.name}</h2>

            <div className="quest-details__meta">
              <span>Level {quest.level}</span>

              <span>{formatQuestCategory(quest.category)}</span>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            className="quest-details__close"
            type="button"
            aria-label="Close quest details"
            onClick={requestClose}
          >
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="quest-details__actions">
          {isCompletable ? (
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
              <CheckCircle2 aria-hidden="true" />

              <span>{isCompleted ? 'Completed' : 'Mark complete'}</span>
            </button>
          ) : (
            <span
              className="quest-details__action quest-details__action--reference"
              title="This quest is provided for reference and does not count toward completion."
            >
              <Info aria-hidden="true" />

              <span>{referenceLabel}</span>
            </span>
          )}

          {isCurrent && (
            <span className="quest-details__action quest-details__action--active quest-details__action--status">
              <Crosshair aria-hidden="true" />

              <span>Current quest</span>
            </span>
          )}
        </div>

        {hasSummary && (
          <div className="quest-details__summary" aria-label="Quest summary">
            {experience !== undefined && experience > 0 && (
              <div className="quest-details__summary-item">
                <TrendingUp aria-hidden="true" />

                <span>
                  <strong>{experience.toLocaleString()}</strong>

                  <small>Experience</small>
                </span>
              </div>
            )}

            {gil !== undefined && gil > 0 && (
              <div className="quest-details__summary-item">
                <Coins aria-hidden="true" />

                <span>
                  <strong>{gil.toLocaleString()}</strong>

                  <small>Gil</small>
                </span>
              </div>
            )}

            {quest.duties && quest.duties.length > 0 && (
              <div className="quest-details__summary-item">
                <Swords aria-hidden="true" />

                <span>
                  <strong>{quest.duties.length}</strong>

                  <small>{quest.duties.length === 1 ? 'Duty' : 'Duties'}</small>
                </span>
              </div>
            )}

            {additionalUnlocks.length > 0 && (
              <div className="quest-details__summary-item">
                <Sparkles aria-hidden="true" />

                <span>
                  <strong>{additionalUnlocks.length}</strong>

                  <small>
                    {additionalUnlocks.length === 1 ? 'Unlock' : 'Unlocks'}
                  </small>
                </span>
              </div>
            )}
          </div>
        )}

        <div className="quest-details__body">
          {quest.start && (
            <DetailSection
              icon={MapPin}
              eyebrow="Navigation"
              title="Starting point"
            >
              <div className="quest-details__list">
                <DetailRow
                  icon={MapPin}
                  title={formatSentenceCase(quest.start.npcName)}
                  detail={startDetail || 'Location details unavailable'}
                  tone="accent"
                />
              </div>
            </DetailSection>
          )}

          {preparationCount > 0 && (
            <DetailSection
              icon={ShieldCheck}
              eyebrow="Preparation"
              title="Before starting"
              count={`${preparationCount}`}
            >
              <div className="quest-details__list">
                {quest.requirements?.map((requirement, index) => {
                  const formatted = formatRequirement(requirement);

                  return (
                    <DetailRow
                      key={`${requirement.type}-${index}`}
                      icon={ShieldCheck}
                      {...formatted}
                    />
                  );
                })}

                {preparationItems.map((item, index) => (
                  <DetailRow
                    key={`${item.itemId}-${item.usage}-${index}`}
                    icon={Package}
                    {...formatQuestItem(item)}
                  />
                ))}
              </div>
            </DetailSection>
          )}

          {duringQuestItems.length > 0 && (
            <DetailSection
              icon={Package}
              eyebrow="Quest items"
              title="During this quest"
              count={`${duringQuestItems.length}`}
            >
              <div className="quest-details__list">
                {duringQuestItems.map((item, index) => (
                  <DetailRow
                    key={`${item.itemId}-${item.usage}-${index}`}
                    icon={Package}
                    tone="blue"
                    {...formatQuestItem(item)}
                  />
                ))}
              </div>
            </DetailSection>
          )}

          {progressionCount > 0 && (
            <DetailSection
              icon={Sparkles}
              eyebrow="Progression"
              title="Unlocks and duties"
              count={`${progressionCount}`}
            >
              <div className="quest-details__list">
                {quest.duties?.map((duty) => (
                  <DetailRow
                    key={duty.id}
                    icon={Swords}
                    title={duty.name}
                    detail={[
                      formatLabel(duty.type),
                      `Level ${duty.level}`,
                      duty.minimumItemLevel !== undefined
                        ? `Minimum item level ${duty.minimumItemLevel}`
                        : undefined,
                      duty.partySize !== undefined
                        ? `${duty.partySize} players`
                        : undefined,
                      duty.notes,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    badge={
                      duty.relationship === 'unlocked'
                        ? 'Unlock'
                        : duty.relationship
                          ? formatLabel(duty.relationship)
                          : undefined
                    }
                    tone="blue"
                  />
                ))}

                {additionalUnlocks.map((unlock) => (
                  <DetailRow
                    key={`${unlock.type}-${unlock.targetId ?? unlock.name}`}
                    icon={Sparkles}
                    title={unlock.name}
                    detail={[formatLabel(unlock.type), unlock.notes]
                      .filter(Boolean)
                      .join(' · ')}
                    badge="Unlock"
                    tone="success"
                  />
                ))}
              </div>
            </DetailSection>
          )}

          {rewardItemCount > 0 && quest.rewards && (
            <CollapsibleDetailSection
              icon={Gift}
              eyebrow="Completion"
              title="Item rewards"
              count={`${rewardItemCount}`}
            >
              <div className="quest-details__list">
                {quest.rewards.items?.map((item, index) => (
                  <DetailRow
                    key={`${item.itemId}-${index}`}
                    icon={Gift}
                    title={`${item.quantity}× ${item.itemName}`}
                    detail={[
                      item.quality ? formatQuality(item.quality) : undefined,
                      item.notes,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    badge="Reward"
                    tone="success"
                  />
                ))}

                {quest.rewards.optionalItems?.map((item, index) => (
                  <DetailRow
                    key={`${item.itemId}-${item.stainId ?? 'unstained'}-${index}`}
                    icon={Gift}
                    title={`${item.quantity}× ${item.itemName}`}
                    detail={[
                      item.quality ? formatQuality(item.quality) : undefined,
                      item.notes,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    badge="Choose one"
                    tone="accent"
                  />
                ))}
              </div>
            </CollapsibleDetailSection>
          )}

          {relationshipCount > 0 && (
            <CollapsibleDetailSection
              icon={GitBranch}
              eyebrow="Quest chain"
              title="Related quests"
              count={`${relationshipCount}`}
            >
              <div className="quest-details__list">
                {quest.prerequisiteQuestIds?.map((questId) => (
                  <DetailRow
                    key={`previous-${questId}`}
                    icon={ArrowLeft}
                    title={getRelatedQuestName(questId, questsById)}
                    detail={
                      quest.prerequisiteQuestMode === 'any'
                        ? 'Complete any listed prerequisite'
                        : 'Previous quest'
                    }
                    badge="Previous"
                  />
                ))}

                {quest.nextQuestIds?.map((questId) => (
                  <DetailRow
                    key={`next-${questId}`}
                    icon={ArrowRight}
                    title={getRelatedQuestName(questId, questsById)}
                    detail="Continues this quest chain"
                    badge="Next"
                  />
                ))}
              </div>
            </CollapsibleDetailSection>
          )}

          {quest.notes && quest.notes.length > 0 && (
            <CollapsibleDetailSection
              icon={StickyNote}
              eyebrow="Game information"
              title="Notes"
              count={`${quest.notes.length}`}
            >
              <div className="quest-details__list">
                {quest.notes.map((note, index) => (
                  <DetailRow
                    key={`${note.type}-${index}`}
                    icon={StickyNote}
                    title={formatLabel(note.type)}
                    detail={note.text}
                    badge={formatLabel(note.type)}
                  />
                ))}
              </div>
            </CollapsibleDetailSection>
          )}

          <CollapsibleDetailSection
            icon={StickyNote}
            eyebrow="Personal tracking"
            title="Your note"
            initiallyOpen={personalNote.trim().length > 0}
          >
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
          </CollapsibleDetailSection>
        </div>
      </aside>
    </div>
  );
}
