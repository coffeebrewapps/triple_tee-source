'use strict'

const name = 'divisions';
const store = require('../stores/divisions');
const router = require('../routes/divisions').router;

module.exports = {
  name,
  store,
  router
}
