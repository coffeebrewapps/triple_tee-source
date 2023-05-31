const modelClass = 'documents';

module.exports = ({ dataAccess, logger, utils }) => {
  function list(filters = {}) {
    return dataAccess.list(modelClass, filters);
  }

  function view(id, params) {
    const result = dataAccess.view(modelClass, id, params);
    if (result.success) {
      const record = result.record;
      const rawData = dataAccess.downloadRawFile(record.mimeType, record.filePath);
      return {
        success: true,
        record: Object.assign({}, record, { rawData }),
      };
    } else {
      return result;
    }
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

  return {
    modelClass,
    list,
    view,
    create,
    update,
    remove,
  };
};
