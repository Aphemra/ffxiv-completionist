import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { QuestCategory } from '../data/questSchemas';

type QuestCategoryFilter = QuestCategory | 'all';

interface QuestFilterState {
  expansionFilter: string;
  patchFilter: string;
  categoryFilter: QuestCategoryFilter;
  showCompleted: boolean;

  setExpansionFilter: (expansionId: string) => void;
  setPatchFilter: (patch: string) => void;
  setCategoryFilter: (category: QuestCategoryFilter) => void;
  setShowCompleted: (showCompleted: boolean) => void;

  resetFilters: () => void;
}

const DEFAULT_FILTERS = {
  expansionFilter: 'all',
  patchFilter: 'all',
  categoryFilter: 'all' as const,
  showCompleted: true,
};

export const useQuestFilterStore = create<QuestFilterState>()(
  persist(
    (set) => ({
      ...DEFAULT_FILTERS,

      setExpansionFilter: (expansionFilter) => {
        set({
          expansionFilter,
          patchFilter: 'all',
        });
      },

      setPatchFilter: (patchFilter) => {
        set({ patchFilter });
      },

      setCategoryFilter: (categoryFilter) => {
        set({ categoryFilter });
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
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
