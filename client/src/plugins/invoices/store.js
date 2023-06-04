export function useStore(dataStore) {
  function notEmpty(value) {
    return !isEmpty(value);
  }

  function isEmpty(value) {
    return Object.is(value, undefined) || Object.is(value, null);
  }

  function viewInvoiceConfigWithIncludes(invoiceConfigId) {
    const invoiceConfig = dataStore.view(
      'invoice_configs',
      invoiceConfigId,
      { include: ['invoiceNumberSequenceId', 'invoiceTemplateId', 'currencyId'] }
    ).record;

    const invoiceNumberSequence = invoiceConfig.includes.invoiceNumberSequenceId[invoiceConfig.invoiceNumberSequenceId];
    const invoiceTemplate = invoiceConfig.includes.invoiceTemplateId[invoiceConfig.invoiceTemplateId];
    const currency = invoiceConfig.includes.currencyId[invoiceConfig.currencyId];

    const billingContact = dataStore.view(
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

  function prefillInvoice({ invoiceConfig, invoiceNumberSequence, billingContact, currency, invoiceLines }) {
    const currentSequence = invoiceNumberSequence.lastUsedNumber + invoiceNumberSequence.incrementStep;

    const lastInvoice = dataStore.list(
      'invoices',
      { sort: { field: 'createdAt', order: 'desc' }, limit: 1 }
    ).data[0];

    let invoiceDate = new Date();
    if (notEmpty(lastInvoice) && Object.keys(lastInvoice).length > 0) {
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

    const subtotal = unitValue * unitCost;

    return {
      description,
      unit,
      unitCost,
      unitValue,
      subtotal,
    };
  }

  function previewInvoice(modelClass, params) {
    try {
      const invoiceConfigId = params.invoiceConfigId;
      const tags = params.tags;
      const startTime = params.startTime;
      const endTime = params.endTime;

      const {
        invoiceConfig,
        invoiceNumberSequence,
        billingContact,
        invoiceTemplate,
        currency,
        country,
        logo,
      } = viewInvoiceConfigWithIncludes(invoiceConfigId);

      const billingConfigs = dataStore.list(
        'billing_configs',
        {
          filters: { contactId: billingContact.id, includeTags: tags },
          include: ['includeTags'],
        }
      ).data;

      const workLogs = dataStore.list(
        'work_logs',
        {
          filters: {
            tags,
            startTime,
            endTime,
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
      console.error(`previewInvoice`, { error });
      return {
        success: false,
        errors: error,
      };
    }
  }

  function createWithLines(modelClass, params) {
    try {
      const invoiceNumberSequence = params.invoiceNumberSequence;
      const invoice = params.invoice;
      const invoiceLines = params.invoiceLines;

      const invoiceNumberSequenceResult = dataStore.update(
        'sequences',
        invoiceNumberSequence.id,
        Object.assign({}, invoiceNumberSequence, { lastUsedNumber: parseInt(invoice.invoiceNumber) })
      );

      if (!invoiceNumberSequenceResult.success) {
        return invoiceNumberSequenceResult;
      }

      const invoiceResult = dataStore.create('invoices', invoice);

      if (!invoiceResult.success) {
        return invoiceResult;
      }

      const createdInvoice = invoiceResult.record;
      const createdLines = invoiceLines.map((line) => {
        const result = dataStore.create(
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
        ),
      };
    } catch (error) {
      return {
        success: false,
        errors: error,
      };
    }
  }

  function viewTemplateData(modelClass, id, params) {
    try {
      const invoiceId = id;
      const invoice = dataStore.view('invoices', invoiceId, {}).record;
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

      const invoiceLines = dataStore.list(
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
      return {
        success: false,
        errors: error,
      };
    }
  }

  return {
    createWithLines,
    previewInvoice,
    viewTemplateData,
  };
}
