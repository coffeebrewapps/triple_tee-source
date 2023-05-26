'use strict'

const name = 'work_logs';

module.exports = (dataAccess, routes, logger, utils) => {
  const stores = require('./stores')(dataAccess, logger, utils);
  const router = require('./routes')(routes, stores, utils);

  return {
    name,
    stores,
    router
  }
}
