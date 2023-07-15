import { default as initStore } from '#/chart_configs/stores.js';

export function useStore({ dataStore, utils, logger }) {
  const store = initStore({ dataAccess: dataStore, logger, utils });

  function chartData(modelClass, id) {
    return store.chartData(id);
  }

  return {
    chartData,
  };
}
