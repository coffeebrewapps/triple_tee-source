const fs = require('fs');

const modelClass = 'contacts';

module.exports = ({ dataAccess, utils }) => {
  function list(filters = {}) {
    return dataAccess.list(modelClass, filters);
  }

  function view(id, params) {
    const contactResult = dataAccess.view(modelClass, id, params);
    if (!contactResult.success) {
      return contactResult;
    }

    const contact = contactResult.record;
    const logoId = contact.logo;

    if (utils.isEmpty(logoId)) {
      return contactResult;
    }

    const logoResult = dataAccess.view('documents', logoId, {});

    if (!logoResult.sucess) {
      return {
        success: true,
        record: contact,
      };
    }

    const logo = logoResult.record;
    const rawLogo = fs.readFileSync(logo.filePath);
    const rawLogoDataUri = `data:${logo.mimeType};base64,${Buffer.from(rawLogo, 'binary').toString('base64')}`;

    return {
      success: true,
      record: Object.assign({}, contact, { rawLogo: rawLogoDataUri }),
    };
  }

  function create(params) {
    const { path, originalname, mimetype } = params.logo;

    const logoResult = dataAccess.create(
      'documents',
      { filename: originalname, mimeType: mimetype, filePath: path }
    );

    if (logoResult.success) {
      return dataAccess.create(modelClass, params);
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
