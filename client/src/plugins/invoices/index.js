import { useStore } from './store';
import { useValidations } from '@/utils/validations';

const usePlugin = ({ router, dataStore, logger }) => {
  const utils = useValidations();
  const store = useStore({ dataStore, utils, logger });

  dataStore.registerFunction('invoices', 'create', 'generate_with_lines', store.createWithLines);
  dataStore.registerFunction('invoices', 'create', 'preview_invoice', store.previewInvoice);
  dataStore.registerFunction('invoices', 'view', 'template_data', store.viewTemplateData);
  dataStore.registerFunction('invoices', 'update', 'void', store.voidInvoice);
};

export default usePlugin;
