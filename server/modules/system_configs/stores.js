const modelClass = 'system_configs';

module.exports = ({ dataAccess, logger, utils }) => {
  return require('../../../lib/src/system_configs/stores.js')({ dataAccess, utils, logger });
};
