import { useStore } from './store';
import { useValidations } from '@/utils/validations';

const usePlugin = ({ router, dataStore, logger }) => {
  const utils = useValidations();
  const store = useStore({ dataStore, utils, logger });

  dataStore.registerFunction('income_receipts', 'create', 'generate_with_transaction', store.createWithTransaction);
  dataStore.registerFunction('income_receipts', 'create', 'preview_receipt', store.previewReceipt);
  dataStore.registerFunction('income_receipts', 'view', 'template_data', store.viewTemplateData);
};

export default usePlugin;
