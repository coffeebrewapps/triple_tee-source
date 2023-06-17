const modelClass = 'transactions';

module.exports = ({ dataAccess, utils, logger }) => {
  return require('../../../lib/src/transactions/stores.js')({ dataAccess, utils, logger });
};
