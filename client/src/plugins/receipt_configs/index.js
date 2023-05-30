const route = {
  path: '/receipt_configs',
  name: 'Receipt Configs',
  component: () => import('./ReceiptConfigs.vue'),
};

const usePlugin = (router) => {
  router.addRoute(route);
  return route;
};

export default usePlugin;
