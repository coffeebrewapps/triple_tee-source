'use strict'

const name = 'tax_tables';

module.exports = (dataAccess, routes, logger, utils) => {
  const stores = require('./stores')(dataAccess, logger, utils);
  const router = require('./routes')(routes, stores, logger, utils);

  return {
    name,
    stores,
    router
  }
}
