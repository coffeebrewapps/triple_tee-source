'use strict'

const dataAccess = require('./dataAccess');

const modelClass = 'users';

function list(filters = {}) {
  return dataAccess.list(modelClass, filters);
}

function view(id) {
  const result = dataAccess.view(modelClass, id);
  return result.record;
}

function create(params) {
  return dataAccess.create(modelClass, params);
}

function edit(id, params) {
  return dataAccess.edit(modelClass, id, params);
}

function remove(id) {
  return dataAccess.remove(modelClass, id);
}

module.exports = {
  list,
  view,
  create,
  edit,
  remove
}
