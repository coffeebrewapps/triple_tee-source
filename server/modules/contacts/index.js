const name = 'contacts';

module.exports = ({ dataAccess, routes, logger, utils, uploader }) => {
  const stores = require('./stores')({ dataAccess });
  const router = require('./routes')({ routes, stores, uploader });

  return {
    name,
    stores,
    router,
  };
};
