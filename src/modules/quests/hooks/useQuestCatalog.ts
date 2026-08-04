import { useEffect, useState } from 'react';

import { questRepository, type QuestCatalog } from '../data/questRepository';

type QuestCatalogState =
  | {
      status: 'loading';
      catalog: null;
      error: null;
    }
  | {
      status: 'success';
      catalog: QuestCatalog;
      error: null;
    }
  | {
      status: 'error';
      catalog: null;
      error: string;
    };

const initialState: QuestCatalogState = {
  status: 'loading',
  catalog: null,
  error: null,
};

export function useQuestCatalog(): QuestCatalogState {
  const [state, setState] = useState<QuestCatalogState>(initialState);

  useEffect(() => {
    let isActive = true;

    questRepository
      .loadCatalog()
      .then((catalog) => {
        if (!isActive) {
          return;
        }

        setState({
          status: 'success',
          catalog,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setState({
          status: 'error',
          catalog: null,
          error:
            error instanceof Error
              ? error.message
              : 'An unknown quest data error occurred.',
        });
      });

    return () => {
      isActive = false;
    };
  }, []);

  return state;
}
