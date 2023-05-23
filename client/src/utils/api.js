import axios from 'axios'

export function useApiAccess() {
  function formatErrors(error) {
    return [error].flat().filter(e => !!e)
  }

  async function schemas(url) {
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((res) => {
          resolve(res.data)
        })
        .catch((error) => {
          reject(formatErrors(error))
        })
    })
  }

  async function list(url, params) {
    return new Promise((resolve, reject) => {
      axios
        .get(url, { params })
        .then((res) => {
          resolve(res.data)
        })
        .catch((error) => {
          reject(formatErrors(error))
        })
    })
  }

  async function view(url, params) {
    return new Promise((resolve, reject) => {
      axios
        .get(url, { params })
        .then((res) => {
          resolve(res.data.record)
        })
        .catch((error) => {
          reject(formatErrors(error))
        })
    })
  }

  async function create(url, params) {
    return new Promise((resolve, reject) => {
      axios
        .post(url, params)
        .then((res) => {
          resolve(res.data.record)
        })
        .catch(({ response }) => {
          reject(response.data.errors)
        })
    })
  }

  async function update(url, params) {
    return new Promise((resolve, reject) => {
      axios
        .put(url, params)
        .then((res) => {
          resolve(res.data.record)
        })
        .catch(({ response }) => {
          reject(response.data.errors)
        })
    })
  }

  async function remove(url) {
    return new Promise((resolve, reject) => {
      axios
        .delete(url)
        .then((res) => {
          resolve(res.data.record)
        })
        .catch(({ response }) => {
          reject(response.data.errors)
        })
    })
  }

  async function download(url) {
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then((res) => {
          resolve(res.data)
        })
        .catch((error) => {
          reject(formatErrors(error))
        })
    })
  }

  async function downloadStream(url, params) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        url: url,
        responseType: 'blob',
        data: params
      })
      .then((res) => {
        resolve(res)
      })
      .catch((error) => {
        reject(formatErrors(error))
      })
    })
  }

  return {
    schemas,
    list,
    view,
    create,
    update,
    remove,
    download,
    downloadStream
  }
}
