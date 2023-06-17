import { default as initStore } from '#/contacts/stores.js';

export function useStore({ dataStore, uploader, utils, logger }) {
  const store = initStore({ dataAccess: dataStore, logger, utils });

  async function createWithUpload(modelClass, params) {
    const file = params.logo;

    if (utils.notEmpty(file)) {
      const { filename, mimeType, filePath } = await uploader.upload('logo', file);

      params.logo = { path: filePath, originalname: filename, mimetype: mimeType };
    }

    return store.create(params);
  }

  async function updateWithUpload(modelClass, id, params) {
    const file = params.logo;

    if (utils.notEmpty(file)) {
      const { filename, mimeType, filePath } = await uploader.upload('logo', file);

      params.logo = { path: filePath, originalname: filename, mimetype: mimeType };
    }

    return store.update(id, params);
  }

  return {
    createWithUpload,
    updateWithUpload,
  };
}
