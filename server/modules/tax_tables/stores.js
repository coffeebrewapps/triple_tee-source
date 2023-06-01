const modelClass = 'tax_tables';

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

  function viewWithTiers(id, params) {
    const taxTableResult = dataAccess.view(modelClass, id, params);

    if (taxTableResult.success) {
      const taxTable = taxTableResult.record;
      const taxTiers = dataAccess.list('tax_tiers', { filters: { taxTableId: taxTable.id } });

      return {
        success: true,
        record: Object.assign({}, taxTable, { taxTiers }),
      };
    } else {
      return taxTableResult;
    }
  }

  return {
    modelClass,
    list,
    view,
    create,
    update,
    remove,
  };
};
