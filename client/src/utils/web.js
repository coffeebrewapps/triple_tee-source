'use strict'

import { useDataStore } from '@/stores/data'
const dataStore = useDataStore()

export function useWebAccess() {
  function formatErrors(error) {
    return [error].flat().filter(e => !!e)
  }

  async function initData(force = false) {
    await dataStore.initData(force)
  }

  async function schemas(modelClass = null) {
    await initData()
    return new Promise((resolve, reject) => {
      if (modelClass) {
        resolve(dataStore.viewSchemas(modelClass))
      } else {
        resolve(dataStore.listSchemas())
      }
    })
  }

  async function list(modelClass, params, suffix = null) {
    await initData()
    return new Promise((resolve, reject) => {
      if (modelClass === 'indexes') {
        resolve(dataStore.downloadIndexes())
      } else {
        resolve(dataStore.list(modelClass, params))
      }
    })
  }

  async function view(modelClass, id, params, suffix) {
    await initData()
    return new Promise((resolve, reject) => {
      resolve(dataStore.view(modelClass, id, params).record)
    })
  }

  async function create(modelClass, params, suffix = null) {
    await initData()
    return new Promise((resolve, reject) => {
      const result = dataStore.create(modelClass, params)
      if (result.success) {
        resolve(result.record)
      } else {
        reject(result.errors)
      }
    })
  }

  async function update(modelClass, id, params, suffix = null) {
    await initData()
    return new Promise((resolve, reject) => {
      const result = dataStore.update(modelClass, id, params)
      if (result.success) {
        resolve(result.record)
      } else {
        reject(result.errors)
      }
    })
  }

  async function remove(modelClass, id, suffix = null) {
    await initData()
    return new Promise((resolve, reject) => {
      const result = dataStore.remove(modelClass, id)
      if (result.success) {
        resolve(result.record)
      } else {
        reject(result.errors)
      }
    })
  }

  async function upload(modelClass, params) {
    await initData()
    return new Promise((resolve, reject) => {
      if (modelClass === 'indexes') {
        const result = dataStore.uploadIndexes(params)
        resolve(result)
      } else {
        const result = dataStore.upload(modelClass, params)
        resolve(result)
      }
    })
  }

  async function download(modelClass) {
    await initData()
    return new Promise((resolve, reject) => {
      const result = dataStore.download(modelClass, params)
      resolve(result.data)
    })
  }

  async function downloadStream(modelClass, id, params) {
    await initData()
    return new Promise((resolve, reject) => {
      resolve({
        filename: `blank.json`,
        data: JSON.stringify({})
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
    upload,
    download,
    downloadStream
  }
}
