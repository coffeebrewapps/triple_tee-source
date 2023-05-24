'use strict'

const modelClass = 'work_logs';

module.exports = (dataAccess) => {
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

  function previewInvoice(params) {
    const invoiceConfigId = params.invoiceConfigId
    const tags = params.tags
    const startTime = params.startTime
    const endTime = params.endTime

    const invoiceConfig = dataAccess.view(
      'invoice_configs',
      invoiceConfigId,
      { include: ['invoiceNumberSequenceId', 'billingContactId', 'invoiceTemplateId'] }
    ).record;

    const invoiceNumberSequence = invoiceConfig.includes.invoiceNumberSequenceId[invoiceConfig.invoiceNumberSequenceId]
    const billingContact = invoiceConfig.includes.billingContactId[invoiceConfig.billingContactId]
    const invoiceTemplate = invoiceConfig.includes.invoiceTemplateId[invoiceConfig.invoiceTemplateId]

    const billingConfigs = dataAccess.list(
      'billing_configs',
      { filters: { contactId: billingContact.id, includeTags: tags } }
    ).data

    const workLogs = list({
      filters: {
        tags,
        startTime,
        endTime
      }
    }).data

    return {
      success: true,
      record: {
        invoiceConfig,
        invoiceNumberSequence,
        billingContact,
        invoiceTemplate,
        billingConfigs,
        workLogs
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
    previewInvoice
  }
}
