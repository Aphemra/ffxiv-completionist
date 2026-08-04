import {
  useState,
  type FormEvent,
} from 'react';

import { useProgressStore } from '../../../core/progress/progressStore';

import './ProfilePage.css';

export function ProfilePage() {
  const profile = useProgressStore((state) => state.profile);

  const updateProfileMetadata = useProgressStore(
    (state) => state.updateProfileMetadata,
  );

  const resetQuestProgress = useProgressStore(
    (state) => state.resetQuestProgress,
  );

  const [characterName, setCharacterName] = useState(
    profile.characterName,
  );

  const [dataCenter, setDataCenter] = useState(
    profile.dataCenter,
  );

  const [world, setWorld] = useState(profile.world);

  const [saveMessage, setSaveMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    updateProfileMetadata({
      characterName,
      dataCenter,
      world,
    });

    setSaveMessage('Profile saved.');
  }

  function handleResetProgress() {
    const shouldReset = window.confirm(
      [
        'Reset all quest progress?',
        '',
        'This will clear completed quests, the current quest, bookmarks, and quest notes.',
        'Your character name and world will be preserved.',
      ].join('\n'),
    );

    if (!shouldReset) {
      return;
    }

    resetQuestProgress();
    setSaveMessage('Quest progress reset.');
  }

  return (
    <div className="profile-page">
      <header className="page-header">
        <div>
          <p className="page-header__eyebrow">
            Local Character
          </p>

          <h1>Profile</h1>

          <p className="page-header__description">
            Configure the character associated with this browser’s
            completion data.
          </p>
        </div>

        <div className="page-header__badge">
          {profile.characterName || 'Not configured'}
        </div>
      </header>

      <div className="profile-layout">
        <section className="profile-panel">
          <header className="profile-panel__header">
            <p>Character Information</p>
            <h2>Profile details</h2>
          </header>

          <form
            className="profile-form"
            onSubmit={handleSubmit}
          >
            <label className="profile-field">
              <span className="profile-field__label">
                Character name
              </span>

              <input
                type="text"
                value={characterName}
                maxLength={80}
                placeholder="Mira Veyn"
                onChange={(event) => {
                  setCharacterName(event.target.value);
                  setSaveMessage('');
                }}
              />
            </label>

            <label className="profile-field">
              <span className="profile-field__label">
                Data center
              </span>

              <input
                type="text"
                value={dataCenter}
                maxLength={80}
                placeholder="Primal"
                onChange={(event) => {
                  setDataCenter(event.target.value);
                  setSaveMessage('');
                }}
              />
            </label>

            <label className="profile-field">
              <span className="profile-field__label">
                World
              </span>

              <input
                type="text"
                value={world}
                maxLength={80}
                placeholder="Behemoth"
                onChange={(event) => {
                  setWorld(event.target.value);
                  setSaveMessage('');
                }}
              />
            </label>

            <div className="profile-form__actions">
              <button
                className="profile-button profile-button--primary"
                type="submit"
              >
                Save profile
              </button>

              <p
                className="profile-form__message"
                aria-live="polite"
              >
                {saveMessage}
              </p>
            </div>
          </form>
        </section>

        <aside className="profile-panel">
          <header className="profile-panel__header">
            <p>Stored Progress</p>
            <h2>Local save</h2>
          </header>

          <dl className="profile-statistics">
            <div>
              <dt>Completed quests</dt>
              <dd>
                {profile.completedQuestIds.length.toLocaleString()}
              </dd>
            </div>

            <div>
              <dt>Bookmarked quests</dt>
              <dd>
                {profile.bookmarkedQuestIds.length.toLocaleString()}
              </dd>
            </div>

            <div>
              <dt>Quest notes</dt>
              <dd>
                {Object.keys(
                  profile.questNotes,
                ).length.toLocaleString()}
              </dd>
            </div>
          </dl>

          <div className="profile-save-info">
            <h3>Browser-local progress</h3>

            <p>
              This profile is stored only in this browser for now.
              Export, import, and additional character profiles will
              be added later.
            </p>
          </div>

          <div className="profile-danger-zone">
            <div>
              <h3>Reset quest progress</h3>

              <p>
                Clear all tracked quest state while preserving the
                character information above.
              </p>
            </div>

            <button
              className="profile-button profile-button--danger"
              type="button"
              onClick={handleResetProgress}
            >
              Reset progress
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}