'use strict'

const logger = require('../logger');
const config = require('../config');
const fileAccess = require('./fileAccess');
const validator = require('./validator');

const dataStore = config.dataStore;
const schemas = config.schemas;
const indexes = config.indexes;

let init = false;
let schemaCache = {};
let dataCache = {};
let indexCache = {};
let indexTypes = [];

async function initData(force = false) {
  if (dataStore === 'fs') {
    logger.log(`Init data start`);
    if (!init || force) {
      fileAccess.initData(schemas, indexes)
        .then((result) => {
          schemaCache = result.schemas;
          indexCache = result.indexes;
          indexTypes = Object.keys(indexCache);
          logger.log(`Init schema from file complete`);
          result.data.forEach((dataResult) => {
            dataCache[dataResult.modelClass] = dataResult.data;
            logger.log(`Init data from file complete`, { modelClass: dataResult.modelClass });
          });
          init = true;
          logger.log(`Init data complete`);
        })
        .catch((error) => {
          logger.error(`Error initializing data`, { error });
        });
    }
  } else {
    schemaCache = {};
    indexCache = {};
    dataCache = {};
    init = true;
    logger.log(`Init data complete`);
  }
}

function writeData(modelClass, data) {
  if (dataStore === 'fs') {
    fileAccess.writeToFile(modelClass, data);
  }
}

function cacheRecord(modelClass, record) {
  const cacheableData = dataCache[modelClass];
  cacheableData[record.id] = record;

  const writable = Object.assign(record);
  delete writable.includes;
  const writableData = Object.assign({}, dataCache[modelClass]);
  writableData[record.id] = writable;

  cacheData(modelClass, cacheableData, writableData);
}

function cacheData(modelClass, cacheable, writable) {
  dataCache[modelClass] = cacheable;
  writeData(modelClass, writable)
}

function viewSchemas(modelClass) {
  return schemaCache[modelClass];
}

function list(modelClass, filters = {}) {
  const modelData = dataCache[modelClass] || {};
  const data = Object.values(modelData);
  const paramsFilters = filters.filters || {};

  let filteredData = [];

  if (Object.keys(paramsFilters).length > 0) {
    filteredData = filterData(modelClass, paramsFilters);
  } else {
    filteredData = data;
  }

  const total = data.length;
  const include = filters.include || [];

  if (filters.offset && filters.limit && filteredData.length > 0) {
    filteredData = Array.from(filteredData).slice(filters.offset, filters.offset + filters.limit);
  }

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
  const data = dataCache[modelClass] || {};
  const record = data[id] || {};
  const include = params.include || [];
  const foreignRecords = fetchIncludes(modelClass, record, include);

  return {
    record: Object.assign({}, record, { includes: foreignRecords })
  };
}

