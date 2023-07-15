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
    lastUsedNumber: 2,
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
  },
  2: {
    id: '2',
    name: 'Company ABC',
    country: 'SGP',
    logo: null,
  },
};

const currenciesData = {
  1: {
    id: '1',
    code: 'SGD',
    symbol: '$',
    exchangeRate: 1,
    effectiveStart: '2023-01-01',
  },
  2: {
    id: '2',
    code: 'USD',
    symbol: '$',
    exchangeRate: 0.75,
    effectiveStart: '2023-01-01',
  },
};

const systemConfigsData = {
  1: {
    id: '1',
    effectiveStart: '2023-01-01T00:00:00.000Z',
    baseCurrencyId: '1',
    baseContactId: '1',
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

const tags = {
  1: {
    id: '1',
    category: 'company',
    name: 'company-abc',
    description: 'Company ABC',
  },
  2: {
    id: '2',
    category: 'activity',
    name: 'implementation',
    description: 'Implementation',
  },
  3: {
    id: '3',
    category: 'activity',
    name: 'testing',
    description: 'Testing',
  },
};

const billingConfigsData = {
  1: {
    id: '1',
    description: 'Implementation',
    effectiveStart: '2023-01-01',
    rateType: 'duration',
    unit: 'hour',
    unitCost: 105,
    includeTags: ['2'],
    excludeTags: [],
    contactId: '2'
  },
  2: {
    id: '2',
    description: 'Testing',
    effectiveStart: '2023-01-01',
    rateType: 'duration',
    unit: 'hour',
    unitCost: 95,
    includeTags: ['3'],
    excludeTags: [],
    contactId: '2'
  },
};

const invoiceConfigsData = {
  1: {
    id: '1',
    invoiceNumberSequenceId: '2',
    invoiceCycleDurationValue: 1,
    invoiceCycleDurationUnit: 'month',
    dueDateCycleValue: 30,
    dueDateCycleUnit: 'day',
    billingContactId: '2',
    invoiceTemplateId: '1',
    currencyId: '1',
  },
  2: {
    id: '2',
    invoiceNumberSequenceId: '2',
    invoiceCycleDurationValue: 30,
    invoiceCycleDurationUnit: 'day',
    dueDateCycleValue: 1,
    dueDateCycleUnit: 'month',
    billingContactId: '2',
    invoiceTemplateId: '1',
    currencyId: '2',
  },
};

const invoicesData = {
  1: {
    id: '1',
    invoiceNumber: '1',
    invoiceDate: '2023-01-01',
    dueDate: '2023-01-31',
    totalAmount: 234.23,
    invoiceConfigId: '1',
    currencyId: '1',
    contactId: '2',
    voided: false,
    createdAt: '2023-01-02T00:00:00.000Z',
  },
  2: {
    id: '2',
    invoiceNumber: '2',
    invoiceDate: '2023-02-01',
    dueDate: '2023-02-28',
    totalAmount: 289.12,
    invoiceConfigId: '2',
    currencyId: '2',
    contactId: '2',
    voided: false,
    createdAt: '2023-02-02T00:00:00.000Z',
  },
};

const invoiceLinesData = {
  1: {
    id: '1',
    description: 'Implementation',
    unit: 'hour',
    unitCost: 105,
    unitValue: 5,
    subtotal: 525,
    invoiceId: '1',
  },
  2: {
    id: '2',
    description: 'Implementation',
    unit: 'hour',
    unitCost: 105,
    unitValue: 9,
    subtotal: 945,
    invoiceId: '2',
  },
};

const receiptConfigsData = {
  1: {
    id: '1',
    receiptNumberSequenceId: '1',
    billingContactId: '2',
    receiptTemplateId: '2',
  },
};

const transactionsData = {
  1: {
    id: '1',
    type: 'income',
    transactionDate: '2023-01-21',
    description: 'Income from Company ABC',
    amount: 289.12,
    homeCurrencyAmount: 289.12,
    currencyId: '1',
  },
};

const incomeReceiptsData = {
  1: {
    id: '1',
    receiptNumber: '1',
    receiptDate: '2023-01-21',
    billableAmount: 289.12,
    paidAmount: 0,
    paymentAmount: 289.12,
    remainingAmount: 0,
    customFields: {},
    voided: false,
    currencyId: '1',
    incomeTransactionId: '1',
    contactId: '2',
    incomeReceiptConfigId: '1',
    invoiceId: '2',
  },
};

const workLogsData = {
  1: {
    id: '1',
    startTime: '2023-01-12T14:29:45.023Z',
    endTime: '2023-01-12T17:42:20.284Z',
    description: 'Implement website',
    tags: ['1', '2'],
  },
  2: {
    id: '2',
    startTime: '2023-01-23T09:31:10.240Z',
    endTime: '2023-01-23T13:10:35.497Z',
    description: 'Test website',
    tags: ['1', '3'],
  },
  3: {
    id: '3',
    startTime: '2023-01-30T16:38:53.052Z',
    endTime: '2023-01-30T18:02:24.963Z',
    description: 'Hiring',
    tags: [],
  },
  4: {
    id: '4',
    startTime: '2023-02-02T11:01:25.903Z',
    endTime: '2023-02-02T19:42:39.238Z',
    description: 'Hiring',
    tags: [],
  },
  5: {
    id: '5',
    startTime: '2023-03-15T14:39:27.395Z',
    endTime: '2023-03-15T19:13:58.289Z',
    description: 'Requirements',
    tags: ['1'],
  },
  6: {
    id: '6',
    startTime: '2023-03-19T09:12:42.533Z',
    endTime: '2023-03-19T16:36:30.423Z',
    description: 'Implement features',
    tags: ['1', '2'],
  },
  7: {
    id: '7',
    startTime: '2023-03-22T13:35:20.239Z',
    endTime: '2023-03-22T15:19:35.684Z',
    description: 'Test features',
    tags: ['1', '3'],
  },
  8: {
    id: '8',
    startTime: '2023-03-24T12:39:10.384Z',
    endTime: '2023-03-24T18:28:14.832Z',
    description: 'Test features',
    tags: ['1', '3'],
  },
  9: {
    id: '9',
    startTime: '2023-03-29T11:34:19.359Z',
    endTime: '2023-03-29T14:01:38.502Z',
    description: 'Implement features',
    tags: ['1', '2'],
  },
  10: {
    id: '10',
    startTime: '2023-03-31T15:31:52.385Z',
    endTime: '2023-03-31T17:04:15.352Z',
    description: 'Accounting',
    tags: [],
  },
};

const initIndexes = {
  unique: {
    currencies: {
      'code|symbol|effectiveStart': {
        'SGD|$|2023-01-01': '1',
        'USD|$|2023-01-01': '2',
      },
    },
    system_configs: {
      'effectiveStart|effectiveEnd': {
        '2023-01-01T00:00:00.000Z|': '1',
      },
    },
    tags: {
      'category|name': {
        'company|company-abc': '1',
        'activty|implementation': '2',
        'activty|testing': '3',
      },
    },
    invoices: {
      'invoiceNumber': {
        1: '1',
        2: '2',
      },
    },
  },
  foreign: {
    sequences: {
      1: {
        receipt_configs: ['1'],
      },
      2: {
        invoice_configs: ['1', '2'],
      },
    },
    countries: {
      SGP: {
        contacts: ['1', '2'],
      },
    },
    contacts: {
      1: {
        system_configs: ['1'],
      },
      2: {
        billing_configs: ['1', '2'],
        invoices: ['1', '2'],
        invoice_configs: ['1', '2'],
        receipt_configs: ['1'],
        income_receipts: ['1'],
      }
    },
    currencies: {
      1: {
        invoice_configs: ['1', '2'],
        invoices: ['1', '2'],
        system_configs: ['1'],
        income_receipts: ['1'],
      },
    },
    tags: {
      1: {
        work_logs: ['1', '2', '5', '6', '7', '8'],
      },
      2: {
        work_logs: ['1', '6', '9'],
      },
      3: {
        work_logs: ['2', '7', '8'],
      },
    },
    invoices: {
      1: {
        invoice_lines: ['1'],
      },
      2: {
        invoice_lines: ['2'],
        income_receipts: ['1'],
      },
    },
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
    invoice_templates: templatesData,
    billing_configs: billingConfigsData,
    income_receipts: incomeReceiptsData,
    receipt_configs: receiptConfigsData,
    invoice_configs: invoiceConfigsData,
    invoices: invoicesData,
    invoice_lines: invoiceLinesData,
    tags: tags,
    transactions: transactionsData,
    work_logs: workLogsData,
  },
  indexes: initIndexes,
};
