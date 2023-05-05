'use strict'

function list(modelClass, filters) {
  return []
}

function view(modelClass, id) {
  return { id: id }
}

function create(modelClass, params) {
  return params
}

function createIfNotExists(modelClass, params) {
  return params
}

function edit(modelClass, id, params) {
  return params
}

function remove(modelClass, id) {
  return true
}

function isUsed(modelClass, id) {
  return false
}

module.exports = {
  list,
  view,
  create,
  createIfNotExists,
  edit,
  remove,
  isUsed
}
