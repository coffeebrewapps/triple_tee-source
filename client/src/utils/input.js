import { computed } from 'vue';

import { useDataAccess } from '@/utils/dataAccess';
import { useFormatter } from '@/utils/formatter';
import { useValidations } from '@/utils/validations';
import { useFileUtils } from '@/utils/file';
import { useLogger } from '@/utils/logger';

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

export function useInputHelper(schemas) {
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

  const clientOptionsFields = computed(() => {
    return Object.keys(schemasMap.value).filter(f => clientOptionsField(f));
  });

  const serverOptionsFields = computed(() => {
    return Object.keys(schemasMap.value).filter(f => serverOptionsField(f));
  });

  const selectableKeys = computed(() => {
    return Object.keys(schemasMap.value).filter(f => selectableField(f));
  });

  const multiSelectableFields = computed(() => {
    return Object.keys(schemasMap.value).filter(f => multiSelectableField(f));
  });

  const singleSelectableFields = computed(() => {
    return Object.keys(schemasMap.value).filter(f => singleSelectableField(f));
  });

  const nullToggleableFields = computed(() => {
    return Object.keys(schemasMap.value).filter(f => nullToggleableField(f));
  });

  const tagsFields = computed(() => {
    return Object.keys(schemasMap.value).filter(f => tagsField(f));
  });

  const objectFields = computed(() => {
    return Object.keys(schemasMap.value).filter(f => objectField(f));
  });

  const numberFields = computed(() => {
    return Object.keys(schemasMap.value).filter(f => numberField(f));
  });

  const fileFields = computed(() => {
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
        const foreignValue = includes[field][value];
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
      const foreignValue = (includes[field][fieldValue] || {});
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
        if (notEmpty(fieldValue)) {
          resolve(JSON.stringify(fieldValue, false, 4));
        } else {
          resolve(fieldValue);
        }
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
              reject(error);
            });
        } else {
          dataAccess
            .view(fileOptions.modelClass, fieldValue, {})
            .then((result) => {
              if (isEmpty(record.includes[field])) {
                record.includes[field] = {};
              }

              record.includes[field][fieldValue] = result;
              base64ToFile(result.rawData, result.filename, result.mimeType)
                .then((file) => {
                  resolve(file);
                })
                .catch((error) => {
                  reject(error);
                });
            })
            .catch((error) => {
              logger.error(`Error formatting data for show`, error);
              resolve(fieldValue);
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

    multiSelectableFields.value.forEach((field) => {
      const values = (data[field] || []);
      data[field] = values.map(v => v.value);
    });

    singleSelectableFields.value.forEach((field) => {
      const values = (data[field] || []);
      data[field] = (values[0] || {}).value;
    });

    clientOptionsFields.value.forEach((field) => {
      const value = data[field];
      if (isEmpty(value) || value.length === 0) {
        data[field] = null;
      }
    });

    objectFields.value.forEach((field) => {
      if (notEmpty(data[field]) && data[field].length > 0) {
        data[field] = JSON.parse(data[field]);
      }
    });

    numberFields.value.forEach((field) => {
      if (notEmpty(data[field])) {
        data[field] = parseFloat(data[field]);
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

  function formatFilters(filters = {}) {
    return Object.entries(filters).reduce((o, [field, value]) => {
      if (notEmpty(value) && value !== '') {
        if (singleSelectableField(field)) {
          o[field] = value[0].value;
        } else if (multiSelectableField(field)) {
          o[field] = value.map(v => v.value);
        } else {
          o[field] = value;
        }
      }
      return o;
    }, {});
  }

  async function fetchOptions(field, offset) {
    const options = schemasMap.value[field].options || {};
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
      Promise.all(serverOptionsFields.value.map((field) => {
        const offset = schemasMap.value[field].offset || 0;
        return fetchOptions(field, offset);
      }))
        .then((values) => {
          const data = {};
          values.forEach((value, i) => {
            const field = serverOptionsFields.value[i];
            data[field] = value;
          });
          resolve(data);
        })
        .catch((err) => {
          reject(err);
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
    numberField,
    numberFields,
    fileField,
    fileFields,
    includeKeys,
    formatInputOptionsData,
    formatDataFields,
    formatDataForShow,
    formatDataForSave,
    formatErrorsForDisplay,
    formatFilters,
    validateParams,
    fetchOptions,
    initOptionsData,
  };
}
