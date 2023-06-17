import { default as initStore } from '#/system_configs/stores.js';

export function useStore({ dataStore, logger, utils }) {
  const store = initStore({ dataAccess: dataStore, logger, utils });

  function viewLatestConfig(modelClass, params) {
    return store.viewLatest();
  }

  function replaceLatestConfig(modelClass, params) {
    return store.replaceLatest(params);
  }

  return {
    viewLatestConfig,
    replaceLatestConfig,
  };
}
