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

function cacheData(modelClass, data) {
  dataCache[modelClass] = data;
  writeData(modelClass, data);
}

function viewSchemas(modelClass) {
  return schemaCache[modelClass];
}

function list(modelClass, filters = {}) {
  const data = Object.values(dataCache[modelClass] || {});
  const total = data.length;
  const include = filters.include || [];

  let filteredData = data;

  if (filters.offset && filters.limit && data.length > 0) {
    filteredData = Array.from(data).slice(filters.offset, filters.offset + filters.limit);
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
    const newRow = Object.assign(params, { id: newId });
    data[newId] = newRow;
    cacheData(modelClass, data);
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

function cacheIndexes(modelClass, record) {
  indexTypes.forEach((indexType) => {
    if (indexType === 'unique') {
      cacheUniqueIndexes(modelClass, record);
    }
  })
  writeData(indexes, indexCache);
}

function cacheUniqueIndexes(modelClass, record) {
  const uniqueIndexes = indexCache.unique;
  if (!uniqueIndexes[modelClass]) {
    uniqueIndexes[modelClass] = {};
  }

  const uniqueConstraints = schemaCache[modelClass].constraints.unique || [];
  const newIndexes = uniqueConstraints.reduce((o, key) => {
    const existingIndexes = uniqueIndexes[modelClass][key] || [];
    const keys = key.split('|');
    const values = keys.map(k => record[k]).join('|');
    existingIndexes.push(values);
    o[key] = existingIndexes;
    return o;
  }, {})

  uniqueIndexes[modelClass] = newIndexes;
}

// TODO: check exists
function createIfNotExists(modelClass, params) {
  return create(modelClass, params)
}

function update(modelClass, id, params) {
  let data = dataCache[modelClass];
  const existing = view(modelClass, id);
  if (!existing.record) { return null; }

  const updated = Object.assign(existing.record, params)
  data[id] = updated;
  cacheData(modelClass, data);

  return updated;
}

function remove(modelClass, id) {
  let data = dataCache[modelClass];
  const existing = view(modelClass, id);
  if (!existing.record) { return false; }

  delete data[id];
  cacheData(modelClass, data);

  return true;
}

// TODO
function isUsed(modelClass, id) {
  return false
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
