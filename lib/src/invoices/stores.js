const modelClass = 'invoices';

module.exports = ({ dataAccess, logger, utils }) => {
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

  function prefillInvoice({ invoiceConfig, invoiceNumberSequence, billingContact, currency, country, invoiceLines }) {
    const currentSequence = invoiceNumberSequence.lastUsedNumber + invoiceNumberSequence.incrementStep;

    const lastInvoice = dataAccess.list(
      'invoices',
      { sort: { field: 'createdAt', order: 'desc' }, offset: 0, limit: 1 }
    ).data[0];

    let invoiceDate = new Date();
    if (utils.notEmpty(lastInvoice) && Object.keys(lastInvoice).length > 0) {
      invoiceDate = new Date(lastInvoice.invoiceDate);
      const invoiceDurationValue = invoiceConfig.invoiceCycleDurationValue;
      const invoiceDurationUnit = invoiceConfig.invoiceCycleDurationUnit;

      if (invoiceDurationUnit === 'month') {
        invoiceDate.setMonth(invoiceDate.getMonth() + invoiceDurationValue);
      } else if (invoiceDurationUnit === 'week') {
        for (let i = 0; i < invoiceDurationValue; i++) {
          invoiceDate.setDate(invoiceDate.getDate() + 7);
        }
      } else { // unit = 'day'
        invoiceDate.setDate(invoiceDate.getDate() + invoiceDurationValue);
      }
    }

    const dueDate = new Date(invoiceDate);
    const dueDurationValue = invoiceConfig.dueDateCycleValue;
    const dueDurationUnit = invoiceConfig.dueDurationUnit;

    if (dueDurationUnit === 'month') {
      dueDate.setMonth(dueDate.getMonth() + dueDurationValue);
    } else if (dueDurationUnit === 'week') {
      for (let i = 0; i < dueDurationValue; i++) {
        dueDate.setDate(dueDate.getDate() + 7);
      }
    } else { // unit = 'day'
      dueDate.setDate(dueDate.getDate() + dueDurationValue);
    }

    const totalAmount = invoiceLines.reduce((sum, line) => {
      return sum + line.subtotal;
    }, 0);

    const invoiceIncludes = {};
    invoiceIncludes.currencyId = {};
    invoiceIncludes.currencyId[currency.id] = currency;
    invoiceIncludes.contactId = {};
    invoiceIncludes.contactId[billingContact.id] = billingContact;
    invoiceIncludes.invoiceConfigId = {};
    invoiceIncludes.invoiceConfigId[invoiceConfig.id] = invoiceConfig;

    return {
      invoiceNumber: currentSequence,
      invoiceDate,
      dueDate,
      totalAmount,
      currencyId: currency.id,
      invoiceConfigId: invoiceConfig.id,
      contactId: billingContact.id,
      includes: invoiceIncludes,
    };
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
        return duration + calculateDuration(log.startTime, log.endTime);
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

    unitValue = parseFloat(unitValue.toFixed(2));
    const subtotal = parseFloat((unitValue * unitCost).toFixed(2));

    return {
      description,
      unit,
      unitCost,
      unitValue,
      subtotal,
    };
  }

  function viewInvoiceConfigWithIncludes(invoiceConfigId) {
    const invoiceConfig = dataAccess.view(
      'invoice_configs',
      invoiceConfigId,
      { include: ['invoiceNumberSequenceId', 'invoiceTemplateId', 'currencyId'] }
    ).record;

    const invoiceNumberSequence = invoiceConfig.includes.invoiceNumberSequenceId[invoiceConfig.invoiceNumberSequenceId];
    const invoiceTemplate = invoiceConfig.includes.invoiceTemplateId[invoiceConfig.invoiceTemplateId];
    const currency = invoiceConfig.includes.currencyId[invoiceConfig.currencyId];

    const billingContact = dataAccess.view(
      'contacts',
      invoiceConfig.billingContactId,
      { include: ['country', 'logo'] }
    ).record;

    const country = billingContact.includes.country[billingContact.country] || {};
    const logo = billingContact.includes.logo[billingContact.logo] || {};

    return {
      invoiceConfig,
      invoiceNumberSequence,
      billingContact,
      invoiceTemplate,
      currency,
      country,
      logo,
    };
  }

  function previewInvoice(params) {
    try {
      const invoiceConfigId = params.invoiceConfigId;
      const tags = params.tags;
      const startTime = params.startTime;

      const {
        invoiceConfig,
        invoiceNumberSequence,
        billingContact,
        invoiceTemplate,
        currency,
        country,
        logo,
      } = viewInvoiceConfigWithIncludes(invoiceConfigId);

      const billingConfigs = dataAccess.list(
        'billing_configs',
        {
          filters: { contactId: billingContact.id, includeTags: tags },
          include: ['includeTags'],
        }
      ).data;

      const workLogs = dataAccess.list(
        'work_logs',
        {
          filters: {
            tags,
            startTime,
          },
        }
      ).data;

      const invoiceLines = billingConfigs.map((config) => {
        const logs = workLogs.filter((log) => {
          return config.includeTags.some(tag => log.tags.includes(tag));
        });
        return prefillInvoiceLine(config, logs);
      });

      const invoice = prefillInvoice({ invoiceConfig, invoiceNumberSequence, billingContact, currency, invoiceLines });

      return {
        success: true,
        record: {
          invoice,
          invoiceLines,
          invoiceConfig,
          invoiceNumberSequence,
          billingContact,
          invoiceTemplate,
          currency,
          country,
          logo,
        },
      };
    } catch (error) {
      logger.error(`previewInvoice`, { error });
      return {
        success: false,
        errors: {
          root: ['unknown'],
        },
      };
    }
  }

  function createWithLines(params) {
    try {
      const invoiceNumberSequenceId = params.invoiceNumberSequence.id;
      const invoice = params.invoice;
      const invoiceLines = params.invoiceLines;

      const { success, results } = dataAccess.atomic(
        [
          {
            id: 'updateNumberSequence',
            params: {
              invoiceNumberSequenceId,
            },
            invoke: ({ invoiceNumberSequenceId }, pastResults) => {
              const invoiceNumberSequenceResult = dataAccess.view('sequences', invoiceNumberSequenceId, {});
              if (!invoiceNumberSequenceResult.success) {
                return invoiceNumberSequenceResult;
              }

              const invoiceNumberSequence = invoiceNumberSequenceResult.record;
              const lastUsedNumber = invoiceNumberSequence.lastUsedNumber + invoiceNumberSequence.incrementStep;

              return dataAccess.update(
                'sequences',
                invoiceNumberSequence.id,
                { lastUsedNumber },
              );
            },
            rollback: (result) => {
              const updatedSequenceNumberId = result.record.id;
              const updatedLastUsedNumber = result.record.lastUsedNumber;
              const incrementStep = result.record.incrementStep;

              dataAccess.update(
                'sequences',
                updatedSequenceNumberId,
                { lastUsedNumber: updatedLastUsedNumber - incrementStep }
              );
            },
          },
          {
            id: 'createInvoice',
            params: invoice,
            invoke: (params, pastResults) => {
              const lastUsedNumber = pastResults[0].result.record.lastUsedNumber;

              const result = dataAccess.create(
                'invoices',
                Object.assign({}, params, { invoiceNumber: lastUsedNumber.toString() })
              );
              return result;
            },
            rollback: (result) => {
              const invoiceId = result.record.id;
              dataAccess.remove('invoices', invoiceId);
            },
          },
          {
            id: 'createInvoiceLines',
            params: invoiceLines,
            invoke: (params, pastResults) => {
              const createdInvoice = pastResults[0].result.record;
              const lines = [];

              for (let i = 0; i < params.length; i++) {
                const result = dataAccess.create(
                  'invoice_lines',
                  Object.assign({}, params[i], { invoiceId: createdInvoice.id })
                );

                if (result.success) {
                  lines.push(result.record);
                } else {
                  lines.forEach((line) => {
                    dataAccess.remove('invoice_lines', line.id);
                  });
                  return result;
                }
              }

              return {
                success: true,
                record: lines,
              };
            },
            rollback: (result) => {
              if (utils.notEmpty(result.record)) {
                result.record.forEach((line) => {
                  dataAccess.remove('invoice_lines', line.id);
                });
              }
            },
          },
        ]
      );

      if (success) {
        const createdLines = results[0].result.record;
        const createdInvoice = results[1].result.record;
        return {
          success: true,
          record: Object.assign(
            {},
            createdInvoice,
            { invoiceLines: createdLines }
          ),
        };
      } else {
        return results[0].result;
      }
    } catch (error) {
      logger.error(`createWithLines`, { error });
      return {
        success: false,
        errors: {
          root: ['unknown'],
        },
      };
    }
  }

  function viewTemplateData(id) {
    try {
      const invoiceId = id;
      const invoiceResult = dataAccess.view('invoices', invoiceId, {});

      if (!invoiceResult.success) {
        return invoiceResult;
      }

      const invoice = invoiceResult.record;
      const invoiceConfigId = invoice.invoiceConfigId;

      const {
        invoiceConfig,
        invoiceNumberSequence,
        billingContact,
        invoiceTemplate,
        currency,
        country,
        logo,
      } = viewInvoiceConfigWithIncludes(invoiceConfigId);

      const invoiceLines = dataAccess.list(
        'invoice_lines',
        { filters: { invoiceId } }
      ).data;

      return {
        success: true,
        record: {
          invoice,
          invoiceLines,
          invoiceConfig,
          invoiceNumberSequence,
          billingContact,
          invoiceTemplate,
          currency,
          country,
          logo,
        },
      };
    } catch (error) {
      logger.error(`viewTemplateData`, { error });
      return {
        success: false,
        errors: {
          root: ['unknown'],
        },
      };
    }
  }

  function voidInvoice(id) {
    const result = dataAccess.view('invoices', id, {});

    if (!result.success) {
      return result;
    }

    const receiptsResult = dataAccess.list('income_receipts', { filters: { invoiceId: id } });

    if (receiptsResult.total > 0) {
      return {
        success: false,
        errors: { id: ['isUsed'] },
      };
    }

    const invoice = result.record;
    return dataAccess.update('invoices', id, Object.assign({}, invoice, { voided: true }));
  }

  return {
    modelClass,
    list,
    view,
    create,
    update,
    remove,
    createWithLines,
    previewInvoice,
    viewTemplateData,
    voidInvoice,
  };
};
