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
    const found = view(id, {}).record;
    if (utils.isEmpty(found)) {
      return {
        success: false,
        errors: {
          id: ['notFound'],
        },
      };
    }

    const updated = Object.assign({}, found, { effectiveEnd });
    return update(id, updated);
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
    const latest = list(filters).data[0];
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
    return create(Object.assign({}, params, { effectiveStart }));
  }

  return {
    modelClass,
    list,
    view,
    create,
    update,
    remove,
    viewLatest,
    replaceLatest,
  };
};
