'use strict'

const shared = require('./shared');
const usersStore = require('../stores/users');

module.exports = {
  prefix: '/api/users',
  routes: [
    { method: 'get', path: '/download', handler: shared.download(usersStore) },
    { method: 'get', path: '/', handler: shared.list(usersStore) },
    { method: 'get', path: '/:id', handler: shared.view(usersStore) },
    { method: 'post', path: '/', handler: shared.create(usersStore) },
    { method: 'put', path: '/:id', handler: shared.update(usersStore) },
    { method: 'delete', path: '/:id', handler: shared.remove(usersStore) }
  ]
}
