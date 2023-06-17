import { default as initStore } from '#/tax_tables/stores.js';

export function useStore({ dataStore, logger, utils }) {
  const store = initStore({ dataAccess: dataStore, logger, utils });

  function estimateTax(modelClass, id) {
    return store.estimateTax(id);
  }

  return {
    estimateTax,
  };
}
