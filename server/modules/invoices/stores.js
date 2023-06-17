const modelClass = 'invoices';

module.exports = ({ dataAccess, logger, utils }) => {
  return require('../../../lib/src/invoices/stores.js')({ dataAccess, utils, logger });
};
