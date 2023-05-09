'use strict'

const shared = require('./shared');
const tagsStore = require('../stores/tags');

module.exports = {
  prefix: '/api/tags',
  routes: [
    { method: 'get', path: '/download', handler: shared.download(tagsStore) },
    { method: 'get', path: '/', handler: shared.list(tagsStore) },
    { method: 'get', path: '/:id', handler: shared.view(tagsStore) },
    { method: 'post', path: '/', handler: shared.create(tagsStore) },
    { method: 'put', path: '/:id', handler: shared.update(tagsStore) },
    { method: 'delete', path: '/:id', handler: shared.remove(tagsStore) }
  ]
}
