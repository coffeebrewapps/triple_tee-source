'use strict'

const name = 'users';
const store = require('../stores/users');
const router = require('../routes/users');

module.exports = {
  name,
  store,
  router
}
