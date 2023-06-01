const route = {
  path: '/tax_tiers',
  name: 'Tax Tiers',
  component: () => import('./TaxTiers.vue'),
}

const usePlugin = (router, dataStore) => {
  router.addRoute(route);
  return route;
};

export default usePlugin;