// TODO: check exists
function create(modelClass, params) {
  const result = validator.validate(modelClass, params, schemaCache, indexCache, dataCache);

  if (result.valid) {
    let data = dataCache[modelClass];
    const lastId = parseInt(Array.from(Object.keys(data)).reverse()[0] || 0);
    const newId = (lastId + 1).toString();
    const now = new Date();
    const newRow = Object.assign(params, { id: newId, createdAt: now, updatedAt: now });
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
  let data = dataCache[modelClass];
  const existing = view(modelClass, id);
  if (!existing.record) {
    return {
      success: false,
      errors: ['not exists']
    };
  }

  const result = validator.validate(modelClass, params, schemaCache, indexCache, dataCache);

  if (result.valid) {
    const now = new Date();
    const updated = Object.assign(existing.record, params, { updatedAt: now })
    cacheRecord(modelClass, updated);
    cacheIndexes(modelClass, updated);

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
  let data = dataCache[modelClass];
  const existing = view(modelClass, id);
  const record = existing.record;
  if (!record) {
    return {
      success: false,
      errors: {}
    };
  }

  const used = validator.isUsed(modelClass, record, schemaCache, indexCache, dataCache);

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
  let data = dataCache[modelClass];
  const existing = view(modelClass, id);
  const record = existing.record;
  if (!record) { return false }

  return validator.isUsed(modelClass, record, schemaCache, indexCache, dataCache);
}

function filterData(modelClass, filters) {
  const modelData = dataCache[modelClass] || {};
  const filterIndexes = indexCache.filter[modelClass] || {};
  const filterSchemas = schemaCache[modelClass].indexes.filter || {};

  const filteredIds = [...filterFromIndexes(modelClass, modelData, indexes, schemas, filters)];
  return filteredIds.map(i => modelData[i]);
}

function filterFromIndexes(modelClass, modelData, indexes, schemas, filters) {
  return Object.entries(filters).reduce((filteredIds, [field, value]) => {
    if (indexes[field]) {
      const filterOptions = schemas[field] || {};
      const indexedIds = Object.entries(indexes[field]).reduce((arr, [indexedValue, ids]) => {
        if (filterOptions.match) {
          if (indexedValue.match(value)) {
            arr = arr.concat(ids);
          }
        } else {
          if (indexedValue === value) {
            arr = arr.concat(ids);
          }
        }
        return arr;
      }, []);

      if (indexedIds.length > 0) {
        logger.log(`Index hit`, { field, value })
        indexedIds.forEach(i => filteredIds.add(i));
      } else {
        logger.log(`Index miss`, { field, value })
        const idsFromData = filterIdsFromData(modelClass, modelData, schemas, field, value);
        idsFromData.forEach(i => filteredIds.add(i));
      }
    } else {
      logger.log(`Index miss`, { field, value })
      const idsFromData = filterIdsFromData(modelClass, modelData, schemas, field, value);
      idsFromData.forEach(i => filteredIds.add(i));
    }
    return filteredIds;
  }, (new Set()));
}

function filterIdsFromData(modelClass, modelData, schemas, field, value) {
  const filterOptions = schemas[field] || {};
  return Object.entries(modelData).reduce((arr, [id, record]) => {
    if (record[field]) {
      if (filterOptions.match && record[field].match(value)) {
        arr.push(id);
      } else if (!filterOptions.match && record[field] === value) {
        arr.push(id);
      }
    }
    return arr
  }, []);
}

function fetchIncludes(modelClass, record, include) {
  const schema = schemaCache[modelClass];
  const foreignConstraints = schema.constraints.foreign;

  return include.reduce((records, foreignKey) => {
    const foreignKeyType = schema.fields[foreignKey].type;
    const referenceValue = [record[foreignKey]].flat().filter(v => !!v);

    const constraint = foreignConstraints[foreignKey] || {};
    const foreignClass = constraint.reference;

    records[foreignKey] = referenceValue.reduce((references, value) => {
      if (dataCache[foreignClass]) {
        references[value] = dataCache[foreignClass][value];
      } else {
        references[value] = null;
      }

      return references;
    }, {});

    return records;
  }, {});
}

function cacheIndexes(modelClass, record) {
  indexTypes.forEach((indexType) => {
    if (indexType === 'unique') {
      cacheUniqueIndexes(modelClass, record);
    } else if (indexType === 'foreign') {
      cacheForeignIndexes(modelClass, record);
    } else if (indexType === 'filter') {
      cacheFilterIndexes(modelClass, record);
    }
  });
  writeData(indexes, indexCache);
}

function cacheUniqueIndexes(modelClass, record) {
  const uniqueIndexes = indexCache.unique;
  if (!uniqueIndexes[modelClass]) {
    uniqueIndexes[modelClass] = {};
  }

  const uniqueConstraints = schemaCache[modelClass].constraints.unique || [];
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

function cacheForeignIndexes(modelClass, record) {
  const foreignIndexes = indexCache.foreign;
  const foreignConstraints = schemaCache[modelClass].constraints.foreign || {};

  Object.keys(foreignConstraints).forEach((key) => {
    const foreignModelClass = foreignConstraints[key].reference;
    const existingIndexes = foreignIndexes[foreignModelClass] || {};
    const foreignValue = record[key];

    if (foreignValue) {
      const foreignValueAssocs = existingIndexes[foreignValue] || {};

      if (!foreignValueAssocs[modelClass]) {
        foreignValueAssocs[modelClass] = [];
      }

      foreignValueAssocs[modelClass].push(record.id);
      existingIndexes[foreignValue] = foreignValueAssocs;
      indexCache.foreign[foreignModelClass] = existingIndexes;
    }
  });
}

function cacheFilterIndexes(modelClass, record) {
  const filterIndexes = indexCache.filter;
  if (!filterIndexes[modelClass]) {
    filterIndexes[modelClass] = {};
  }

  const modelFilters = schemaCache[modelClass].indexes.filter || {};
  Object.entries(modelFilters).forEach(([field, options]) => {
    const fieldIndexes = filterIndexes[modelClass][field] || {};
    const fieldValue = record[field];
    if (fieldValue) {
      const existingIds = fieldIndexes[fieldValue] || [];
      existingIds.push(record.id);
      fieldIndexes[fieldValue] = existingIds;
      filterIndexes[modelClass][field] = fieldIndexes;
    }
  });
}

function removeIndexes(modelClass, record) {
  indexTypes.forEach((indexType) => {
    if (indexType === 'unique') {
      removeUniqueIndexes(modelClass, record);
    }
  });
  writeData(indexes, indexCache);
}

function removeUniqueIndexes(modelClass, record) {
  const uniqueIndexes = indexCache.unique;
  if (!uniqueIndexes[modelClass]) {
    return;
  }

  const uniqueConstraints = schemaCache[modelClass].constraints.unique || [];
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

module.exports = {
  initData,
  viewSchemas,
  list,
  view,
  create,
  createIfNotExists,
  update,
  remove,
  isUsed
}
