const modelClass = 'contacts';

module.exports = ({ dataAccess, utils }) => {
  function list(filters = {}) {
    return dataAccess.list(modelClass, filters);
  }

  function view(id, params) {
    return dataAccess.view(modelClass, id, params);
  }

  function create(params) {
    const { path, originalname, mimetype } = params.logo;

    const logoResult = dataAccess.create(
      'documents',
      { filename: originalname, mimeType: mimetype, filePath: path }
    );

    if (logoResult.success) {
      return dataAccess.create(modelClass, Object.assign({}, params, { logo: logoResult.record.id }));
    } else {
      return logoResult;
    }
  }

  function update(id, params) {
    const { path, originalname, mimetype } = params.logo;

    const logoResult = dataAccess.create(
      'documents',
      { filename: originalname, mimeType: mimetype, filePath: path }
    );

    if (logoResult.success) {
      return dataAccess.update(modelClass, id, Object.assign({}, params, { logo: logoResult.record.id }));
    } else {
      return logoResult;
    }
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
