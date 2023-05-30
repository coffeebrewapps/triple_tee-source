const route = {
  path: '/transactions',
  name: 'Transactions',
  component: () => import('./TransactionsPage.vue'),
};

const usePlugin = (router) => {
  router.addRoute(route);
  return route;
};

export default usePlugin;
