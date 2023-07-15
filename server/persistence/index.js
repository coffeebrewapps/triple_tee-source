const fileAccess = require('./fileAccess');

module.exports = ({ config, logger, utils }) => {
  if (config.dataStore === 'fs') {
    return fileAccess({ config, logger, utils });
  } else {
    return {
      initData: () => {},
      write: () => {},
    };
  }
};
