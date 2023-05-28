import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { useDataValidations } from '@/utils/dataValidations'

import schemasData from '@/../../data/_schemas.json'
import indexesData from '@/../../data/_indexes.json'

export const useDataStore = defineStore('data', () => {
  const indexes = '_indexes';
  const schemas = '_schemas';

  const validator = useDataValidations()
  const init = ref(false)
  const schemaCache = ref({});
  const dataCache = ref({});
  const indexCache = ref({});
  const indexTypes = ref([]);

  const customFunctions = ref({});

  function registerFunction(modelClass, fnType, fnName, fn) {
    if (!customFunctions.value[modelClass]) {
      customFunctions.value[modelClass] = {}
    }

    if (!customFunctions.value[modelClass][fnType]) {
      customFunctions.value[modelClass][fnType] = {}
    }

    customFunctions.value[modelClass][fnType][fnName] = fn
  }

  function customFunctionsForModel(modelClass, fnType) {
    return (customFunctions.value[modelClass] || {})[fnType]
  }

  function listCustomFunctions() {
    return customFunctions.value
  }

  function wrapArray(val) {
    if (Array.isArray(val)) {
      return val;
    } else {
      return [val];
    }
  }

  async function importJsonData(modelClass) {
    return new Promise((resolve, reject) => {
      resolve(import(`../../../data/${modelClass}.json`));
    })
  }

  async function initData(force = false) {
    if (!init.value || force) {
      console.log(`Init data start`);
      const existingSchemas = localStorage.getItem('_schemas');
      const existingIndexes = localStorage.getItem('_indexes');
      const existingModelData = localStorage.getItem('data');

      if (existingSchemas) {
        schemaCache.value = JSON.parse(existingSchemas);
      } else {
        schemaCache.value = schemasData;
        localStorage.setItem('_schemas', JSON.stringify(schemasData));
      }

      if (existingIndexes) {
        indexCache.value = JSON.parse(existingIndexes);
      } else {
        indexCache.value = indexesData;
        localStorage.setItem('_indexes', JSON.stringify(indexesData));
      }

      indexTypes.value = Object.keys(indexCache);
      console.log(`Init schema complete`);

      if (existingModelData) {
        dataCache.value = JSON.parse(existingModelData);
      } else {
        const promises = Object.keys(schemasData).map((modelClass) => {
          return importJsonData(modelClass);
        });

        Promise
          .all(promises)
          .then((results) => {
            Object.keys(schemasData).forEach((modelClass, i) => {
              dataCache.value[modelClass] = results[i].default
              console.log(`Init data complete`, { modelClass, modelData: dataCache.value[modelClass] });
            })

            localStorage.setItem('data', JSON.stringify(dataCache.value));
          })
      }

      init.value = true;
    }
  }

  function writeData(modelClass, data) {
    if (modelClass === '_indexes') {
      localStorage.setItem('_indexes', JSON.stringify(data));
    } else {
      const modelData = JSON.parse(localStorage.getItem('data'))
      modelData[modelClass] = data;
      localStorage.setItem('data', JSON.stringify(modelData));
    }
  }

  function cacheRecord(modelClass, record) {
    const cacheableData = dataCache.value[modelClass];
    cacheableData[record.id] = record;

    const writable = Object.assign(record);
    delete writable.includes;
    const writableData = Object.assign({}, dataCache.value[modelClass]);
    writableData[record.id] = writable;

    cacheData(modelClass, cacheableData, writableData);
  }

  function cacheData(modelClass, cacheable, writable) {
    dataCache.value[modelClass] = cacheable;
    writeData(modelClass, writable)
  }

  function listSchemas() {
    return Object.keys(schemaCache.value);
  }

  function viewSchemas(modelClass) {
    return schemaCache.value[modelClass];
  }

  function list(modelClass, filters = {}) {
    const modelData = dataCache.value[modelClass] || {};
    const data = Object.values(modelData);
    const paramsFilters = filters.filters || {};
    const sortFilters = filters.sort || {};

    let filteredData = [];

    if (Object.keys(paramsFilters).length > 0) {
      filteredData = filterData(modelClass, paramsFilters);
    } else {
      filteredData = data;
    }

    if (sortFilters.field) {
      sortData(filteredData, sortFilters)
    }

    const total = filteredData.length;
    const include = filters.include || [];

    filteredData = paginateData(filteredData, filters);

    filteredData = filteredData.map((record) => {
      const combined = Object.assign({}, record, { includes: fetchIncludes(modelClass, record, include) })
      return combined
    });

    return {
      total: total,
      data: filteredData
    };
  }

  function view(modelClass, id, params = {}) {
    const data = dataCache.value[modelClass] || {};
    const record = data[id] || {};
    const include = params.include || [];
    const foreignRecords = fetchIncludes(modelClass, record, include);

    return {
      record: Object.assign({}, record, { includes: foreignRecords })
    };
  }

  function defaultValuesForCreate(modelClass) {
    const fields = schemaCache.value[modelClass].fields;

    return Object.entries(fields).reduce((o, [field, schema]) => {
      if (validator.notEmpty(schema.default)) {
        o[field] = schema.default
      } else {
        o[field] = null
      }
      return o;
    }, {});
  }

  // TODO: check exists
  function create(modelClass, params) {
    const result = validator.validate(modelClass, params, schemaCache.value, indexCache.value, dataCache.value);

    if (result.valid) {
      let data = dataCache.value[modelClass];
      const lastId = parseInt(Array.from(Object.keys(data)).reverse()[0] || 0);
      const newId = (lastId + 1).toString();
      const now = new Date();
      const defaultValues = defaultValuesForCreate(modelClass);
      const newRow = Object.assign({}, defaultValues, params, { id: newId, createdAt: now, updatedAt: now });
      cacheRecord(modelClass, newRow);
      cacheIndexes(modelClass, newRow);

      return {
        success: true,
        record: newRow
      };
    } else {
      return {
        success: false,
        errors: result.errors
      };
    }
  }

  // TODO: check exists
  function createIfNotExists(modelClass, params) {
    return create(modelClass, params)
  }

  function update(modelClass, id, params) {
    let data = dataCache.value[modelClass];
    const existing = view(modelClass, id);
    if (!existing.record) {
      return {
        success: false,
        errors: ['not exists']
      };
    }

    const result = validator.validate(modelClass, params, schemaCache.value, indexCache.value, dataCache.value);

    if (result.valid) {
      const now = new Date();
      const updated = Object.assign({}, existing.record, params, { updatedAt: now })

      const indexesToRemove = Object.entries(existing.record).reduce((o, [field, value]) => {
        if (validator.isEmpty(value)) { return o; }

        const existingValues = wrapArray(value);
        const newValues = wrapArray(updated[field]);

        o[field] = existingValues.filter(ev => !newValues.includes(ev));
        return o;
      }, {});
      indexesToRemove.id = id;

      cacheRecord(modelClass, updated);
      cacheIndexes(modelClass, updated);
      removeIndexes(modelClass, indexesToRemove);

      return {
        success: true,
        record: updated
      };
    } else {
      return {
        success: false,
        errors: result.errors
      };
    }
  }

  function remove(modelClass, id) {
    let data = dataCache.value[modelClass];
    const existing = view(modelClass, id);
    const record = existing.record;
    if (!record) {
      return {
        success: false,
        errors: {}
      };
    }

    const used = validator.isUsed(modelClass, record, schemaCache.value, indexCache.value, dataCache.value);

    if (!used) {
      delete data[id];
      cacheData(modelClass, data, data);
      removeIndexes(modelClass, record)
      return {
        success: true,
        record: record
      };
    } else {
      return {
        success: false,
        errors: ['isUsed']
      };
    }
  }

  function isUsed(modelClass, id) {
    let data = dataCache.value[modelClass];
    const existing = view(modelClass, id);
    const record = existing.record;
    if (!record) { return false }

    return validator.isUsed(modelClass, record, schemaCache.value, indexCache.value, dataCache.value);
  }

  function download(modelClass) {
    const data = dataCache.value[modelClass];
    return { data };
  }

  function upload(modelClass, data) {
    dataCache.value[modelClass] = data;
    writeData(modelClass, data);
    return { data };
  }

  function downloadIndexes() {
    const data = indexCache.value;
    return { data };
  }

  function uploadIndexes(data) {
    indexCache.value = data;
    writeData(indexes, indexCache.value);
    return { data };
  }

  function paginateData(data, filters) {
    let filteredData = Array.from(data)
    if (validator.notEmpty(filters.offset) && validator.notEmpty(filters.limit) && filteredData.length > 0) {
      const offset = parseInt(filters.offset);
      const limit = parseInt(filters.limit);

      filteredData = filteredData.slice(offset, offset + limit);
    }
    return filteredData;
  }

  function filterData(modelClass, filters) {
    const modelData = dataCache.value[modelClass] || {};
    const filterIndexes = indexCache.value.filter[modelClass] || {};
    const filterSchemas = (schemaCache.value[modelClass].indexes || {}).filter || {};

    const filteredIds = [...filterFromIndexes(modelClass, modelData, filterIndexes, filterSchemas, filters)];
    return filteredIds.map(i => modelData[i]);
  }

  // {"field":"tags","indexedValue":"3","ids":["2"],"filterValue":["10"]}
  function filterValueMatch(filterSchemas, field, indexedValue, filterValue) {
    const filterOptions = filterSchemas[field] || {};

    const partialMatch = filterOptions.match && indexedValue.match(filterValue);
    const multiMatch = Array.isArray(filterValue) && filterValue.some(fv => fv === indexedValue);
    const exactMatch = !filterOptions.match && indexedValue === filterValue;
    const dateRangeMatch = (Object.hasOwn(filterValue, 'startDate') || Object.hasOwn(filterValue, 'endDate') || Object.hasOwn(filterValue, 'startTime') || Object.hasOwn(filterValue, 'endTime')) && rangeMatch(filterValue.startDate, filterValue.endDate, indexedValue);

    return partialMatch || multiMatch || exactMatch || dateRangeMatch;
  }

  function rangeMatch(rangeStart, rangeEnd, compareValue) {
    return (validator.isEmpty(rangeStart) || compareValue >= rangeStart) &&
      (validator.isEmpty(rangeEnd) || compareValue <= rangeEnd)
  }

  function filterFromIndexes(modelClass, modelData, indexes, filterSchemas, filters) {
    return Object.entries(filters).reduce((filteredIds, [field, filterValue]) => {
      if (validator.notEmpty(indexes[field])) {
        const filterOptions = filterSchemas[field] || {};
        const indexedIds = Object.entries(indexes[field]).reduce((arr, [indexedValue, ids]) => {
          if (filterValueMatch(filterSchemas, field, indexedValue, filterValue)) {
            arr = arr.concat(ids);
          }
          return arr;
        }, []);

        if (indexedIds.length > 0) {
          console.log(`Index hit`, { field, filterValue })
          indexedIds.forEach(i => filteredIds.add(i));
        } else {
          console.log(`Index miss`, { field, filterValue })
          const idsFromData = filterIdsFromData(modelClass, modelData, filterSchemas, field, filterValue);
          idsFromData.forEach(i => filteredIds.add(i));
        }
      } else {
        console.log(`Index miss`, { field, filterValue })
        const idsFromData = filterIdsFromData(modelClass, modelData, filterSchemas, field, filterValue);
        idsFromData.forEach(i => filteredIds.add(i));
      }
      return filteredIds;
    }, (new Set()));
  }

  function filterIdsFromData(modelClass, modelData, schemas, field, filterValue) {
    const filterOptions = schemas[field] || {};

    return Object.entries(modelData).reduce((arr, [id, record]) => {
      const recordValue = record[field];
      if (validator.notEmpty(recordValue) && filterValueMatch(schemas, field, recordValue, filterValue)) {
        arr.push(id);
      }
      return arr
    }, []);
  }

  function fetchIncludes(modelClass, record, include) {
    const schema = schemaCache.value[modelClass];
    const foreignConstraints = schema.constraints.foreign;

    return include.reduce((records, foreignKey) => {
      const foreignKeyType = schema.fields[foreignKey].type;
      const referenceValue = [record[foreignKey]].flat().filter(v => !!v);

      const constraint = foreignConstraints[foreignKey] || {};
      const foreignClass = constraint.reference;

      records[foreignKey] = referenceValue.reduce((references, value) => {
        if (validator.notEmpty(dataCache.value[foreignClass])) {
          references[value] = dataCache.value[foreignClass][value];
        } else {
          references[value] = null;
        }

        return references;
      }, {});

      return records;
    }, {});
  }

  function sortData(data, params) {
    const sortField = params.field;
    const sortOrder = params.order === 'asc' ? 1 : -1;
    data.sort((a, b) => {
      if (a[sortField] < b[sortField]) {
        return sortOrder * -1;
      } else if (a[sortField] > b[sortField]) {
        return sortOrder * 1;
      } else {
        return 0;
      }
    });
  }

  function cacheIndexes(modelClass, record) {
    indexTypes.value.forEach((indexType) => {
      if (indexType === 'unique') {
        cacheUniqueIndexes(modelClass, record);
      } else if (indexType === 'foreign') {
        cacheForeignIndexes(modelClass, record);
      } else if (indexType === 'filter') {
        cacheFilterIndexes(modelClass, record);
      }
    });
    writeData(indexes, indexCache.value);
  }

  // indexCache.unique = {"tags":{"category|name":{"activity|implementation":"1"}}}
  function cacheUniqueIndexes(modelClass, record) {
    const uniqueIndexes = indexCache.value.unique;
    if (!uniqueIndexes[modelClass]) {
      uniqueIndexes[modelClass] = {};
    }

    const uniqueConstraints = schemaCache.value[modelClass].constraints.unique || [];
    const newIndexes = uniqueConstraints.reduce((o, key) => {
      const existingIndexes = uniqueIndexes[modelClass][key] || {};
      const keys = key.split('|');
      const values = keys.map(k => record[k]).join('|');
      existingIndexes[values] = record.id;
      o[key] = existingIndexes;
      return o;
    }, {});

    uniqueIndexes[modelClass] = newIndexes;
  }

  // indexCache.foreign = {"tags":{"1":{"work_logs":["1"]}}}
  function cacheForeignIndexes(modelClass, record) {
    const foreignIndexes = indexCache.value.foreign;
    const foreignConstraints = schemaCache.value[modelClass].constraints.foreign || {};

    Object.keys(foreignConstraints).forEach((key) => {
      const foreignModelClass = foreignConstraints[key].reference;
      const existingIndexes = foreignIndexes[foreignModelClass] || {};
      let foreignValues = record[key];

      if (validator.isEmpty(foreignValues)) { return; }

      if (!Array.isArray(foreignValues)) {
        foreignValues = [foreignValues];
      }

      foreignValues.forEach((foreignValue) => {
        const foreignValueAssocs = existingIndexes[foreignValue] || {};

        if (!foreignValueAssocs[modelClass]) {
          foreignValueAssocs[modelClass] = [];
        }

        const existing = foreignValueAssocs[modelClass].indexOf(record.id);

        if (existing > -1) { return; }

        foreignValueAssocs[modelClass].push(record.id);
        existingIndexes[foreignValue] = foreignValueAssocs;
        indexCache.value.foreign[foreignModelClass] = existingIndexes;
      });
    });
  }

  // indexCache.filter = {"tags":{"category":{"activity":["1","2","3","4"]}}}
  function cacheFilterIndexes(modelClass, record) {
    const filterIndexes = indexCache.value.filter;
    if (!filterIndexes[modelClass]) {
      filterIndexes[modelClass] = {};
    }

    if (validator.isEmpty(schemaCache.value[modelClass].indexes)) { return; }

    const modelFilters = schemaCache.value[modelClass].indexes.filter || {};
    Object.entries(modelFilters).forEach(([field, options]) => {
      const fieldIndexes = filterIndexes[modelClass][field] || {};
      let fieldValues = record[field];

      if (validator.isEmpty(fieldValues)) { return; }

      if (!Array.isArray(fieldValues)) {
        fieldValues = [fieldValues];
      }

      fieldValues.forEach((fieldValue) => {
        const existingIds = fieldIndexes[fieldValue] || [];

        const found = existingIds.indexOf(record.id);

        if (found > -1) { return; }

        existingIds.push(record.id);
        fieldIndexes[fieldValue] = existingIds;
        filterIndexes[modelClass][field] = fieldIndexes;
      });
    });
  }

  function removeIndexes(modelClass, record) {
    indexTypes.value.forEach((indexType) => {
      if (indexType === 'unique') {
        removeUniqueIndexes(modelClass, record);
      } else if (indexType === 'foreign') {
        removeForeignIndexes(modelClass, record);
      } else if (indexType === 'filter') {
        removeFilterIndexes(modelClass, record);
      }
    });
    cleanupIndexes(modelClass, record);
    writeData(indexes, indexCache.value);
  }

  function removeUniqueIndexes(modelClass, record) {
    const uniqueIndexes = indexCache.value.unique;
    if (!uniqueIndexes[modelClass]) {
      return;
    }

    const uniqueConstraints = schemaCache.value[modelClass].constraints.unique || [];
    uniqueConstraints.forEach((key) => {
      const existingIndexes = uniqueIndexes[modelClass][key];
      if (existingIndexes) {
        const updatedIndexes = Object.keys(existingIndexes).reduce((o, index) => {
          const id = existingIndexes[index];
          if (id !== record.id) {
            o[index] = id;
          }
          return o;
        }, {});
        uniqueIndexes[modelClass][key] = updatedIndexes;
      }
    });
  }

  function removeForeignIndexes(modelClass, record) {
    const foreignIndexes = indexCache.value.foreign;
    const foreignConstraints = schemaCache.value[modelClass].constraints.foreign;

    if (validator.isEmpty(foreignConstraints)) { return; }

    Object.keys(foreignConstraints).forEach((key) => {
      const foreignModelClass = foreignConstraints[key].reference;
      const existingIndexes = foreignIndexes[foreignModelClass];

      if (validator.isEmpty(existingIndexes)) { return; }

      let foreignValues = record[key];

      if (validator.isEmpty(foreignValues)) { return; }

      if (!Array.isArray(foreignValues)) {
        foreignValues = [foreignValues]
      }

      foreignValues.forEach((foreignValue) => {
        const foreignValueAssocs = existingIndexes[foreignValue];
        const modelForeignAssocs = foreignValueAssocs[modelClass];

        if (validator.isEmpty(modelForeignAssocs)) { return; }

        const foundAssocIndex = modelForeignAssocs.indexOf(record.id);

        if (foundAssocIndex < 0) { return; }

        modelForeignAssocs.splice(foundAssocIndex, 1);
        foreignValueAssocs[modelClass] = modelForeignAssocs;
        existingIndexes[foreignValue] = foreignValueAssocs;
        indexCache.value.foreign[foreignModelClass] = existingIndexes;
      })
    });
  }

  // {"work_logs":{"tags":{"3":["2"],"4":["3"],"10":["1","2","3"]}}}
  function removeFilterIndexes(modelClass, record) {
    const filterIndexes = indexCache.value.filter;

    if (validator.isEmpty(filterIndexes[modelClass])) { return; }

    if (validator.isEmpty(schemaCache.value[modelClass].indexes)) { return; }

    const modelFilters = schemaCache.value[modelClass].indexes.filter || {};

    Object.keys(modelFilters).forEach((field) => {
      const fieldIndexes = filterIndexes[modelClass][field];

      if (validator.isEmpty(fieldIndexes)) { return; }

      let fieldValues = record[field];

      if (!Array.isArray(fieldValues)) {
        fieldValues = [fieldValues];
      }

      fieldValues.forEach((fieldValue) => {
        const existingIds = fieldIndexes[fieldValue];

        if (validator.isEmpty(existingIds)) { return; }

        const foundIndex = existingIds.indexOf(record.id);

        if (foundIndex < 0) { return; }

        existingIds.splice(foundIndex, 1);
        fieldIndexes[fieldValue] = existingIds;
        filterIndexes[modelClass][field] = fieldIndexes;
      });
    });
  }

  function cleanupIndexes(modelClass, record) {
    const foreignIndexes = indexCache.value.foreign;
    if (validator.isEmpty(foreignIndexes[modelClass])) { return; }

    delete foreignIndexes[modelClass][record.id];

    const filterIndexes = indexCache.value.filter;
    Object.entries(filterIndexes).forEach(([indexModel, indexedData]) => {
      if (indexModel === modelClass) { return; }

      Object.entries(indexedData).forEach(([key, modelClassData]) => {
        const foreignConstraints = schemaCache.value[indexModel].constraints.foreign[key];

        if (validator.isEmpty(foreignConstraints)) { return; }

        const reference = foreignConstraints.reference;

        if (reference !== modelClass) { return; }

        const foreignPrimaryKey = foreignConstraints.primary;
        delete modelClassData[record[foreignPrimaryKey]];
      });
    });
  }

  return {
    registerFunction,
    customFunctionsForModel,
    listCustomFunctions,
    initData,
    listSchemas,
    viewSchemas,
    list,
    view,
    create,
    createIfNotExists,
    update,
    remove,
    isUsed,
    download,
    upload,
    downloadIndexes,
    uploadIndexes
  }
})
