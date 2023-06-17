import { useStore } from './store';
import { useValidations } from '@/utils/validations';

const route = {
  path: '/transactions',
  name: 'Transactions',
  component: () => import('./TransactionsPage.vue'),
};

const usePlugin = ({ router, dataStore, logger }) => {
  const utils = useValidations();
  const store = useStore({ dataStore, utils, logger });

  router.addRoute(route);

  dataStore.registerFunction('transactions', 'create', 'create', store.create);
  dataStore.registerFunction('transactions', 'update', 'reverse', store.reverseTransaction);
};

export default usePlugin;
