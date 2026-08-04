import type { MouseEvent } from 'react';
import { NavLink, Outlet } from 'react-router';

import { useProgressStore } from '../../core/progress/progressStore';

import './AppLayout.css';

type NavigationIconName = 'dashboard' | 'quests' | 'profile';

interface NavigationItem {
  label: string;
  description: string;
  path: string;
  icon: NavigationIconName;
  end?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    description: 'Overall completion',
    path: '/',
    icon: 'dashboard',
    end: true,
  },
  {
    label: 'Quest Log',
    description: 'MSQ, class, and job quests',
    path: '/quests',
    icon: 'quests',
  },
  {
    label: 'Profile',
    description: 'Character and local save',
    path: '/profile',
    icon: 'profile',
  },
];

interface NavigationIconProps {
  name: NavigationIconName;
}

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function NavigationIcon({ name }: NavigationIconProps) {
  if (name === 'dashboard') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }

  if (name === 'profile') {
    return <ProfileIcon />;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3.5h10.5A1.5 1.5 0 0 1 18 5v15.5H7.5A2.5 2.5 0 0 1 5 18V4.5A1 1 0 0 1 6 3.5Z" />
      <path d="M7.5 17.5H18" />
      <path d="M9 8h5.5" />
      <path d="M9 11.5h4" />
    </svg>
  );
}

function handleNavigationClick(event: MouseEvent<HTMLAnchorElement>) {
  if (event.detail > 0) {
    event.currentTarget.blur();
  }
}

export function AppLayout() {
  const characterName = useProgressStore(
    (state) => state.profile.characterName,
  );

  const world = useProgressStore((state) => state.profile.world);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <header className="app-brand">
          <div className="app-brand__mark" aria-hidden="true">
            XIV
          </div>

          <div className="app-brand__copy">
            <p className="app-brand__eyebrow">Completion Tracker</p>

            <p className="app-brand__name">Final Fantasy XIV</p>
          </div>
        </header>

        <nav className="app-navigation" aria-label="Primary navigation">
          <p className="app-navigation__heading">Progress</p>

          <div className="app-navigation__items">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                aria-label={item.label}
                title={`${item.label} — ${item.description}`}
                onClick={handleNavigationClick}
                className={({ isActive }) =>
                  [
                    'app-navigation__link',
                    isActive ? 'app-navigation__link--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
                }
              >
                <span className="app-navigation__icon">
                  <NavigationIcon name={item.icon} />
                </span>

                <span className="app-navigation__copy">
                  <span className="app-navigation__link-label">
                    {item.label}
                  </span>

                  <span className="app-navigation__link-description">
                    {item.description}
                  </span>
                </span>
              </NavLink>
            ))}
          </div>
        </nav>

        <footer className="app-sidebar__footer">
          <div className="app-sidebar__profile-icon">
            <ProfileIcon />
          </div>

          <div className="app-sidebar__footer-copy">
            <p className="app-sidebar__status-label">
              {world || 'Local Profile'}
            </p>

            <p className="app-sidebar__status-value">
              {characterName || 'Not configured'}
            </p>
          </div>
        </footer>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
