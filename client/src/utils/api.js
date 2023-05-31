import axios from 'axios';

import useConfig from '@/config';
const config = useConfig();

export function useApiAccess() {
  function formatUrl(modelClass, id = null, suffix) {
    const parts = [];
    parts.push(config.baseUrl);
    parts.push('api');
    parts.push(modelClass);

    if (id) {
      parts.push(id);
    }

    if (suffix) {
      parts.push(suffix.path);
    }

    return parts.join('/');
  }

  function formatErrors(error) {
    return [error].flat().filter(e => !!e);
  }

  async function schemas(modelClass = null) {
    return new Promise((resolve, reject) => {
      const url = formatUrl('schemas', modelClass);
      axios
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          reject(formatErrors(error));
        });
    });
  }

  async function list(modelClass, params, suffix = null) {
    return new Promise((resolve, reject) => {
      const url = formatUrl(modelClass, null, suffix);
      axios
        .get(url, { params })
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          reject(formatErrors(error));
        });
    });
  }

  async function view(modelClass, id, params, suffix = null) {
    return new Promise((resolve, reject) => {
      const url = formatUrl(modelClass, id, suffix);
      axios
        .get(url, { params })
        .then((res) => {
          resolve(res.data.record);
        })
        .catch((error) => {
          reject(formatErrors(error));
        });
    });
  }

  async function create(modelClass, params, suffix = null) {
    return new Promise((resolve, reject) => {
      const url = formatUrl(modelClass, null, suffix);
      axios
        .post(url, params, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((res) => {
          resolve(res.data.record);
        })
        .catch(({ response }) => {
          reject(response.data.errors);
        });
    });
  }

  async function update(modelClass, id, params, suffix = null) {
    return new Promise((resolve, reject) => {
      const url = formatUrl(modelClass, id, suffix);
      axios
        .put(url, params, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((res) => {
          resolve(res.data.record);
        })
        .catch(({ response }) => {
          reject(response.data.errors);
        });
    });
  }

  async function remove(modelClass, id, suffix = null) {
    return new Promise((resolve, reject) => {
      const url = formatUrl(modelClass, id, suffix);
      axios
        .delete(url)
        .then((res) => {
          resolve(res.data.record);
        })
        .catch(({ response }) => {
          reject(response.data.errors);
        });
    });
  }

  async function upload(modelClass, params) {
    return new Promise((resolve, reject) => {
      const url = formatUrl('schemas', modelClass, { path: 'upload' });
      axios
        .put(url, params)
        .then((res) => {
          resolve(res.data);
        })
        .catch(({ response }) => {
          reject(response.data.errors);
        });
    });
  }

  async function download(modelClass) {
    return new Promise((resolve, reject) => {
      const url = formatUrl(modelClass, null, { path: 'download' });
      axios
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          reject(formatErrors(error));
        });
    });
  }

  async function downloadStream(modelClass, id, params, suffix = null) {
    return new Promise((resolve, reject) => {
      const url = formatUrl(modelClass, id, suffix);
      axios({
        method: 'post',
        url,
        responseType: 'blob',
        data: params,
      })
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(formatErrors(error));
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
