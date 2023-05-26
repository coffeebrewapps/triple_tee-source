'use strict'

const modelClass = 'invoices';

module.exports = (dataAccess, logger) => {
  function list(filters = {}) {
    return dataAccess.list(modelClass, filters);
  }

  function view(id, params) {
    return dataAccess.view(modelClass, id, params);
  }

  function create(params) {
    return dataAccess.create(modelClass, params);
  }

  function update(id, params) {
    return dataAccess.update(modelClass, id, params);
  }

  function remove(id) {
    return dataAccess.remove(modelClass, id);
  }

  function createWithLines(params) {
    try {
      const invoice = params.invoice;
      const invoiceLines = params.invoiceLines;

      dataAccess.update(sequenceId, { lastUsedNumber: invoice.invoiceNumber });

      const createdInvoice = create(invoice).record;
      const createdLines = invoiceLines.map((line) => {
        const result = dataAccess.create(
          'invoice_lines',
          Object.assign({}, line, { invoiceId: createdInvoice.id })
        );
        return result.record;
      });

      return {
        success: true,
        record: Object.assign(
          {},
          createdInvoice,
          { invoiceLines: createdLines }
        )
      };
    } catch(error) {
      return {
        success: false,
        errors: error
      }
    }
  }

  return {
    modelClass,
    list,
    view,
    create,
    update,
    remove,
    createWithLines
  }
}
