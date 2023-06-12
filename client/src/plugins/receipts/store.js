export function useStore({ dataStore, logger }) {
  function convertToHomeCurrencyAmount(sourceCurrency, sourceAmount) {
    const latestSystemConfigs = dataStore.list(
      'system_configs',
      {
        sort: { field: 'effectiveStart', order: 'desc' },
        include: ['baseCurrencyId'],
        offset: 0,
        limit: 1,
      }
    ).data[0];

    const homeCurrency = latestSystemConfigs.includes.baseCurrencyId[latestSystemConfigs.baseCurrencyId];

    if (sourceCurrency.code === homeCurrency.code) {
      return sourceAmount;
    } else {
      return (sourceAmount / sourceCurrency.exchangeRate).toFixed(2);
    }
  }

  function prefillReceipt({ invoice, pastReceipts, receiptConfig, receiptNumberSequence, billingContact, currency }) {
    const currentSequence = receiptNumberSequence.lastUsedNumber + receiptNumberSequence.incrementStep;

    const receiptDate = new Date();
    const billableAmount = invoice.totalAmount;
    let paidAmount = 0;

    if (pastReceipts.length > 0) {
      pastReceipts.forEach((pastReceipt) => {
        paidAmount = paidAmount + pastReceipt.paymentAmount;
      });
    }

    const paymentAmount = 0;
    const remainingAmount = parseFloat((billableAmount - paidAmount).toFixed(2));

    const receiptIncludes = {};
    receiptIncludes.incomeReceiptConfigId = {};
    receiptIncludes.incomeReceiptConfigId[receiptConfig.id] = receiptConfig;
    receiptIncludes.invoiceId = {};
    receiptIncludes.invoiceId[invoice.id] = invoice;
    receiptIncludes.currencyId = {};
    receiptIncludes.currencyId[currency.id] = currency;
    receiptIncludes.contactId = {};
    receiptIncludes.contactId[billingContact.id] = billingContact;

    return {
      receiptNumber: currentSequence,
      receiptDate,
      billableAmount,
      paidAmount,
      paymentAmount,
      remainingAmount,
      incomeReceiptConfigId: receiptConfig.id,
      invoiceId: invoice.id,
      currencyId: currency.id,
      contactId: billingContact.id,
      includes: receiptIncludes,
    };
  }

  function viewInvoiceWithIncludes(invoiceId) {
    const invoice = dataStore.view(
      'invoices',
      invoiceId,
      {
        include: [
          'currencyId',
        ],
      }
    ).record;

    const currency = invoice.includes.currencyId[invoice.currencyId];

    const billingContact = dataStore.view(
      'contacts',
      invoice.contactId,
      {
        include: [
          'country',
        ],
      }
    ).record;
    const country = billingContact.includes.country[billingContact.country];

    const pastReceipts = dataStore.list(
      'income_receipts',
      {
        filters: { invoiceId },
        sort: { field: 'receiptDate', order: 'desc' },
      }
    ).data;

    const invoiceConfig = dataStore.view(
      'invoice_configs',
      invoice.invoiceConfigId,
      {
        include: [
          'invoiceNumberSequenceId',
        ],
      }
    ).record;
    const invoiceNumberSequence = invoiceConfig.includes.invoiceNumberSequenceId[invoiceConfig.invoiceNumberSequenceId];

    return {
      invoice,
      billingContact,
      currency,
      country,
      pastReceipts,
      invoiceNumberSequence,
    };
  }

  function viewReceiptWithIncludes(receiptId) {
    const receipt = dataStore.view('income_receipts', receiptId, { include: ['incomeTransactionId'] }).record;

    let transaction = null;
    if (receipt.incomeTransactionId) {
      transaction = receipt.includes.incomeTransactionId[receipt.incomeTransactionId];
    }

    const {
      receiptNumberSequence,
    } = viewReceiptConfigWithIncludes(receipt.incomeReceiptConfigId);

    const {
      invoice,
      billingContact,
      currency,
      country,
      pastReceipts,
      invoiceNumberSequence,
    } = viewInvoiceWithIncludes(receipt.invoiceId);

    return {
      receipt,
      invoice,
      currency,
      transaction,
      billingContact,
      country,
      pastReceipts,
      receiptNumberSequence,
      invoiceNumberSequence,
    };
  }

  function viewReceiptConfigWithIncludes(receiptConfigId) {
    const receiptConfig = dataStore.view(
      'receipt_configs',
      receiptConfigId,
      {
        include: [
          'receiptNumberSequenceId',
          'receiptTemplateId',
        ],
      }
    ).record;

    const receiptNumberSequence = receiptConfig.includes.receiptNumberSequenceId[receiptConfig.receiptNumberSequenceId];
    const receiptTemplate = receiptConfig.includes.receiptTemplateId[receiptConfig.receiptTemplateId];

    return {
      receiptConfig,
      receiptNumberSequence,
      receiptTemplate,
    };
  }

  function previewReceipt(modelClass, params) {
    try {
      const invoiceId = params.invoiceId;
      const receiptConfigId = params.receiptConfigId;

      const {
        invoice,
        billingContact,
        currency,
        pastReceipts,
        invoiceNumberSequence,
      } = viewInvoiceWithIncludes(invoiceId);

      const {
        receiptConfig,
        receiptNumberSequence,
        receiptTemplate,
      } = viewReceiptConfigWithIncludes(receiptConfigId);

      const receipt = prefillReceipt({
        invoice, pastReceipts, receiptConfig, receiptNumberSequence, billingContact, currency,
      });

      return {
        success: true,
        record: {
          receipt,
          invoice,
          currency,
          billingContact,
          receiptConfig,
          receiptNumberSequence,
          receiptTemplate,
          invoiceNumberSequence,
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: error,
      };
    }
  }

  function createWithTransaction(modelClass, params) {
    try {
      const receipt = Object.assign({}, params.receipt);
      const receiptConfigId = params.receiptConfigId;
      const invoiceId = receipt.invoiceId;

      const {
        invoice,
        currency,
        pastReceipts,
      } = viewInvoiceWithIncludes(invoiceId);

      const paidAmount = pastReceipts.reduce((sum, pastReceipt) => {
        return sum + pastReceipt.paymentAmount;
      }, 0);
      const billableAmount = invoice.totalAmount;

      if (receipt.paymentAmount > (billableAmount - paidAmount)) {
        return {
          success: false,
          errors: ['lessThanOrEqual'],
        };
      }

      receipt.remainingAmount = parseFloat((billableAmount - paidAmount - receipt.paymentAmount).toFixed(2));

      const {
        receiptNumberSequence,
      } = viewReceiptConfigWithIncludes(receiptConfigId);
      const lastUsedNumber = receiptNumberSequence.lastUsedNumber + receiptNumberSequence.incrementStep;

      const { success, results } = dataStore.atomic(
        [
          {
            id: 'updateNumberSequence',
            params: {
              receiptNumberSequenceId: receiptNumberSequence.id,
              lastUsedNumber,
            },
            invoke: ({ receiptNumberSequenceId, lastUsedNumber }, pastResults) => {
              return dataStore.update('sequences', receiptNumberSequenceId, { lastUsedNumber });
            },
            rollback: (result) => {
              const updatedSequenceNumberId = result.record.id;
              const updatedLastUsedNumber = result.record.lastUsedNumber;
              const incrementStep = result.record.incrementStep;
              dataStore.update(
                'sequences',
                updatedSequenceNumberId,
                { lastUsedNumber: updatedLastUsedNumber - incrementStep }
              );
            },
          },
          {
            id: 'createTransaction',
            params: {
              type: 'income',
              transactionDate: receipt.receiptDate,
              description: `Income from Receipt ${receipt.receiptNumber}`,
              amount: receipt.paymentAmount,
              homeCurrencyAmount: convertToHomeCurrencyAmount(currency, receipt.paymentAmount),
              tags: [],
              currencyId: receipt.currencyId,
            },
            invoke: (params, pastResults) => {
              return dataStore.create('transactions', params);
            },
            rollback: (result) => {
              const transactionId = result.record.id;
              dataStore.remove('transactions', transactionId);
            },
          },
          {
            id: 'createReceipt',
            params: receipt,
            invoke: (params, pastResults) => {
              const createdTransaction = pastResults[0].result.record;
              return dataStore.create(
                'income_receipts',
                Object.assign({}, params, { incomeTransactionId: createdTransaction.id })
              );
            },
            rollback: (result) => {
              const receiptId = result.record.id;
              dataStore.remove('income_receipts', receiptId);
            },
          },
        ]
      );

      if (success) {
        const createdReceipt = results[2].record;
        const transaction = results[1].record;
        return {
          success: true,
          record: Object.assign(
            {},
            createdReceipt,
            { transaction }
          ),
        };
      } else {
        return results[0].result;
      }
    } catch (error) {
      logger.error(`Error creating receipt with transaction`, error);
      return {
        success: false,
        errors: error,
      };
    }
  }

  function viewTemplateData(modelClass, receiptId, params) {
    try {
      const {
        receipt,
        invoice,
        currency,
        transaction,
        billingContact,
        country,
        invoiceNumberSequence,
      } = viewReceiptWithIncludes(receiptId);

      const receiptConfigId = receipt.incomeReceiptConfigId;
      const {
        receiptConfig,
        receiptNumberSequence,
        receiptTemplate,
      } = viewReceiptConfigWithIncludes(receiptConfigId);

      return {
        success: true,
        record: {
          receipt,
          invoice,
          currency,
          transaction,
          billingContact,
          country,
          receiptConfig,
          receiptNumberSequence,
          receiptTemplate,
          invoiceNumberSequence,
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
    createWithTransaction,
    previewReceipt,
    viewTemplateData,
  };
}
