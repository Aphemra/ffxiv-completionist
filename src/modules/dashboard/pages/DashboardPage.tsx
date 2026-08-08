import { useProgressStore } from '../../../core/progress/progressStore';
import { useQuestCatalog } from '../../quests/hooks/useQuestCatalog';
import { createAvailableQuestCatalog } from '../../quests/utilities/questAvailability';
import { getAutomaticCurrentQuestId } from '../../quests/utilities/questProgression';
import {
  createSatisfiedQuestIdSet,
  getQuestCompletionSummary,
} from '../../quests/utilities/questCompletion';

import './DashboardPage.css';

interface ProgressCardProps {
  title: string;
  completed: number;
  total: number;
  description: string;
}

function ProgressCard({
  title,
  completed,
  total,
  description,
}: ProgressCardProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <article className="progress-card">
      <div className="progress-card__header">
        <h2>{title}</h2>

        <span className="progress-card__percentage">
          {total > 0 ? `${percentage}%` : '—'}
        </span>
      </div>

      <p className="progress-card__count">
        {completed.toLocaleString()} / {total.toLocaleString()}
      </p>

      <div
        className="progress-card__track"
        role="progressbar"
        aria-label={`${title} progress`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completed}
      >
        <div
          className="progress-card__fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="progress-card__description">{description}</p>
    </article>
  );
}

export function DashboardPage() {
  const questCatalogState = useQuestCatalog();

  const profile = useProgressStore((state) => state.profile);

  const availableQuestCatalog =
    questCatalogState.status === 'success'
      ? createAvailableQuestCatalog(questCatalogState.catalog, {
          startingCity: profile.startingCity,

          startingClassJob: profile.startingClassJob,

          initialGrandCompany: profile.initialGrandCompany,

          currentGrandCompany: profile.currentGrandCompany,
        })
      : null;

  const quests = availableQuestCatalog
    ? Array.from(availableQuestCatalog.questsById.values())
    : [];

  const mainScenarioQuests = quests.filter((quest) => quest.category === 'msq');

  const classAndJobQuests = quests.filter((quest) =>
    ['class', 'job', 'role', 'crafting', 'gathering'].includes(quest.category),
  );

  const satisfiedQuestIdSet = createSatisfiedQuestIdSet(
    quests,
    profile.completedQuestIds,
  );

  const overallCompletion = getQuestCompletionSummary(
    quests,
    satisfiedQuestIdSet,
  );

  const mainScenarioCompletion = getQuestCompletionSummary(
    mainScenarioQuests,
    satisfiedQuestIdSet,
  );

  const classAndJobCompletion = getQuestCompletionSummary(
    classAndJobQuests,
    satisfiedQuestIdSet,
  );

  const automaticCurrentQuestId = availableQuestCatalog
    ? getAutomaticCurrentQuestId(
        availableQuestCatalog.collections,
        Array.from(satisfiedQuestIdSet),
      )
    : null;

  const currentQuest =
    automaticCurrentQuestId && availableQuestCatalog
      ? availableQuestCatalog.questsById.get(automaticCurrentQuestId)
      : undefined;

  const currentQuestContext =
    currentQuest?.expansionId && currentQuest.patch
      ? `${currentQuest.expansionId.toUpperCase()} · Patch ${currentQuest.patch}`
      : currentQuest
        ? currentQuest.category.toUpperCase()
        : null;

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <p className="page-header__eyebrow">Character Overview</p>

          <h1>Completion Dashboard</h1>

          <p className="page-header__description">
            Track your progression across quests and future completionist
            modules.
          </p>
        </div>

        <div className="page-header__badge">
          {profile.characterName || 'No character name'}
          {profile.world && ` · ${profile.world}`}
        </div>
      </header>

      <section className="dashboard-progress" aria-label="Completion summaries">
        <ProgressCard
          title="Overall Progress"
          completed={overallCompletion.completed}
          total={overallCompletion.total}
          description="All currently loaded completion entries."
        />

        <ProgressCard
          title="Main Scenario"
          completed={mainScenarioCompletion.completed}
          total={mainScenarioCompletion.total}
          description="MSQ completion across every loaded expansion and patch."
        />

        <ProgressCard
          title="Class & Job Quests"
          completed={classAndJobCompletion.completed}
          total={classAndJobCompletion.total}
          description="Combat, crafting, and gathering quest lines."
        />
      </section>

      <div className="dashboard-columns">
        <section className="dashboard-panel">
          <header className="dashboard-panel__header">
            <div>
              <p className="dashboard-panel__eyebrow">Current Journey</p>

              <h2>Where you left off</h2>
            </div>
          </header>

          {currentQuest ? (
            <div className="dashboard-current-quest">
              <p className="dashboard-current-quest__eyebrow">
                {currentQuestContext}
              </p>

              <h3>{currentQuest.name}</h3>

              <p className="dashboard-current-quest__level">
                Level {currentQuest.level} {currentQuest.category.toUpperCase()}
              </p>

              {currentQuest.duties && currentQuest.duties.length > 0 && (
                <div className="dashboard-current-quest__details">
                  <p>Upcoming duty</p>

                  {currentQuest.duties.map((duty) => (
                    <strong key={duty.id}>{duty.name}</strong>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <div className="dashboard-empty-state__symbol" aria-hidden="true">
                ◇
              </div>

              <h3>No current quest</h3>

              <p>
                No incomplete quest remains in your active linear questline.
              </p>
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <header className="dashboard-panel__header">
            <div>
              <p className="dashboard-panel__eyebrow">Modules</p>

              <h2>Tracker status</h2>
            </div>
          </header>

          <div className="module-status-list">
            <div className="module-status">
              <div>
                <h3>Quest Log</h3>

                <p>
                  {overallCompletion.completed.toLocaleString()} of{' '}
                  {overallCompletion.total.toLocaleString()} loaded completion
                  requirements complete.
                </p>
              </div>

              <span className="module-status__badge module-status__badge--active">
                Active
              </span>
            </div>

            <div className="module-status">
              <div>
                <h3>Additional Modules</h3>

                <p>Fishing, duties, mounts, and other trackers.</p>
              </div>

              <span className="module-status__badge">Future</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
