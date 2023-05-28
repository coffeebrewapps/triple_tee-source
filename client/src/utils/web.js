'use strict'

import { useDataStore } from '@/stores/data'
const dataStore = useDataStore()

export function useWebAccess() {
  function formatErrors(error) {
    return [error].flat().filter(e => !!e)
  }

  function lookupFunction(modelClass, fnType, suffix) {
    if (suffix) {
      const functions = dataStore.customFunctionsForModel(modelClass, fnType) || {}
      return functions[suffix.path] || dataStore[fnType]
    } else {
      return dataStore[fnType]
    }
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
      const fn = lookupFunction(modelClass, 'list', suffix)

      if (modelClass === 'indexes') {
        resolve(dataStore.downloadIndexes())
      } else {
        resolve(fn(modelClass, params))
      }
    })
  }

  async function view(modelClass, id, params, suffix) {
    await initData()
    return new Promise((resolve, reject) => {
      const fn = lookupFunction(modelClass, 'view', suffix)

      resolve(fn(modelClass, id, params).record)
    })
  }

  async function create(modelClass, params, suffix = null) {
    await initData()
    return new Promise((resolve, reject) => {
      const fn = lookupFunction(modelClass, 'create', suffix)

      const result = fn(modelClass, params)
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
      const fn = lookupFunction(modelClass, 'update', suffix)

      const result = fn(modelClass, id, params)
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
      const fn = lookupFunction(modelClass, 'remove', suffix)

      const result = fn(modelClass, id)
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

  async function downloadStream(modelClass, id, params, suffix = null) {
    await initData()
    return new Promise((resolve, reject) => {
      const fn = lookupFunction(modelClass, 'downloadStream', suffix)

      const result = fn(modelClass, id, params)
      resolve(result)
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
