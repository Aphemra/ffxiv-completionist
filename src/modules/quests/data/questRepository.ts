import { DataLoadError } from '../../../core/data/DataLoadError';
import { loadJson } from '../../../core/data/loadJson';

import { questCollectionFileSchema } from './questCollectionFileSchemas';

import {
  questManifestSchema,
  type Quest,
  type QuestCollection,
  type QuestManifest,
} from './questSchemas';

const QUEST_MANIFEST_PATH = 'data/quests/manifest.json';

export interface QuestCatalog {
  manifest: QuestManifest;
  collections: QuestCollection[];
  questsById: ReadonlyMap<string, Quest>;
  questCount: number;
}

export interface QuestRepository {
  loadCatalog(): Promise<QuestCatalog>;
}

export class JsonQuestRepository implements QuestRepository {
  private catalogPromise: Promise<QuestCatalog> | null = null;

  loadCatalog(): Promise<QuestCatalog> {
    if (!this.catalogPromise) {
      this.catalogPromise = this.loadCatalogInternal().catch((error) => {
        this.catalogPromise = null;
        throw error;
      });
    }

    return this.catalogPromise;
  }

  private async loadCatalogInternal(): Promise<QuestCatalog> {
    const manifest = await loadJson(QUEST_MANIFEST_PATH, questManifestSchema);

    const enabledEntries = manifest.collections
      .filter((entry) => entry.enabled)
      .sort((left, right) => left.sortOrder - right.sortOrder);

    const collections = await Promise.all(
      enabledEntries.map(async (entry) => {
        const collection = await loadJson(
          entry.path,
          questCollectionFileSchema,
        );

        if (collection.id !== entry.id) {
          throw new DataLoadError(
            [
              `Quest collection ID mismatch in "${entry.path}".`,
              `Manifest ID: "${entry.id}"`,
              `Collection ID: "${collection.id}"`,
            ].join('\n'),
            entry.path,
          );
        }

        if (collection.category !== entry.category) {
          throw new DataLoadError(
            [
              `Quest collection category mismatch in "${entry.path}".`,
              `Manifest category: "${entry.category}"`,
              `Collection category: "${collection.category}"`,
            ].join('\n'),
            entry.path,
          );
        }

        return collection;
      }),
    );

    collections.sort((left, right) => left.sortOrder - right.sortOrder);

    const questsById = new Map<string, Quest>();

    for (const collection of collections) {
      collection.groups.sort((left, right) => left.sortOrder - right.sortOrder);

      for (const group of collection.groups) {
        group.quests.sort((left, right) => left.sortOrder - right.sortOrder);

        for (const quest of group.quests) {
          if (questsById.has(quest.id)) {
            throw new DataLoadError(
              `Duplicate quest ID "${quest.id}" appears across multiple collections.`,
              collection.id,
            );
          }

          questsById.set(quest.id, quest);
        }
      }
    }

    return {
      manifest,
      collections,
      questsById,
      questCount: questsById.size,
    };
  }
}

export const questRepository = new JsonQuestRepository();
