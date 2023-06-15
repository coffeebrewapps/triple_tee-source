import { useStore } from './store';

const usePlugin = ({ router, dataStore, logger }) => {
  const store = useStore({ dataStore, logger });

  dataStore.registerFunction('chart_configs', 'view', 'data', store.chartData);
};

export default usePlugin;
