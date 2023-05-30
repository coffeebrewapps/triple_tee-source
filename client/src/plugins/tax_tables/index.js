const route = {
  path: '/tax_tables',
  name: 'Tax Tables',
  component: () => import('./TaxTables.vue'),
};

const usePlugin = (router, dataStore) => {
  router.addRoute(route);
  return route;
};

export default usePlugin;
