import './QuestLogPage.css';

export function QuestLogPage() {
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

        <div className="page-header__badge">0 quests loaded</div>
      </header>

      <section className="quest-log-placeholder">
        <div className="quest-log-placeholder__icon" aria-hidden="true">
          !
        </div>

        <div>
          <p className="quest-log-placeholder__eyebrow">
            Quest dataset required
          </p>

          <h2>The quest module is ready for its data layer.</h2>

          <p>
            The next development block will define our quest entities, JSON
            schema, validation rules, and data repository.
          </p>
        </div>
      </section>

      <section className="quest-log-preview">
        <header className="quest-log-preview__header">
          <div>
            <p>Planned Organization</p>
            <h2>Quest Collections</h2>
          </div>
        </header>

        <div className="quest-category-grid">
          <article className="quest-category-card">
            <span className="quest-category-card__index">01</span>
            <h3>Main Scenario</h3>
            <p>
              Organized by expansion, patch, and level range with duties and
              major unlocks clearly identified.
            </p>
          </article>

          <article className="quest-category-card">
            <span className="quest-category-card__index">02</span>
            <h3>Combat Classes & Jobs</h3>
            <p>
              Complete class, job, and role quest chains with prerequisites and
              rewards.
            </p>
          </article>

          <article className="quest-category-card">
            <span className="quest-category-card__index">03</span>
            <h3>Crafting & Gathering</h3>
            <p>
              Quest requirements, requested items, quality requirements, and
              acquisition guidance.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}