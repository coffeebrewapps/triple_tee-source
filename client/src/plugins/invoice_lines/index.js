const route = {
  path: '/invoice_lines',
  name: 'Invoice Lines',
  component: () => import('./InvoiceLines.vue'),
};

const usePlugin = (router) => {
  router.addRoute(route);
  return route;
};

export default usePlugin;
