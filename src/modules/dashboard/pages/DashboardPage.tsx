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
  const percentage =
    total > 0 ? Math.round((completed / total) * 100) : 0;

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

        <div className="page-header__badge">No profile selected</div>
      </header>

      <section
        className="dashboard-progress"
        aria-label="Completion summaries"
      >
        <ProgressCard
          title="Overall Progress"
          completed={0}
          total={0}
          description="All registered completion categories."
        />

        <ProgressCard
          title="Main Scenario"
          completed={0}
          total={0}
          description="MSQ completion across every expansion and patch."
        />

        <ProgressCard
          title="Class & Job Quests"
          completed={0}
          total={0}
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

          <div className="dashboard-empty-state">
            <div className="dashboard-empty-state__symbol" aria-hidden="true">
              ◇
            </div>

            <h3>No current quest selected</h3>

            <p>
              Your active MSQ and the next major unlocks will appear here once
              quest progression is configured.
            </p>
          </div>
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
                <p>MSQ, class quests, job quests, and unlocks.</p>
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