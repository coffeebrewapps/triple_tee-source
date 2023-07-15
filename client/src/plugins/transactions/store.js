import { default as initStore } from '#/transactions/stores.js';

export function useStore({ dataStore, utils, logger }) {
  const store = initStore({ dataAccess: dataStore, utils, logger });

  function create(modelClass, params) {
    return store.create(params);
  }

  function reverseTransaction(modelClass, id) {
    return store.reverseTransaction(id);
  }

  return {
    create,
    reverseTransaction,
  };
}
