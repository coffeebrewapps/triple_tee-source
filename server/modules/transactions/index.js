const name = 'transactions';

module.exports = ({ dataAccess, routes, utils, logger }) => {
  const stores = require('./stores')({ dataAccess, logger, utils });
  const router = require('./routes')({ routes, stores });

  return {
    name,
    stores,
    router,
  };
};
