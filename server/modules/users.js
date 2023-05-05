'use strict'

const name = 'users';
const store = require('../stores/users');
const router = require('../routes/users').router;

module.exports = {
  name,
  store,
  router
}
