import { useStore } from './store';

const usePlugin = ({ router, dataStore, logger }) => {
  const store = useStore({ dataStore, logger });

  dataStore.registerFunction('income_receipts', 'create', 'generate_with_transaction', store.createWithTransaction);
  dataStore.registerFunction('income_receipts', 'create', 'preview_receipt', store.previewReceipt);
  dataStore.registerFunction('income_receipts', 'view', 'template_data', store.viewTemplateData);
};

export default usePlugin;
