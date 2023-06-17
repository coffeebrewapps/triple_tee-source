const modelClass = 'income_receipts';

module.exports = ({ dataAccess, logger, utils }) => {
  return require('../../../lib/src/income_receipts/stores.js')({ dataAccess, utils, logger });
};
