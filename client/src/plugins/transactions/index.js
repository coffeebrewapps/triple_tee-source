import { useStore } from './store';

const route = {
  path: '/transactions',
  name: 'Transactions',
  component: () => import('./TransactionsPage.vue'),
};

const usePlugin = ({ router, dataStore }) => {
  const store = useStore({ dataStore });

  router.addRoute(route);

  dataStore.registerFunction('transactions', 'create', 'create', store.create);
  dataStore.registerFunction('transactions', 'update', 'reverse', store.reverseTransaction);
};

export default usePlugin;
