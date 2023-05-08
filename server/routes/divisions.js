'use strict'

const shared = require('./shared');
const divisionsStore = require('../stores/divisions');

module.exports = {
  prefix: '/api/divisions',
  routes: [
    { method: 'get', path: '/download', handler: shared.download(divisionsStore) },
    { method: 'get', path: '/', handler: shared.list(divisionsStore) },
    { method: 'get', path: '/:id', handler: shared.view(divisionsStore) },
    { method: 'post', path: '/', handler: shared.create(divisionsStore) },
    { method: 'put', path: '/:id', handler: shared.update(divisionsStore) },
    { method: 'delete', path: '/:id', handler: shared.remove(divisionsStore) }
  ]
}
