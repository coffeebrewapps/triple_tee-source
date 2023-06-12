const name = 'transactions';

module.exports = ({ dataAccess, routes, utils, logger }) => {
  const stores = require('./stores')({ dataAccess, utils, logger });
  const router = require('./routes')({ routes, stores });

  return {
    name,
    stores,
    router,
  };
};
