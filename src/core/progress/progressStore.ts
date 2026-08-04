import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  persistedProgressStateSchema,
  type PlayerProgress,
  type ProfileMetadata,
} from './playerProgressSchemas';

const PROGRESS_STORAGE_KEY = 'ffxiv-completionist-progress';

function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

function createInitialProfile(): PlayerProgress {
  const timestamp = getCurrentTimestamp();

  return {
    schemaVersion: 1,

    profileId: 'local-profile',
    characterName: '',
    startingCity: null,
    dataCenter: '',
    world: '',

    completedQuestIds: [],
    currentQuestId: null,
    bookmarkedQuestIds: [],
    questNotes: {},

    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function updateProfile(
  profile: PlayerProgress,
  changes: Partial<PlayerProgress>,
): PlayerProgress {
  return {
    ...profile,
    ...changes,
    updatedAt: getCurrentTimestamp(),
  };
}

interface ProgressActions {
  updateProfileMetadata: (metadata: ProfileMetadata) => void;

  toggleQuestCompletion: (questId: string) => void;

  setQuestCompletion: (questId: string, completed: boolean) => void;

  setCurrentQuest: (questId: string | null) => void;

  toggleQuestBookmark: (questId: string) => void;

  setQuestNote: (questId: string, note: string) => void;

  resetQuestProgress: () => void;
}

export type ProgressStore = {
  profile: PlayerProgress;
} & ProgressActions;

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      profile: createInitialProfile(),

      updateProfileMetadata: (metadata) => {
        set((state) => ({
          profile: updateProfile(state.profile, {
            characterName: metadata.characterName.trim(),
            startingCity: metadata.startingCity,
            dataCenter: metadata.dataCenter.trim(),
            world: metadata.world.trim(),
          }),
        }));
      },

      toggleQuestCompletion: (questId) => {
        set((state) => {
          const completedQuestIds = new Set(state.profile.completedQuestIds);

          if (completedQuestIds.has(questId)) {
            completedQuestIds.delete(questId);
          } else {
            completedQuestIds.add(questId);
          }

          return {
            profile: updateProfile(state.profile, {
              completedQuestIds: Array.from(completedQuestIds),
            }),
          };
        });
      },

      setQuestCompletion: (questId, completed) => {
        set((state) => {
          const completedQuestIds = new Set(state.profile.completedQuestIds);

          if (completed) {
            completedQuestIds.add(questId);
          } else {
            completedQuestIds.delete(questId);
          }

          return {
            profile: updateProfile(state.profile, {
              completedQuestIds: Array.from(completedQuestIds),
            }),
          };
        });
      },

      setCurrentQuest: (questId) => {
        set((state) => ({
          profile: updateProfile(state.profile, {
            currentQuestId: questId,
          }),
        }));
      },

      toggleQuestBookmark: (questId) => {
        set((state) => {
          const bookmarkedQuestIds = new Set(state.profile.bookmarkedQuestIds);

          if (bookmarkedQuestIds.has(questId)) {
            bookmarkedQuestIds.delete(questId);
          } else {
            bookmarkedQuestIds.add(questId);
          }

          return {
            profile: updateProfile(state.profile, {
              bookmarkedQuestIds: Array.from(bookmarkedQuestIds),
            }),
          };
        });
      },

      setQuestNote: (questId, note) => {
        set((state) => {
          const questNotes = {
            ...state.profile.questNotes,
          };

          const trimmedNote = note.trim();

          if (trimmedNote.length === 0) {
            delete questNotes[questId];
          } else {
            questNotes[questId] = trimmedNote;
          }

          return {
            profile: updateProfile(state.profile, {
              questNotes,
            }),
          };
        });
      },

      resetQuestProgress: () => {
        set((state) => ({
          profile: updateProfile(state.profile, {
            completedQuestIds: [],
            currentQuestId: null,
            bookmarkedQuestIds: [],
            questNotes: {},
          }),
        }));
      },
    }),
    {
      name: PROGRESS_STORAGE_KEY,
      version: 1,

      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        profile: state.profile,
      }),

      merge: (persistedState, currentState) => {
        const result = persistedProgressStateSchema.safeParse(persistedState);

        if (!result.success) {
          console.warn(
            'Saved player progress failed validation and was ignored.',
            result.error,
          );

          return currentState;
        }

        return {
          ...currentState,
          profile: result.data.profile,
        };
      },
    },
  ),
);
