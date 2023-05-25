'use strict'

const modelClass = 'work_logs';

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

  function previewInvoice(params) {
    try {
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
        {
          filters: { contactId: billingContact.id, includeTags: tags },
          include: ['includeTags']
        }
      ).data

      const workLogsForBilling = billingConfigs.reduce((o, config) => {
        const logs = list({
          filters: {
            tags: config.includeTags,
            startTime,
            endTime
          }
        }).data;
        o[config.id] = logs;
        return o;
      }, {});

      const workLogs = Object.values(workLogsForBilling).flat();

      return {
        success: true,
        record: {
          invoiceConfig,
          invoiceNumberSequence,
          billingContact,
          invoiceTemplate,
          billingConfigs,
          workLogs,
          workLogsForBilling
        }
      }
    } catch(error) {
      logger.error(`previewInvoice`, { error });
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
    previewInvoice
  }
}
