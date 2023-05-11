import { computed } from 'vue'

import axios from 'axios'

export function useInputHelper(schemas) {
  const schemasMap = computed(() => {
    return schemas.reduce((o, s) => {
      o[s.key] = s
      return o
    }, {})
  })

  const serverOptionsFields = computed(() => {
    return Object.keys(schemasMap.value).filter(f => serverOptionsField(f))
  })

  const selectableKeys = computed(() => {
    return Object.keys(schemasMap.value).filter(f => selectableField(f))
  })

  function inputType(field) {
    return (schemasMap.value[field] || {}).type
  }

  function inputLabel(field) {
    return (schemasMap.value[field] || {}).label
  }

  function inputableField(field) {
    return inputType(field) === 'text' || inputType(field) === 'number'
  }

  function selectableField(field) {
    return inputType(field) === 'select' || inputType(field) === 'multiSelect' || inputType(field) === 'enum'
  }

  function serverOptionsField(field) {
    return selectableField(field) && schemasMap.value[field].options && schemasMap.value[field].options.server
  }

  function formatInputOptionsData(field, offset, limit, dataFromServer) {
    return Object.assign(
      {},
      {
        loading: false,
        pagination: { limit: limit, client: false }
      },
      dataFromServer
    )
  }

  function formatDate(rawValue) {
    const formatOptions = Intl.DateTimeFormat().resolvedOptions()
    const locale = formatOptions.locale
    const year = formatOptions.year
    const month = formatOptions.month
    const day = formatOptions.day
    const timeZone = formatOptions.timeZone
    return (new Date(rawValue)).toLocaleDateString(locale)
  }

  async function fetchOptions(field, offset) {
    const options = schemasMap.value[field].options || {}
    if (options.server) {
      const limit = schemasMap.value[field].limit || 5
      return new Promise((resolve, reject) => {
        axios
          .get(options.sourceUrl, { params: { offset, limit } })
          .then((result) => {
            const data = result.data.data
            const total = result.data.total
            const dataFromServer = {
              total,
              data: data.map((row) => {
                return {
                  value: options.value(row),
                  label: options.label(row)
                }
              })
            }
            resolve(formatInputOptionsData(field, offset, limit, dataFromServer))
          })
      })
    } else {
      return new Promise((resolve, reject) => {
        resolve(Object.assign(
          {},
          {
            data: options,
            total: options.length,
            loading: false,
            pagination: { limit: 5, client: true }
          }
        ))
      })
    }
  }

  async function initOptionsData() {
    return new Promise((resolve, reject) => {
      Promise.all(serverOptionsFields.value.map((field) => {
        const offset = schemasMap.value[field].offset || 0
        return fetchOptions(field, offset)
      }))
      .then((values) => {
        const data = {}
        values.forEach((value, i) => {
          const field = serverOptionsFields.value[i]
          data[field] = value
        })
        resolve(data)
      })
      .catch((err) => {
        reject(err)
      })
    })
  }

  return {
    schemasMap,
    serverOptionsFields,
    serverOptionsField,
    selectableKeys,
    inputType,
    inputLabel,
    inputableField,
    selectableField,
    formatInputOptionsData,
    formatDate,
    fetchOptions,
    initOptionsData
  }
}
