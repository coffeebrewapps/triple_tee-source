const modelClass = 'tax_tables';

module.exports = ({ dataAccess, logger, utils }) => {
  return require('../../../lib/src/tax_tables/stores.js')({ dataAccess, utils, logger });
};
