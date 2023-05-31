const name = 'receipts';

module.exports = ({ dataAccess, routes, logger, utils }) => {
  const stores = require('./stores')({ dataAccess, logger, utils });
  const router = require('./routes')({ routes, stores, logger, utils });

  return {
    name,
    stores,
    router,
  };
};
