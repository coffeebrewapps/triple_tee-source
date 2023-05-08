'use strict'

const name = 'transactions';
const store = require('../stores/transactions');
const router = require('../routes/transactions');

module.exports = {
  name,
  store,
  router
}
