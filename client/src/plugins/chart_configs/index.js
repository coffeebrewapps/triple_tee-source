import { useStore } from './store';
import { useValidations } from '@/utils/validations';

const usePlugin = ({ router, dataStore, logger }) => {
  const utils = useValidations();
  const store = useStore({ dataStore, utils, logger });

  dataStore.registerFunction('chart_configs', 'view', 'data', store.chartData);
};

export default usePlugin;
