'use strict'

const logger = require('../logger');
const config = require('../config');
const fileAccess = require('./fileAccess');

const dataStore = config.dataStore;
const schemas = config.schemas;

let init = false;
let schemaCache = {};
let dataCache = {};

async function initData(force = false) {
  if (dataStore === 'fs') {
    logger.log(`Init data start`);
    if (!init || force) {
      fileAccess.initData(schemas)
        .then((result) => {
          schemaCache = result.schemas;
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

  if (filters.offset && filters.limit && data.length > 0) {
    return {
      total: total,
      data: Array.from(data).slice(filters.offset, filters.offset + filters.limit)
    };
  } else {
    return {
      total: total,
      data: data
    };
  }
}

function view(modelClass, id) {
  const data = dataCache[modelClass] || {};
  const record = data[id];
  return { record };
}

// TODO: check exists
function create(modelClass, params) {
  let data = dataCache[modelClass];
  const lastId = parseInt(Array.from(Object.keys(data)).reverse()[0] || 0);
  const newId = lastId + 1;
  const newRow = Object.assign({ id: newId }, params);
  data[newId] = newRow;
  cacheData(modelClass, data);
  return newRow;
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
