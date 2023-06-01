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
  router.addRoute(route);
  router.addRoute(viewTaxTableRoute);
  return route;
};

export default usePlugin;
