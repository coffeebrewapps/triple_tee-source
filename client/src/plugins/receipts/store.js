import { default as initStore } from '#/income_receipts/stores.js';

export function useStore({ dataStore, logger, utils }) {
  const store = initStore({ dataAccess: dataStore, logger, utils });

  function createWithTransaction(modelClass, params) {
    return store.createWithTransaction(params);
  }

  function previewReceipt(modelClass, params) {
    return store.previewReceipt(params);
  }

  function viewTemplateData(modelClass, id) {
    return store.viewTemplateData(id);
  }

  return {
    createWithTransaction,
    previewReceipt,
    viewTemplateData,
  };
}
