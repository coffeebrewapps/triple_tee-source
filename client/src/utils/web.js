import { useLogger } from '@/utils/logger';

export function useWebAccess(dataStore) {
  const logger = useLogger();

  function lookupFunction(modelClass, fnType, suffix) {
    const functions = dataStore.customFunctionsForModel(modelClass, fnType) || {};
    if (suffix && suffix.path) {
      return functions[suffix.path] || dataStore[fnType];
    } else {
      return functions[fnType] || dataStore[fnType];
    }
  }

  async function initData() {
    await dataStore.init();
  }

  async function schemas(modelClass = null) {
    await initData();
    return new Promise((resolve, reject) => {
      if (modelClass) {
        resolve(dataStore.viewSchemas(modelClass));
      } else {
        resolve(dataStore.listSchemas());
      }
    });
  }

  async function list(modelClass, params, suffix = null) {
    logger.debug(`web:list`, { request: 'list', modelClass, params, suffix });
    await initData();
    return new Promise((resolve, reject) => {
      const fn = lookupFunction(modelClass, 'list', suffix);

      if (modelClass === 'indexes') {
        resolve(dataStore.downloadIndexes());
      } else {
        resolve(fn(modelClass, params));
      }
    });
  }

  async function view(modelClass, id, params, suffix) {
    logger.debug(`web:view`, { request: 'view', modelClass, params, suffix });
    await initData();
    return new Promise((resolve, reject) => {
      const fn = lookupFunction(modelClass, 'view', suffix);

      const result = fn(modelClass, id, params);
      if (result.success) {
        resolve(result.record);
      } else {
        reject(result.errors);
      }
    });
  }

  async function create(modelClass, params, suffix = null) {
    logger.debug(`web:create`, { request: 'create', modelClass, params, suffix });
    await initData();

    const fn = lookupFunction(modelClass, 'create', suffix);
    const result = await fn(modelClass, params);
    return new Promise((resolve, reject) => {
      if (result.success) {
        resolve(result.record);
      } else {
        reject(result.errors);
      }
    });
  }

  async function update(modelClass, id, params, suffix = null) {
    logger.debug(`web:update`, { request: 'update', modelClass, id, params, suffix });
    await initData();

    const fn = lookupFunction(modelClass, 'update', suffix);
    const result = await fn(modelClass, id, params);
    return new Promise((resolve, reject) => {
      if (result.success) {
        resolve(result.record);
      } else {
        reject(result.errors);
      }
    });
  }

  async function remove(modelClass, id, suffix = null) {
    logger.debug(`web:remove`, { request: 'remove', modelClass, id, suffix });
    await initData();
    return new Promise((resolve, reject) => {
      const fn = lookupFunction(modelClass, 'remove', suffix);

      const result = fn(modelClass, id);
      if (result.success) {
        resolve(result.record);
      } else {
        reject(result.errors);
      }
    });
  }

  async function upload(modelClass, params) {
    logger.debug(`web:upload`, { request: 'upload', modelClass, params });
    await initData();
    return new Promise((resolve, reject) => {
      if (modelClass === 'indexes') {
        const result = dataStore.uploadIndexes(params);
        resolve(result);
      } else {
        const result = dataStore.upload(modelClass, params);
        resolve(result);
      }
    });
  }

  async function download(modelClass) {
    logger.debug(`web:download`, { request: 'download', modelClass });
    await initData();
    return new Promise((resolve, reject) => {
      const result = dataStore.download(modelClass);
      resolve(result.data);
    });
  }

  async function downloadStream(modelClass, id, params, suffix = null) {
    logger.debug(`web:downloadStream`, { request: 'downloadStream', modelClass, id, params, suffix });
    await initData();
    return new Promise((resolve, reject) => {
      const fn = lookupFunction(modelClass, 'downloadStream', suffix);

      fn(modelClass, id, params)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  return {
    schemas,
    list,
    view,
    create,
    update,
    remove,
    upload,
    download,
    downloadStream,
  };
}
