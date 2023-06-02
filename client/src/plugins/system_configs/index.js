const usePlugin = (router, dataStore) => {
  function deactivateLatestConfig(modelClass, id, effectiveEnd) {
    const found = dataStore.view(modelClass, id, {}).record;
    if (!found) {
      return {
        success: false,
        errors: ['not exists'],
      };
    }

    const updated = Object.assign({}, found, { effectiveEnd });
    return dataStore.update(modelClass, id, updated);
  }

  function viewLatestConfig(modelClass, params) {
    const filters = {
      sort: {
        field: 'effectiveStart',
        order: 'desc',
      },
      include: ['baseCurrencyId', 'baseContactId'],
      offset: 0,
      limit: 1,
    };
    const latest = dataStore.list(modelClass, filters).data[0];
    return {
      success: true,
      record: latest,
    };
  }

  function replaceLatestConfig(modelClass, params) {
    const latest = viewLatestConfig(modelClass, {}).record;
    const effectiveEnd = new Date();
    if (latest) {
      deactivateLatestConfig(modelClass, latest.id, effectiveEnd);
    }

    const effectiveStart = new Date(effectiveEnd);
    effectiveStart.setSeconds(effectiveStart.getSeconds() + 1);
    return dataStore.create(modelClass, Object.assign({}, params, { effectiveStart }));
  }

  dataStore.registerFunction('system_configs', 'list', 'latest', viewLatestConfig);
  dataStore.registerFunction('system_configs', 'create', 'replace', replaceLatestConfig);
};

export default usePlugin;
