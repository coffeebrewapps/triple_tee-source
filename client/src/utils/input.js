import { computed } from 'vue'

import { useFormatter } from '@/utils/formatter'
const {
  formatDate,
  formatTimestamp,
  formatTag,
  tagStyle
} = useFormatter()

import axios from 'axios'

export function useInputHelper(schemas) {
  const schemasMap = computed(() => {
    return schemas.reduce((o, s) => {
      o[s.key] = s
      return o
    }, {})
  })

  const clientOptionsFields = computed(() => {
    return Object.keys(schemasMap.value).filter(f => clientOptionsField(f))
  })

  const serverOptionsFields = computed(() => {
    return Object.keys(schemasMap.value).filter(f => serverOptionsField(f))
  })

  const selectableKeys = computed(() => {
    return Object.keys(schemasMap.value).filter(f => selectableField(f))
  })

  const multiSelectableFields = computed(() => {
    return Object.keys(schemasMap.value).filter(f => multiSelectableField(f))
  })

  const singleSelectableFields = computed(() => {
    return Object.keys(schemasMap.value).filter(f => singleSelectableField(f))
  })

  const nullToggleableFields = computed(() => {
    return Object.keys(schemasMap.value).filter(f => nullToggleableField(f))
  })

  const tagsFields = computed(() => {
    return Object.keys(schemasMap.value).filter(f => tagsField(f))
  })

  function inputType(field) {
    return (schemasMap.value[field] || {}).type
  }

  function inputLabel(field) {
    return (schemasMap.value[field] || {}).label
  }

  function inputValue(field, record, includeKeys) {
    const referenceField = includeKeys.find(v => v === field)
    const fieldValue = record[field]
    if (!fieldValue) { return }

    if (referenceField) {
      const includes = record.includes || {}
      const rawValue = [fieldValue].flat().filter(v => !!v)

      const mapped = rawValue.map((value) => {
        const foreignValue = includes[field][value]
        return schemasMap.value[field].reference.label(foreignValue)
      })

      if (multiSelectableField(field)) {
        return mapped
      } else {
        return mapped[0]
      }
    } else if (inputType(field) === 'enum' || inputType(field) === 'select') {
      const found = schemas.find(f => f.key === field)
      const options = found.options
      return options.find(o => o.value === fieldValue).label
    } else if (inputType(field) === 'datetime') {
      return formatTimestamp(fieldValue)
    } else if (inputType(field) === 'date') {
      return formatDate(fieldValue)
    } else {
      return fieldValue
    }
  }

  function inputableField(field) {
    return inputType(field) === 'text' || inputType(field) === 'number'
  }

  function multiInputableField(field) {
    return inputType(field) === 'textarea'
  }

  function multiSelectableField(field) {
    return inputType(field) === 'multiSelect'
  }

  function singleSelectableField(field) {
    return inputType(field) === 'singleSelect'
  }

  function clientOptionsField(field) {
    return inputType(field) === 'select' || inputType(field) === 'enum'
  }

  function selectableField(field) {
    return (
      inputType(field) === 'select' ||
      inputType(field) === 'multiSelect' ||
      inputType(field) === 'singleSelect' ||
      inputType(field) === 'enum'
    )
  }

  function serverOptionsField(field) {
    return selectableField(field) && schemasMap.value[field].options && schemasMap.value[field].options.server
  }

  function nullToggleableField(field) {
    return schemasMap.value[field].nullToggleable
  }

  function tagsField(field) {
    return field === 'tags' || Object.is(schemasMap.value[field].isTags, true)
  }

  function formatInputOptionsData(field, offset, limit, dataFromServer) {
    return Object.assign(
      {},
      {
        loading: false,
        pagination: { offset, limit, client: false }
      },
      dataFromServer
    )
  }

  function formatDataFields(fields) {
    return schemas.map((field) => {
      if (field.type === 'enum') {
        const enums = fields[field.key].enums
        const options = Object.keys(enums).map((e) => {
          return { value: e, label: enums[e] }
        })
        const combined = Object.assign({}, field, { options })
        return combined
      } else {
        return field
      }
    })
  }

  function validateParams(validations, params) {
    return Object.keys(validations).reduce((errors, field) => {
      const validators = validations[field]
      const fieldErrors = validators.map((validator) => {
        return validator(params)
      }).filter(e => !!e)

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors
      }
      return errors
    }, {})
  }

  function formatDataForShow(field, record) {
    if ((inputType(field) === 'date' || inputType(field) === 'datetime') && !!record[field]) {
      return new Date(record[field])
    } else if (multiSelectableField(field) && !!record.includes) {
      const includes = record.includes[field]
      const fieldValue = record[field]
      if (!!includes && Object.keys(includes).length > 0) {
        return fieldValue.map((v) => {
          const include = includes[v]
          const options = schemasMap.value[field].options
          const value = options.value(include)
          const label = options.label(include)
          return { value, label }
        })
      } else {
        return record[field]
      }
    } else if (singleSelectableField(field) && !!record.includes) {
      const includes = record.includes[field]
      const fieldValue = record[field]
      if (!!fieldValue && !!includes && Object.keys(includes).length > 0) {
        const include = includes[fieldValue]
        const options = schemasMap.value[field].options
        const value = options.value(include)
        const label = options.label(include)
        return [{ value, label }]
      } else {
        return record[field]
      }
    } else {
      return record[field]
    }
  }

  function formatDataForSave(params) {
    const data = Object.assign({}, params)

    multiSelectableFields.value.forEach((field) => {
      const values = (data[field] || [])
      data[field] = values.map(v => v.value)
    })

    singleSelectableFields.value.forEach((field) => {
      const values = (data[field] || [])
      data[field] = (values[0] || {}).value
    })

    return data
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
            pagination: { offset: 0, limit: 5, client: true }
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
    clientOptionsFields,
    clientOptionsField,
    serverOptionsFields,
    serverOptionsField,
    selectableKeys,
    multiSelectableFields,
    singleSelectableFields,
    inputType,
    inputLabel,
    inputValue,
    inputableField,
    multiInputableField,
    multiSelectableField,
    singleSelectableField,
    selectableField,
    nullToggleableField,
    nullToggleableFields,
    tagsField,
    tagsFields,
    formatInputOptionsData,
    formatDataFields,
    formatDataForShow,
    formatDataForSave,
    validateParams,
    fetchOptions,
    initOptionsData
  }
}
