const name = 'tax_tiers';

module.exports = ({ dataAccess, routes, logger, utils }) => {
  const stores = require('./stores')({ dataAccess, logger, utils });
  const router = require('./routes')({ routes, stores });

  return {
    name,
    stores,
    router,
  };
};
