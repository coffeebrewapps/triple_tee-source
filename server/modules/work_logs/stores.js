'use strict'

const modelClass = 'work_logs';

module.exports = (dataAccess, logger, utils) => {
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

  function prefillInvoice({ invoiceConfig, invoiceNumberSequence, billingContact, currency, invoiceLines }) {
    const currentSequence = invoiceNumberSequence.lastUsedNumber + invoiceNumberSequence.incrementStep;

    const lastInvoice = dataAccess.list('invoices', { sort: { field: 'createdAt', order: 'desc' }, limit: 1 }).data[0];

    let invoiceDate = new Date();
    if (utils.notEmpty(lastInvoice)) {
      invoiceDate = new Date(lastInvoice.invoiceDate)
      const invoiceDurationValue = invoiceConfig.invoiceCycleDurationValue
      const invoiceDurationUnit = invoiceConfig.invoiceCycleDurationUnit

      if (invoiceDurationUnit === 'month') {
        invoiceDate.setMonth(invoiceDate.getMonth() + invoiceDurationValue)
      } else if (invoiceDurationUnit === 'week') {
        for (const i=0; i<invoiceDurationValue; i++) {
          invoiceDate.setDate(invoiceDate.getDate() + 7)
        }
      } else { // unit = 'day'
        invoiceDate.setDate(invoiceDate.getDate() + invoiceDurationValue)
      }
    }

    let dueDate = new Date(invoiceDate)
    const dueDurationValue = invoiceConfig.dueDateCycleValue
    const dueDurationUnit = invoiceConfig.dueDurationUnit

    if (dueDurationUnit === 'month') {
      dueDate.setMonth(dueDate.getMonth() + dueDurationValue)
    } else if (dueDurationUnit === 'week') {
      for (const i=0; i<dueDurationValue; i++) {
        dueDate.setDate(dueDate.getDate() + 7)
      }
    } else { // unit = 'day'
      dueDate.setDate(dueDate.getDate() + dueDurationValue)
    }

    const totalAmount = invoiceLines.reduce((sum, line) => {
      return sum + line.subtotal;
    }, 0);

    const invoiceIncludes = {}
    invoiceIncludes.currencyId = {}
    invoiceIncludes.currencyId[currency.id] = currency
    invoiceIncludes.contactId = {}
    invoiceIncludes.contactId[billingContact.id] = billingContact
    invoiceIncludes.invoiceConfigId = {}
    invoiceIncludes.invoiceConfigId[invoiceConfig.id] = invoiceConfig

    return {
      invoiceNumber: currentSequence,
      invoiceDate,
      dueDate,
      totalAmount,
      currencyId: currency.id,
      invoiceConfigId: invoiceConfig.id,
      contactId: billingContact.id,
      includes: invoiceIncludes
    }
  }

  function calculateDuration(startTime, endTime) {
    if (startTime && endTime) {
      return (new Date(endTime)) - (new Date(startTime));
    } else {
      return 0;
    }
  }

  function prefillInvoiceLine(config, logs) {
    const description = config.description;
    const unit = config.unit;
    const unitCost = config.unitCost;
    let unitValue = 0;

    if (config.rateType === 'duration') {
      const totalDuration = logs.reduce((duration, log) => {
        return duration + calculateDuration(log.startTime, log.endTime)
      }, 0);

      if (config.unit === 'hour') {
        unitValue = totalDuration / 1000 / 60 / 60;
      } else { // unit = 'minute'
        unitValue = totalDuration / 1000 / 60;
      }
    } else if (config.rateType === 'count') {
      unitValue = logs.length;
    } else { // rateType = 'fixed'
      unitValue = 1;
    }

    const subtotal = unitValue * unitCost;

    return {
      description,
      unit,
      unitCost,
      unitValue,
      subtotal
    }
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
        { include: ['invoiceNumberSequenceId', 'billingContactId', 'invoiceTemplateId', 'currencyId'] }
      ).record;

      const invoiceNumberSequence = invoiceConfig.includes.invoiceNumberSequenceId[invoiceConfig.invoiceNumberSequenceId]
      const billingContact = invoiceConfig.includes.billingContactId[invoiceConfig.billingContactId]
      const invoiceTemplate = invoiceConfig.includes.invoiceTemplateId[invoiceConfig.invoiceTemplateId]
      const currency = invoiceConfig.includes.currencyId[invoiceConfig.currencyId]

      const billingConfigs = dataAccess.list(
        'billing_configs',
        {
          filters: { contactId: billingContact.id, includeTags: tags },
          include: ['includeTags']
        }
      ).data

      const workLogs = list({
        filters: {
          tags: tags,
          startTime,
          endTime
        }
      }).data;

      const invoiceLines = billingConfigs.map((config) => {
        const logs = workLogs.filter((log) => {
          return config.includeTags.some(tag => log.tags.includes(tag))
        })
        return prefillInvoiceLine(config, logs);
      });

      const invoice = prefillInvoice({ invoiceConfig, invoiceNumberSequence, billingContact, currency, invoiceLines })

      return {
        success: true,
        record: {
          invoice,
          invoiceLines,
          invoiceConfig,
          invoiceNumberSequence,
          billingContact,
          invoiceTemplate,
          currency
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
