export function useStore({ dataStore, uploader }) {
  function notEmpty(value) {
    return !isEmpty(value);
  }

  function isEmpty(value) {
    return Object.is(value, undefined) || Object.is(value, null);
  }

  async function createWithUpload(modelClass, params) {
    const file = params.logo;

    if (notEmpty(file)) {
      const { filename, mimeType, filePath } = await uploader.upload('logo', file);

      const logoResult = dataStore.create(
        'documents',
        { filename, mimeType, filePath }
      );

      if (logoResult.success) {
        return dataStore.create(modelClass, Object.assign({}, params, { logo: logoResult.record.id }));
      } else {
        return logoResult;
      }
    } else {
      return dataStore.create(modelClass, params);
    }
  }

  async function updateWithUpload(modelClass, id, params) {
    const file = params.logo;

    if (notEmpty(file)) {
      const { filename, mimeType, filePath } = await uploader.upload('logo', file);

      const logoResult = dataStore.create(
        'documents',
        { filename, mimeType, filePath }
      );

      if (logoResult.success) {
        return dataStore.update(modelClass, id, Object.assign({}, params, { logo: logoResult.record.id }));
      } else {
        return logoResult;
      }
    } else {
      return dataStore.update(modelClass, id, params);
    }
  }

  return {
    createWithUpload,
    updateWithUpload,
  };
}
