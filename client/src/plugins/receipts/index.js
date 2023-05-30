const route = {
  path: '/receipts',
  name: 'Receipts',
  component: () => import('./ReceiptsPage.vue'),
};

const viewReceiptRoute = {
  path: '/receipts/:id',
  name: 'View Receipt',
  component: () => import('./ViewReceipt.vue'),
  meta: {
    parentRoute: { name: 'Receipts' },
    hidden: true,
  },
};

const createReceiptRoute = {
  path: '/receipts',
  name: 'Create Receipt',
  component: () => import('./CreateReceipt.vue'),
  meta: {
    parentRoute: { name: 'Receipts' },
    hidden: true,
  },
};

const usePlugin = (router, dataStore) => {
  router.addRoute(route);
  router.addRoute(viewReceiptRoute);
  router.addRoute(createReceiptRoute);

  return route;
};

export default usePlugin;
