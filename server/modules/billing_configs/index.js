'use strict'

const name = 'billing_configs';

module.exports = (dataAccess, routes) => {
  const stores = require('./stores')(dataAccess);
  const router = require('./routes')(routes, stores);

  return {
    name,
    stores,
    router
  }
}