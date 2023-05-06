'use strict'

const config = require('../config');
const fileAccess = require('./fileAccess');

const dataStore = config.dataStore;

let dataCache = {};

async function initData(modelClass, force = false) {
  if (dataStore === 'fs') {
    if (!dataCache[modelClass] || force) {
      await fileAccess.readFromFile(modelClass)
        .then((result) => {
          dataCache[modelClass] = JSON.parse(result);
        })
        .catch((error) => {
          console.log(`Error reading file ${modelClass}: ${JSON.stringify(error)}`);
          return [];
        });
    }
  } else {
    dataCache[modelClass] = [];
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
  let data = list(modelClass).data;
  const lastId = Array.from(data.map(d => d.id)).reverse()[0] || 0;
  const newRow = Object.assign({ id: lastId + 1 }, params);
  data.push(newRow);
  cacheData(modelClass, data);
  return newRow;
}

// TODO: check exists
function createIfNotExists(modelClass, params) {
  let data = list(modelClass).data;
  const lastId = Array.from(data.map(d => d.id)).reverse()[0] || 0;
  const newRow = Object.assign({ id: lastId + 1 }, params);
  data.push(newRow);
  cacheData(modelClass, data);
  return newRow;
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
  list,
  view,
  create,
  createIfNotExists,
  update,
  remove,
  isUsed
}
