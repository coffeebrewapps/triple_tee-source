import { useStore } from './store';

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
  const store = useStore(dataStore);

  router.addRoute(route);
  router.addRoute(viewReceiptRoute);
  router.addRoute(createReceiptRoute);

  dataStore.registerFunction('income_receipts', 'create', 'generate_with_transaction', store.createWithTransaction);
  dataStore.registerFunction('income_receipts', 'create', 'preview_receipt', store.previewReceipt);
  dataStore.registerFunction('income_receipts', 'view', 'template_data', store.viewTemplateData);

  return route;
};

export default usePlugin;
