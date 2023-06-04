const modelClass = 'contacts';

module.exports = ({ dataAccess, utils }) => {
  function list(filters = {}) {
    return dataAccess.list(modelClass, filters);
  }

  function view(id, params) {
    return dataAccess.view(modelClass, id, params);
  }

  function create(params) {
    const updatedParams = Object.assign({}, params);

    if (utils.notEmpty(params.logo)) {
      const { path, originalname, mimetype } = params.logo;

      const logoResult = dataAccess.create(
        'documents',
        { filename: originalname, mimeType: mimetype, filePath: path }
      );

      if (!logoResult.success) {
        return logoResult;
      }

      updatedParams.logo = logoResult.record.id;
    }

    return dataAccess.create(modelClass, updatedParams);
  }

  function update(id, params) {
    const updatedParams = Object.assign({}, params);

    if (utils.notEmpty(params.logo)) {
      const { path, originalname, mimetype } = params.logo;

      const logoResult = dataAccess.create(
        'documents',
        { filename: originalname, mimeType: mimetype, filePath: path }
      );

      if (!logoResult.success) {
        return logoResult;
      }

      updatedParams.logo = logoResult.record.id;
    }

    return dataAccess.update(modelClass, id, updatedParams);
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
