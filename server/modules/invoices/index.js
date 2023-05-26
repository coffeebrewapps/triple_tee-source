'use strict'

const name = 'invoices';

module.exports = (dataAccess, routes, logger) => {
  const stores = require('./stores')(dataAccess, logger);
  const router = require('./routes')(routes, stores, logger);

  return {
    name,
    stores,
    router
  }
}
