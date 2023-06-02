import { useStore } from './store';

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

const usePlugin = (router, dataStore) => {
  const store = useStore(dataStore);

  router.addRoute(route);
  router.addRoute(viewTaxTableRoute);

  dataStore.registerFunction('tax_tables', 'view', 'estimate', store.estimateTax);

  return route;
};

export default usePlugin;
