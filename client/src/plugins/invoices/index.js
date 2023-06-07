import { useStore } from './store';

const usePlugin = (router, dataStore) => {
  const store = useStore(dataStore);

  dataStore.registerFunction('invoices', 'create', 'generate_with_lines', store.createWithLines);
  dataStore.registerFunction('invoices', 'create', 'preview_invoice', store.previewInvoice);
  dataStore.registerFunction('invoices', 'view', 'template_data', store.viewTemplateData);
};

export default usePlugin;
