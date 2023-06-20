const sequencesData = {
  1: {
    id: '1',
    name: 'Company ABC Receipt Sequence',
    prefix: 'REC',
    startingNumber: 0,
    lastUsedNumber: 3,
    suffix: 'ABC',
    incrementStep: 1,
  },
  2: {
    id: '2',
    name: 'Company ABC Invoice Sequence',
    prefix: 'INV',
    startingNumber: 0,
    lastUsedNumber: 1,
    suffix: 'ABC',
    incrementStep: 1,
  },
};

const countries = {
  SGP: {
    countryName: 'Singapore',
    alpha3Code: 'SGP',
  },
};

const contactsData = {
  1: {
    id: '1',
    name: 'Coffee Brew Apps',
    country: 'SGP',
    logo: null,
    includes: {
      country: {
        SGP: countries['SGP'],
      },
    },
  },
  2: {
    id: '2',
    name: 'Company ABC',
    country: 'SGP',
    logo: null,
    includes: {
      country: {
        SGP: countries['SGP'],
      },
    },
  },
};

const currenciesData = {
  1: {
    id: '1',
    code: 'SGD',
    symbol: '$',
    exchangeRate: 1,
  },
  2: {
    id: '2',
    code: 'USD',
    symbol: '$',
    exchangeRate: 0.75,
  },
};

const systemConfigsData = {
  1: {
    id: '1',
    effectiveStart: '2023-01-01T00:00:00.000Z',
    baseCurrencyId: '1',
    baseContactId: '1',
    includes: {
      baseCurrencyId: currenciesData['1'],
      baseContactId: contactsData['1'],
    },
  },
};

const templatesData = {
  1: {
    id: '1',
    description: 'Invoice Template',
  },
  2: {
    id: '2',
    description: 'Receipt Template',
  },
};

const receiptConfigsData = {
  1: {
    id: '1',
    receiptNumberSequenceId: '1',
    billingContactId: '2',
    receiptTemplateId: '2',
    includes: {
      receiptNumberSequenceId: sequencesData['1'],
      billingContactId: contactsData['2'],
      receiptTemplateId: templatesData['2'],
    },
  },
};

const invoiceConfigsData = {
  1: {
    invoiceNumberSequenceId: '2',
    billingContactId: '2',
    invoiceTemplateId: '1',
    currencyId: '1',
    includes: {
      invoiceNumberSequenceId: sequencesData['2'],
      billingContactId: contactsData['2'],
      invoiceTemplateId: templatesData['1'],
      currencyId: currenciesData['1'],
    },
  },
  2: {
    invoiceNumberSequenceId: '2',
    billingContactId: '2',
    invoiceTemplateId: '1',
    currencyId: '2',
    includes: {
      invoiceNumberSequenceId: sequencesData['2'],
      billingContactId: contactsData['2'],
      invoiceTemplateId: templatesData['1'],
      currencyId: currenciesData['2'],
    },
  },
};

const invoicesData = {
  1: {
    id: '1',
    totalAmount: 234.23,
    invoiceConfigId: '1',
    currencyId: '1',
    contactId: '2',
    includes: {
      invoiceConfigId: invoiceConfigsData['1'],
      currencyId: currenciesData['1'],
      contactId: contactsData['2'],
    },
  },
  2: {
    id: '2',
    totalAmount: 289.12,
    invoiceConfigId: '2',
    currencyId: '2',
    contactId: '2',
    includes: {
      invoiceConfigId: invoiceConfigsData['2'],
      currencyId: currenciesData['2'],
      contactId: contactsData['2'],
    },
  },
};

const transactionsData = {
  1: {
    id: '1',
    type: 'income',
    transactionDate: '2023-01-01',
    description: 'Income from Company ABC',
    amount: 58.55,
    homeCurrencyAmount: 58.55,
    currencyId: '1',
  },
  2: {
    id: '2',
    type: 'income',
    transactionDate: '2023-02-01',
    description: 'Income from Company ABC',
    amount: 58.55,
    homeCurrencyAmount: 58.55,
    currencyId: '1',
  },
  3: {
    id: '3',
    type: 'income',
    transactionDate: '2023-03-01',
    description: 'Income from Company ABC',
    amount: 58.55,
    homeCurrencyAmount: 58.55,
    currencyId: '1',
  },
};

const incomeReceiptsData = {
  1: {
    id: '1',
    receiptNumber: '1',
    receiptDate: '2023-01-01',
    billableAmount: 234.23,
    paidAmount: 0,
    paymentAmount: 58.55,
    remainingAmount: 175.68,
    customFields: {},
    voided: false,
    currencyId: '1',
    incomeTransactionId: '1',
    contactId: '2',
    incomeReceiptConfigId: '1',
    invoiceId: '1',
    includes: {
      currencyId: currenciesData['1'],
      incomeTransactionId: transactionsData['1'],
      contactId: contactsData['2'],
      incomeReceiptConfigId: receiptConfigsData['1'],
      invoiceId: invoicesData['1'],
    },
  },
  2: {
    id: '2',
    receiptNumber: '2',
    receiptDate: '2023-02-01',
    billableAmount: 234.23,
    paidAmount: 58.55,
    paymentAmount: 58.55,
    remainingAmount: 117.13,
    customFields: {},
    voided: false,
    currencyId: '1',
    incomeTransactionId: '2',
    contactId: '2',
    incomeReceiptConfigId: '1',
    invoiceId: '1',
    includes: {
      currencyId: currenciesData['1'],
      incomeTransactionId: transactionsData['2'],
      contactId: contactsData['2'],
      incomeReceiptConfigId: receiptConfigsData['1'],
      invoiceId: invoicesData['1'],
    },
  },
  3: {
    id: '3',
    receiptNumber: '3',
    receiptDate: '2023-03-01',
    billableAmount: 234.23,
    paidAmount: 117.1,
    paymentAmount: 58.55,
    remainingAmount: 58.58,
    customFields: {},
    voided: false,
    currencyId: '1',
    incomeTransactionId: '3',
    contactId: '2',
    incomeReceiptConfigId: '1',
    invoiceId: '1',
    includes: {
      currencyId: currenciesData['1'],
      incomeTransactionId: transactionsData['3'],
      contactId: contactsData['2'],
      incomeReceiptConfigId: receiptConfigsData['1'],
      invoiceId: invoicesData['1'],
    },
  },
};

const initIndexes = {
  unique: {
  },
  foreign: {
  },
  filter: {
  }
};

module.exports = {
  data: {
    system_configs: systemConfigsData,
    sequences: sequencesData,
    contacts: contactsData,
    countries: countries,
    currencies: currenciesData,
    income_templates: templatesData,
    receipt_templates: templatesData,
    invoice_configs: invoiceConfigsData,
    receipt_configs: receiptConfigsData,
    invoices: invoicesData,
    transactions: transactionsData,
    income_receipts: incomeReceiptsData,
  },
  indexes: initIndexes,
};
