const name = 'transactions';

module.exports = ({ dataAccess, routes, logger }) => {
  const stores = require('./stores')({ dataAccess, logger });
  const router = require('./routes')({ routes, stores });

  return {
    name,
    stores,
    router,
  };
};
