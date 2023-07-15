import { default as initStore } from '#/invoices/stores.js';

export function useStore({ dataStore, utils, logger }) {
  const store = initStore({ dataAccess: dataStore, logger, utils });

  function createWithLines(modelClass, params) {
    return store.createWithLines(params);
  }

  function previewInvoice(modelClass, params) {
    return store.previewInvoice(params);
  }

  function viewTemplateData(modelClass, id) {
    return store.viewTemplateData(id);
  }

  function voidInvoice(modelClass, id) {
    return store.voidInvoice(id);
  }

  return {
    createWithLines,
    previewInvoice,
    viewTemplateData,
    voidInvoice,
  };
}
