import { computed } from 'vue'

import { useDataAccess } from '@/utils/dataAccess'
const dataAccess = useDataAccess()

import { useFormatter } from '@/utils/formatter'
const {
  formatDate,
  formatTimestamp,
  formatTag,
  tagStyle
} = useFormatter()

import { useValidations } from '@/utils/validations'
const { isEmpty, notEmpty } = useValidations()

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

  const objectFields = computed(() => {
    return Object.keys(schemasMap.value).filter(f => objectField(f))
  })

  function inputType(field) {
    return (schemasMap.value[field] || {}).type
  }

  function inputLabel(field) {
    return (schemasMap.value[field] || {}).label
  }

  function inputValue(field, record, includeKeys, schemas) {
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

  function objectField(field) {
    return inputType(field) === 'object'
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

  async function loadForeignModelAsOption(url, id) {
    return dataAccess.view(`${url}/${id}`, {})
  }

  async function loadIncludesFromServer(field, fieldValue) {
    const options = schemasMap.value[field].options
    const foreignModelUrl = options.sourceUrl

    const promises = fieldValue.map((v) => {
      return loadForeignModelAsOption(foreignModelUrl, v)
    })

    return new Promise((resolve, reject) => {
      Promise.all(promises)
        .then((results) => {
          const formattedOptions = results.map((result) => {
            const value = options.value(result)
            const label = options.label(result)
            return { value, label }
          })
          resolve(formattedOptions)
        })
        .catch((error) => {
          console.error(error)
          reject(error)
        })
    })
  }

  function setDefaultValue(field, record) {
    const fieldValue = record[field]
    if (notEmpty(fieldValue)) { return fieldValue }

    const defaultValue = schemasMap.value[field].defaultValue
    if (notEmpty(defaultValue)) {
      return defaultValue()
    } else {
      return fieldValue
    }
  }

  async function formatDataForShow(field, record) {
    return new Promise((resolve, reject) => {
      const fieldValue = setDefaultValue(field, record)

      if (isEmpty(fieldValue)) {
        resolve(fieldValue)
        return
      }

      if (objectField(field)) {
        if (notEmpty(fieldValue)) {
          resolve(JSON.stringify(fieldValue, false, 4))
        } else {
          resolve(fieldValue)
        }
        return
      }

      if (
        inputType(field) !== 'date' && inputType(field) !== 'datetime' &&
        !multiSelectableField(field) && !singleSelectableField(field)
      ) {
        resolve(fieldValue)
        return
      }

      if (inputType(field) === 'date' || inputType(field) === 'datetime') {
        let formattedValue;
        if (typeof fieldValue === 'object') {
          formattedValue = Object.entries(fieldValue).reduce((o, [k, v]) => {
            if (notEmpty(v)) {
              o[k] = new Date(v)
            } else {
              o[k] = v
            }
            return o
          }, {})
        } else {
          formattedValue = new Date(fieldValue)
        }
        resolve(formattedValue)
        return
      }

      const fieldIncludeValues = [fieldValue].flat()

      if (notEmpty(record.includes) && notEmpty(record.includes[field]) && Object.keys(record.includes[field]).length > 0) {
        const includes = record.includes[field]
        const formattedOptions = fieldIncludeValues.map((v) => {
          const include = includes[v]
          const options = schemasMap.value[field].options
          const value = options.value(include)
          const label = options.label(include)
          return { value, label }
        })
        resolve(formattedOptions)
      } else {
        const options = schemasMap.value[field].options
        const foreignModelUrl = options.sourceUrl
        loadIncludesFromServer(field, fieldIncludeValues)
          .then((formattedOptions) => {
            resolve(formattedOptions)
          })
          .catch((error) => {
            const formattedOptions = []
            fieldIncludeValues.forEach((v) => {
              if (notEmpty(v)) {
                formattedOptions.push({ value: v, label: v })
              }
            })
            resolve(formattedOptions)
          })
      }
    })
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

    clientOptionsFields.value.forEach((field) => {
      const value = data[field]
      if (isEmpty(value) || value.length === 0) {
        delete data[field]
      }
    })

    objectFields.value.forEach((field) => {
      if (notEmpty(data[field]) && data[field].length > 0) {
        data[field] = JSON.parse(data[field])
      }
    })

    return data
  }

  function formatErrorsForDisplay(error) {
    return Object.entries(error).reduce((errors, [field, fieldErrors]) => {
      errors[field] = fieldErrors.map((errorName) => {
        return {
          name: errorName,
          params: {}
        }
      })
      return errors
    }, {})
  }

  function formatFilters(filters = {}) {
    return Object.entries(filters).reduce((o, [field, value]) => {
      if (notEmpty(value)) {
        if (singleSelectableField(field)) {
          o[field] = value[0].value
        } else if (multiSelectableField(field)) {
          o[field] = value.map(v => v.value)
        } else {
          o[field] = value
        }
      }
      return o
    }, {})
  }

  async function fetchOptions(field, offset) {
    const options = schemasMap.value[field].options || {}
    if (options.server) {
      const limit = options.limit || 5
      return new Promise((resolve, reject) => {
        dataAccess
          .list(options.sourceUrl, { offset, limit })
          .then((result) => {
            const data = result.data
            const total = result.total
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
    objectField,
    objectFields,
    formatInputOptionsData,
    formatDataFields,
    formatDataForShow,
    formatDataForSave,
    formatErrorsForDisplay,
    formatFilters,
    validateParams,
    fetchOptions,
    initOptionsData
  }
}
