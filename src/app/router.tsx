import { Route, Routes } from 'react-router';

import { DashboardPage } from '../modules/dashboard/pages/DashboardPage';
import { NotFoundPage } from '../modules/not-found/pages/NotFoundPage';
import { ProfilePage } from '../modules/profile/pages/ProfilePage';
import { QuestLogPage } from '../modules/quests/pages/QuestLogPage';
import { AppLayout } from '../shared/layout/AppLayout';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="quests" element={<QuestLogPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}