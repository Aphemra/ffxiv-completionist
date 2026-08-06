import { useState, type FocusEvent, type MouseEvent } from 'react';

import {
  BookOpenText,
  LayoutDashboard,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

import { NavLink, Outlet } from 'react-router';

import { useProgressStore } from '../../core/progress/progressStore';

import './AppLayout.css';

interface NavigationItem {
  label: string;
  description: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    description: 'Overall completion',
    path: '/',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'Quest Log',
    description: 'MSQ, class, and job quests',
    path: '/quests',
    icon: BookOpenText,
  },
];

export function AppLayout() {
  const [isNavigationExpanded, setIsNavigationExpanded] = useState(false);

  const characterName = useProgressStore(
    (state) => state.profile.characterName,
  );

  const world = useProgressStore((state) => state.profile.world);

  function handleNavigationClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.detail > 0) {
      event.currentTarget.blur();
    }

    setIsNavigationExpanded(false);
  }

  function handleSidebarBlur(event: FocusEvent<HTMLElement>) {
    const nextFocusedElement = event.relatedTarget;

    if (
      nextFocusedElement instanceof Node &&
      event.currentTarget.contains(nextFocusedElement)
    ) {
      return;
    }

    setIsNavigationExpanded(false);
  }

  return (
    <div className="app-shell">
      <aside
        className={[
          'app-sidebar',
          isNavigationExpanded ? 'app-sidebar--expanded' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Application navigation"
        onPointerEnter={() => {
          setIsNavigationExpanded(true);
        }}
        onPointerLeave={() => {
          setIsNavigationExpanded(false);
        }}
        onFocusCapture={() => {
          setIsNavigationExpanded(true);
        }}
        onBlurCapture={handleSidebarBlur}
      >
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
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
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
                    <Icon aria-hidden="true" />
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
              );
            })}
          </div>
        </nav>

        <NavLink
          to="/profile"
          aria-label="Open profile"
          title="Profile — Character and local save"
          onClick={handleNavigationClick}
          className={({ isActive }) =>
            [
              'app-sidebar__footer',
              isActive ? 'app-sidebar__footer--active' : '',
            ]
              .filter(Boolean)
              .join(' ')
          }
        >
          <span className="app-sidebar__profile-icon">
            <UserRound aria-hidden="true" />
          </span>

          <span className="app-sidebar__footer-copy">
            <span className="app-sidebar__status-label">
              {world || 'Local Profile'}
            </span>

            <span className="app-sidebar__status-value">
              {characterName || 'Not configured'}
            </span>
          </span>
        </NavLink>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
