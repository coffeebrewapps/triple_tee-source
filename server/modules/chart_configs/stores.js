const modelClass = 'chart_configs';

module.exports = ({ dataAccess, logger, utils }) => {
  return require('../../../lib/src/chart_configs/stores.js')({ dataAccess, utils, logger });
};
