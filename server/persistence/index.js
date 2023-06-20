const fileAccess = require('./fileAccess');
const memAccess = require('./memAccess');

module.exports = ({ config, logger, utils }) => {
  if (config.dataStore === 'fs') {
    return fileAccess({ config, logger, utils });
  } else {
    return memAccess({ config, logger, utils });
  }
};
