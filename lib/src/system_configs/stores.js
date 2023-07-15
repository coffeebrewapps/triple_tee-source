const modelClass = 'system_configs';

module.exports = ({ dataAccess, logger, utils }) => {
  function list(filters = {}) {
    return dataAccess.list(modelClass, filters);
  }

  function view(id, params) {
    return dataAccess.view(modelClass, id, params);
  }

  function create(params) {
    return dataAccess.create(modelClass, params);
  }

  function update(id, params) {
    return dataAccess.update(modelClass, id, params);
  }

  function remove(id) {
    return dataAccess.remove(modelClass, id);
  }

  function deactivate(id, effectiveEnd) {
    const result = dataAccess.view('system_configs', id, {});
    if (!result.success) {
      return result;
    }

    const found = result.record;
    const updated = Object.assign({}, found, { effectiveEnd });
    return dataAccess.update('system_configs', id, updated);
  }

  function viewLatest() {
    const filters = {
      sort: {
        field: 'effectiveStart',
        order: 'desc',
      },
      include: ['baseCurrencyId', 'baseContactId'],
      offset: 0,
      limit: 1,
    };

    const latest = dataAccess.list('system_configs', filters).data[0];
    return {
      success: true,
      record: latest,
    };
  }

  function replaceLatest(params) {
    const latest = viewLatest().record;
    const effectiveEnd = new Date();

    if (utils.notEmpty(latest)) {
      deactivate(latest.id, effectiveEnd);
    }

    const effectiveStart = new Date(effectiveEnd);
    effectiveStart.setSeconds(effectiveStart.getSeconds() + 1);
    return dataAccess.create('system_configs', Object.assign({}, params, { effectiveStart }));
  }

  return {
    modelClass,
    list,
    view,
    create,
    update,
    remove,
    deactivate,
    viewLatest,
    replaceLatest,
  };
};
