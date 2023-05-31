const name = 'divisions';

module.exports = ({ dataAccess, routes }) => {
  const stores = require('./stores')({ dataAccess });
  const router = require('./routes')({ routes, stores });

  return {
    name,
    stores,
    router,
  };
};
