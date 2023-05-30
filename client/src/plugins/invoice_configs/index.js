const route = {
  path: '/invoice_configs',
  name: 'Invoice Configs',
  component: () => import('./InvoiceConfigs.vue'),
};

const usePlugin = (router) => {
  router.addRoute(route);
  return route;
};

export default usePlugin;
