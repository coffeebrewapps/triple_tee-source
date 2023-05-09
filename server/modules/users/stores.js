'use strict'

const dataAccess = require('../../stores/dataAccess');

const modelClass = 'users';

function list(filters = {}) {
  return dataAccess.list(modelClass, filters);
}

function view(id) {
  return dataAccess.view(modelClass, id);
}

function create(params) {
  return dataAccess.create(modelClass, params);
}

function update(id, params) {
  return dataAccess.update(modelClass, id, params);
}

function remove(id) {
  return dataAccess.remove(modelClass, id);
}

module.exports = {
  modelClass,
  list,
  view,
  create,
  update,
  remove
}
