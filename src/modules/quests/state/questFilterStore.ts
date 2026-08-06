import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { QuestFamily } from '../utilities/questPresentation';

interface QuestFilterState {
  categoryFilter: QuestFamily;

  primaryFilter: string;
  secondaryFilter: string;

  showCompleted: boolean;

  setCategoryFilter: (category: QuestFamily) => void;
  setPrimaryFilter: (value: string) => void;
  setSecondaryFilter: (value: string) => void;
  setShowCompleted: (showCompleted: boolean) => void;

  resetFilters: () => void;
}

const DEFAULT_FILTERS = {
  categoryFilter: 'msq' as const,

  primaryFilter: 'all',
  secondaryFilter: 'all',

  showCompleted: true,
};

export const useQuestFilterStore = create<QuestFilterState>()(
  persist(
    (set) => ({
      ...DEFAULT_FILTERS,

      setCategoryFilter: (categoryFilter) => {
        set({
          categoryFilter,
          primaryFilter: 'all',
          secondaryFilter: 'all',
        });
      },

      setPrimaryFilter: (primaryFilter) => {
        set({
          primaryFilter,
          secondaryFilter: 'all',
        });
      },

      setSecondaryFilter: (secondaryFilter) => {
        set({ secondaryFilter });
      },

      setShowCompleted: (showCompleted) => {
        set({ showCompleted });
      },

      resetFilters: () => {
        set(DEFAULT_FILTERS);
      },
    }),
    {
      name: 'ffxiv-completionist-quest-filters',
      version: 2,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
