import { useStore } from './store';

const usePlugin = ({ router, dataStore, logger }) => {
  const store = useStore({ dataStore, logger });

  dataStore.registerFunction('invoices', 'create', 'generate_with_lines', store.createWithLines);
  dataStore.registerFunction('invoices', 'create', 'preview_invoice', store.previewInvoice);
  dataStore.registerFunction('invoices', 'view', 'template_data', store.viewTemplateData);
  dataStore.registerFunction('invoices', 'update', 'void', store.voidInvoice);
};

export default usePlugin;
