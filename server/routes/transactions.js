'use strict'

const shared = require('./shared');
const transactionsStore = require('../stores/transactions');

module.exports = {
  prefix: '/api/transactions',
  routes: [
    { method: 'get', path: '/download', handler: shared.download(transactionsStore) },
    { method: 'get', path: '/', handler: shared.list(transactionsStore) },
    { method: 'get', path: '/:id', handler: shared.view(transactionsStore) },
    { method: 'post', path: '/', handler: shared.create(transactionsStore) },
    { method: 'put', path: '/:id', handler: shared.update(transactionsStore) },
    { method: 'delete', path: '/:id', handler: shared.remove(transactionsStore) }
  ]
}
