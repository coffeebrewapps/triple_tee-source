const name = 'contacts';

module.exports = ({ dataAccess, routes, logger, utils }) => {
  const stores = require('./stores')({ dataAccess, utils });
  const router = require('./routes')({ routes, stores, logger });

  return {
    name,
    stores,
    router,
  };
};
