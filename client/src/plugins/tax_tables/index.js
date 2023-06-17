import { useStore } from './store';
import { useValidations } from '@/utils/validations';

const route = {
  path: '/tax_tables',
  name: 'Tax Tables',
  component: () => import('./TaxTables.vue'),
};

const viewTaxTableRoute = {
  path: '/tax_tables/:id',
  name: 'View Tax Table',
  component: () => import('./ViewTaxTable.vue'),
  meta: {
    parentRoute: { name: 'Tax Tables' },
    hidden: true,
  },
};

const usePlugin = ({ router, dataStore, logger }) => {
  const utils = useValidations();
  const store = useStore({ dataStore, utils, logger });

  router.addRoute(route);
  router.addRoute(viewTaxTableRoute);

  dataStore.registerFunction('tax_tables', 'view', 'estimate', store.estimateTax);
};

export default usePlugin;
