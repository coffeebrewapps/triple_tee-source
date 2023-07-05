import { computed } from 'vue';

import { useDataAccess } from '@/utils/dataAccess';
import { useFormatter } from '@/utils/formatter';
import { useValidations } from '@/utils/validations';
import { useFileUtils } from '@/utils/file';
import { useLogger } from '@/utils/logger';

export function useInputHelper(schemas) {
  const dataAccess = useDataAccess();
  const {
    formatDate,
    formatTimestamp,
  } = useFormatter();
  const { isEmpty, notEmpty } = useValidations();

  const {
    base64ToFile,
  } = useFileUtils();

  const logger = useLogger();

  const schemasMap = computed(() => {
    return schemas.reduce((o, s) => {
      o[s.key] = s;
      return o;
    }, {});
  });

  const listableFields = computed(() => {
    return Object.values(schemasMap.value).filter(f => f.listable);
  });

  const listableKeys = computed(() => {
    return listableFields.value.map(f => f.key);
  });

  const viewableFields = computed(() => {
    return Object.values(schemasMap.value).filter(f => f.viewable);
  });

  const viewableKeys = computed(() => {
    return viewableFields.value.map(f => f.key);
  });

  const creatableFields = computed(() => {
    return Object.values(schemasMap.value).filter(f => f.creatable);
  });

  const creatableKeys = computed(() => {
    return creatableFields.value.map(f => f.key);
  });

  const updatableFields = computed(() => {
    return Object.values(schemasMap.value).filter(f => f.updatable);
  });

  const updatableKeys = computed(() => {
    return updatableFields.value.map(f => f.key);
  });

  const sortableFields = computed(() => {
    return Object.values(schemasMap.value).filter(f => f.sortable);
  });

  const sortableKeys = computed(() => {
    return sortableFields.value.map(f => f.key);
  });

  const multipartData = computed(() => {
    return Object.values(schemasMap.value).some(f => f.type === 'file');
  });

  const clientOptionsKeys = computed(() => {
    return Object.keys(schemasMap.value).filter(f => clientOptionsField(f));
  });

  const serverOptionsKeys = computed(() => {
    return Object.keys(schemasMap.value).filter(f => serverOptionsField(f));
  });

  const selectableKeys = computed(() => {
    return Object.keys(schemasMap.value).filter(f => selectableField(f));
  });

  const multiSelectableKeys = computed(() => {
    return Object.keys(schemasMap.value).filter(f => multiSelectableField(f));
  });

  const singleSelectableKeys = computed(() => {
    return Object.keys(schemasMap.value).filter(f => singleSelectableField(f));
  });

  const nullToggleableKeys = computed(() => {
    return Object.keys(schemasMap.value).filter(f => nullToggleableField(f));
  });

  const tagsKeys = computed(() => {
    return Object.keys(schemasMap.value).filter(f => tagsField(f));
  });

  const objectKeys = computed(() => {
    return Object.keys(schemasMap.value).filter(f => objectField(f));
  });

  const numberKeys = computed(() => {
    return Object.keys(schemasMap.value).filter(f => numberField(f));
  });

  const fileKeys = computed(() => {
    return Object.keys(schemasMap.value).filter(f => fileField(f));
  });

  const include = computed(() => {
    return schemas.filter(f => f.reference || f.file);
  });

  const includeKeys = computed(() => {
    return include.value.map(h => h.key);
  });

  function inputType(field) {
    return (schemasMap.value[field] || {}).type;
  }

  function inputLabel(field) {
    return (schemasMap.value[field] || {}).label;
  }

  function inputValue(field, record, includeKeys, schemas, systemConfigs) {
    const referenceField = includeKeys.find(v => v === field);
    const fieldValue = record[field];
    if (isEmpty(fieldValue)) { return; }

    if (notEmpty(referenceField) && !fileField(field)) {
      const includes = record.includes || {};
      const rawValue = [fieldValue].flat().filter(v => !!v);

      const mapped = rawValue.map((value) => {
        if (isEmpty(includes[field])) { return value; }

        const foreignValue = includes[field][value];
        if (isEmpty(foreignValue)) { return value; }

        return schemasMap.value[field].reference.label(foreignValue);
      });

      if (multiSelectableField(field)) {
        return mapped;
      } else {
        return mapped[0];
      }
    } else if (inputType(field) === 'enum' || inputType(field) === 'select') {
      const found = schemas.find(f => f.key === field);
      const options = found.options;
      return options.find(o => o.value === fieldValue).label;
    } else if (inputType(field) === 'datetime') {
      return formatTimestamp(fieldValue, systemConfigs.timezone);
    } else if (inputType(field) === 'date') {
      return formatDate(fieldValue, systemConfigs.timezone);
    } else if (fileField(field)) {
      const includes = record.includes || {};
      if (isEmpty(includes[field])) { return; }

      const foreignValue = includes[field][fieldValue];
      if (isEmpty(foreignValue)) { return; }

      return foreignValue.rawData;
    } else {
      return fieldValue;
    }
  }

  function inputableField(field) {
    return inputType(field) === 'text' || inputType(field) === 'number';
  }

  function multiInputableField(field) {
    return inputType(field) === 'textarea';
  }

  function multiSelectableField(field) {
    return inputType(field) === 'multiSelect';
  }

  function singleSelectableField(field) {
    return inputType(field) === 'singleSelect';
  }

  function clientOptionsField(field) {
    return inputType(field) === 'select' || inputType(field) === 'enum';
  }

  function selectableField(field) {
    return (
      inputType(field) === 'select' ||
      inputType(field) === 'multiSelect' ||
      inputType(field) === 'singleSelect' ||
      inputType(field) === 'enum'
    );
  }

  function serverOptionsField(field) {
    return selectableField(field) && schemasMap.value[field].options && schemasMap.value[field].options.server;
  }

  function nullToggleableField(field) {
    return schemasMap.value[field].nullToggleable;
  }

  function tagsField(field) {
    return field === 'tags' || Object.is(schemasMap.value[field].isTags, true);
  }

  function objectField(field) {
    return inputType(field) === 'object';
  }

  function numberField(field) {
    return inputType(field) === 'number';
  }

  function fileField(field) {
    return inputType(field) === 'file';
  }

  function formatInputOptionsData(field, offset, limit, dataFromServer) {
    return Object.assign(
      {},
      {
        loading: false,
        pagination: { offset, limit, client: false },
      },
      dataFromServer
    );
  }

  function formatDataFields(fields) {
    return schemas.map((field) => {
      if (field.type === 'enum') {
        const enums = fields[field.key].enums;
        const options = Object.keys(enums).map((e) => {
          return { value: e, label: enums[e] };
        });
        const combined = Object.assign({}, field, { options });
        return combined;
      } else {
        return field;
      }
    });
  }

  function validateParams(validations, params) {
    return Object.keys(validations).reduce((errors, field) => {
      const validators = validations[field];
      const fieldErrors = validators.map((validator) => {
        return validator(params);
      }).filter(e => !!e);

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
      return errors;
    }, {});
  }

  async function loadForeignModelAsOption(modelClass, id) {
    return dataAccess.view(modelClass, id, {});
  }

  async function loadIncludesFromServer(field, fieldValue) {
    const options = schemasMap.value[field].options;
    const foreignModelClass = options.modelClass;

    const promises = fieldValue.map((v) => {
      return loadForeignModelAsOption(foreignModelClass, v);
    });

    return new Promise((resolve, reject) => {
      Promise.all(promises)
        .then((results) => {
          const formattedOptions = results.map((result) => {
            const value = options.value(result);
            const label = options.label(result);
            return { value, label };
          });
          resolve(formattedOptions);
        })
        .catch((error) => {
          logger.error(`Error loading includes from server`, error);
          reject(error);
        });
    });
  }

  function setDefaultValue(field, record) {
    const fieldValue = record[field];
    if (notEmpty(fieldValue)) { return fieldValue; }

    const defaultValue = schemasMap.value[field].defaultValue;
    if (notEmpty(defaultValue)) {
      return defaultValue();
    } else {
      return fieldValue;
    }
  }

  async function formatDataForShow(field, record) {
    return new Promise((resolve, reject) => {
      const fieldValue = setDefaultValue(field, record);

      if (isEmpty(fieldValue)) {
        resolve(fieldValue);
        return;
      }

      if (objectField(field)) {
        resolve(JSON.stringify(fieldValue, false, 4));
        return;
      }

      if (fileField(field)) {
        const fileOptions = schemasMap.value[field].file;

        if (
          notEmpty(record.includes) &&
          notEmpty(record.includes[field]) &&
          Object.keys(record.includes[field]).length > 0
        ) {
          const foreignValue = record.includes[field][fieldValue];

          base64ToFile(foreignValue.rawData, foreignValue.filename, foreignValue.mimeType)
            .then((file) => {
              resolve(file);
            })
            .catch((error) => {
              logger.error(`Error converting base64 to file`, { error });
              resolve(null);
            });
        } else {
          dataAccess
            .view(fileOptions.modelClass, fieldValue, {})
            .then((result) => {
              base64ToFile(result.rawData, result.filename, result.mimeType)
                .then((file) => {
                  if (isEmpty(record.includes)) {
                    record.includes = {};
                  }

                  if (isEmpty(record.includes[field])) {
                    record.includes[field] = {};
                  }

                  record.includes[field][fieldValue] = result;
                  resolve(file);
                })
                .catch((error) => {
                  logger.error(`Error converting base64 to file`, { error });
                  resolve(null);
                });
            })
            .catch((error) => {
              logger.error(`Error formatting data for show`, error);
              resolve(null);
            });
        }
        return;
      }

      if (
        inputType(field) !== 'date' && inputType(field) !== 'datetime' &&
        !multiSelectableField(field) && !singleSelectableField(field)
      ) {
        resolve(fieldValue);
        return;
      }

      if (inputType(field) === 'date' || inputType(field) === 'datetime') {
        let formattedValue;
        if (fieldValue instanceof Date || typeof fieldValue === 'string') {
          formattedValue = new Date(fieldValue);
        } else {
          formattedValue = Object.entries(fieldValue).reduce((o, [k, v]) => {
            if (notEmpty(v)) {
              o[k] = new Date(v);
            } else {
              o[k] = v;
            }
            return o;
          }, {});
        }
        resolve(formattedValue);
        return;
      }

      const fieldIncludeValues = [fieldValue].flat();

      if (
        (singleSelectableField(field) || multiSelectableField(field)) &&
        Array.isArray(schemasMap.value[field].options)
      ) {
        const options = schemasMap.value[field].options;
        const formattedOptions = fieldIncludeValues.map((v) => {
          const matched = options.find(o => o.value === v);
          return { value: matched.value, label: matched.label };
        });
        resolve(formattedOptions);
        return;
      }

      if (
        notEmpty(record.includes) &&
        notEmpty(record.includes[field]) &&
        Object.keys(record.includes[field]).length > 0
      ) {
        const includes = record.includes[field];
        const formattedOptions = fieldIncludeValues.map((v) => {
          const include = includes[v];
          const options = schemasMap.value[field].options;
          const value = options.value(include);
          const label = options.label(include);
          return { value, label };
        });
        resolve(formattedOptions);
      } else {
        loadIncludesFromServer(field, fieldIncludeValues)
          .then((formattedOptions) => {
            resolve(formattedOptions);
          })
          .catch((error) => {
            logger.error(`Error formatting data for show`, error);
            const formattedOptions = [];
            fieldIncludeValues.forEach((v) => {
              if (notEmpty(v)) {
                formattedOptions.push({ value: v, label: v });
              }
            });
            resolve(formattedOptions);
          });
      }
    });
  }

  function formatDataForSave(params) {
    const data = Object.assign({}, params);

    multiSelectableKeys.value.forEach((field) => {
      const values = (data[field] || []);
      data[field] = values.map(v => v.value);
    });

    singleSelectableKeys.value.forEach((field) => {
      const values = (data[field] || []);
      data[field] = (values[0] || {}).value || '';
    });

    clientOptionsKeys.value.forEach((field) => {
      const value = data[field];
      if (isEmpty(value) || value.length === 0) {
        data[field] = '';
      }
    });

    objectKeys.value.forEach((field) => {
      if (notEmpty(data[field]) && data[field].length > 0) {
        data[field] = JSON.parse(data[field]);
      } else {
        data[field] = {};
      }
    });

    fileKeys.value.forEach((field) => {
      const value = data[field];
      if (isEmpty(value)) {
        data[field] = '';
      }
    });

    numberKeys.value.forEach((field) => {
      const value = data[field];
      if (notEmpty(value)) {
        data[field] = parseFloat(value);
      }
    });

    const formattedData = Object.entries(data).reduce((o, [key, val]) => {
      if (Object.is(val, undefined)) {
        o[key] = null;
      } else {
        o[key] = val;
      }
      return o;
    }, {});

    return formattedData;
  }

  function formatErrorsForDisplay(error) {
    return Object.entries(error).reduce((errors, [field, fieldErrors]) => {
      errors[field] = fieldErrors.map((errorName) => {
        return {
          name: errorName,
          params: {},
        };
      });
      return errors;
    }, {});
  }

  function formatFiltersForShow(filters = {}) {
    return Object.entries(filters).reduce((o, [field, value]) => {
      if (isEmpty(value)) {
        o[field] = value;
      } else if (clientOptionsField(field) && value.length > 0) {
        o[field] = value[0].value;
      } else if ((multiSelectableField(field) || singleSelectableField(field)) && value.length > 0) {
        o[field] = value.map(v => v.value);
      } else {
        o[field] = value;
      }

      return o;
    }, {});
  }

  function formatFiltersForLoad(filters = {}) {
    return Object.entries(filters).reduce((o, [field, value]) => {
      if (isEmpty(value)) { return o; }
      if ((clientOptionsField(field) || selectableField(field)) && value.length === 0) { return o; }

      if (singleSelectableField(field) && value.length > 0) {
        o[field] = value[0].value;
      } else if (multiSelectableField(field) && value.length > 0) {
        o[field] = value.map(v => v.value);
      } else if (inputType(field) === 'date') {
        if (notEmpty(value.startDate)) {
          o[field] = {};
          o[field].startDate = value.startDate;
        }
        if (notEmpty(value.endDate)) {
          if (isEmpty(o[field])) {
            o[field] = {};
          }
          o[field].endDate = value.endDate;
        }
      } else if (inputType(field) === 'datetime') {
        if (notEmpty(value.startTime)) {
          o[field] = {};
          o[field].startTime = value.startTime;
        }
        if (notEmpty(value.endTime)) {
          if (isEmpty(o[field])) {
            o[field] = {};
          }
          o[field].endTime = value.endTime;
        }
      } else {
        o[field] = value;
      }
      return o;
    }, {});
  }

  async function fetchOptions(field, offset) {
    const options = schemasMap.value[field].options;
    if (options.server) {
      const limit = options.limit || 5;
      return new Promise((resolve, reject) => {
        dataAccess
          .list(options.modelClass, { offset, limit })
          .then((result) => {
            const data = result.data;
            const total = result.total;
            const dataFromServer = {
              total,
              data: data.map((row) => {
                return {
                  value: options.value(row),
                  label: options.label(row),
                };
              }),
            };
            resolve(formatInputOptionsData(field, offset, limit, dataFromServer));
          })
          .catch((error) => {
            logger.error(`Error fetching options for field ${field}`, error);
            resolve({
              data: [],
              total: 0,
              loading: false,
              pagination: { offset: 0, limit: 5, client: false },
            });
          });
      });
    } else {
      return new Promise((resolve, reject) => {
        resolve(Object.assign(
          {},
          {
            data: options,
            total: options.length,
            loading: false,
            pagination: { offset: 0, limit: 5, client: true },
          }
        ));
      });
    }
  }

  async function initOptionsData() {
    return new Promise((resolve, reject) => {
      Promise.all(serverOptionsKeys.value.map((field) => {
        const offset = schemasMap.value[field].offset || 0;
        return fetchOptions(field, offset);
      }))
        .then((values) => {
          const data = {};
          values.forEach((value, i) => {
            const field = serverOptionsKeys.value[i];
            data[field] = value;
          });
          resolve(data);
        });
    });
  }

  return {
    schemasMap,
    listableFields,
    listableKeys,
    viewableFields,
    viewableKeys,
    creatableFields,
    creatableKeys,
    updatableFields,
    updatableKeys,
    sortableFields,
    sortableKeys,
    multipartData,
    clientOptionsKeys,
    clientOptionsField,
    serverOptionsKeys,
    serverOptionsField,
    selectableKeys,
    multiSelectableKeys,
    singleSelectableKeys,
    inputType,
    inputLabel,
    inputValue,
    inputableField,
    multiInputableField,
    multiSelectableField,
    singleSelectableField,
    selectableField,
    nullToggleableField,
    nullToggleableKeys,
    tagsField,
    tagsKeys,
    objectField,
    objectKeys,
    numberField,
    numberKeys,
    fileField,
    fileKeys,
    includeKeys,
    formatInputOptionsData,
    formatDataFields,
    formatDataForShow,
    formatDataForSave,
    formatErrorsForDisplay,
    formatFiltersForShow,
    formatFiltersForLoad,
    validateParams,
    fetchOptions,
    initOptionsData,
  };
}
