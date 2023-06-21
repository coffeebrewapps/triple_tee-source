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

const countries = {
  SGP: {
    countryName: 'Singapore',
    alpha3Code: 'SGP',
  },
};

const systemConfigsData = {
  1: {
    id: '1',
    effectiveStart: '2023-01-01',
    effectiveEnd: '2023-01-31',
    tagFormat: '{{ category }}:{{ name }}',
    timezone: 'UTC',
    baseCurrencyId: '1',
    baseContactId: '1',
    includes: {
      baseCurrencyId: currenciesData['1'],
      baseContactId: contactsData['1'],
    },
  },
  2: {
    id: '2',
    effectiveStart: '2023-02-01',
    effectiveEnd: null,
    tagFormat: '{{ category }}:{{ name }}',
    timezone: 'Asia/Singapore',
    baseCurrencyId: '1',
    baseContactId: '1',
    includes: {
      baseCurrencyId: currenciesData['1'],
      baseContactId: contactsData['1'],
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
    includes: {
      currencyId: currenciesData['1'],
    },
  },
  2: {
    id: '2',
    type: 'expense',
    transactionDate: '2023-02-01',
    description: 'Payment to google.com',
    amount: 9.9,
    homeCurrencyAmount: 9.9,
    currencyId: '1',
    includes: {
      currencyId: currenciesData['1'],
    },
  },
  3: {
    id: '3',
    type: 'income',
    transactionDate: '2023-03-01',
    description: 'Income from Company ABC',
    amount: 58.55,
    homeCurrencyAmount: 58.55,
    currencyId: '1',
    associatedTransactionId: '4',
    includes: {
      currencyId: currenciesData['1'],
      associatedTransactionId: {
        id: '4',
        type: 'incomeReversal',
        transactionDate: '2023-03-02',
        description: 'Refund Company ABC',
        amount: 58.55,
        homeCurrencyAmount: 58.55,
        currencyId: '1',
      },
    },
  },
  4: {
    id: '4',
    type: 'incomeReversal',
    transactionDate: '2023-03-02',
    description: 'Refund Company ABC',
    amount: 58.55,
    homeCurrencyAmount: 58.55,
    currencyId: '1',
    includes: {
      currencyId: currenciesData['1'],
    },
  },
  5: {
    id: '5',
    type: 'expense',
    transactionDate: '2023-04-01',
    description: 'Payment to namecheap.com',
    amount: 29.9,
    homeCurrencyAmount: 29.9,
    currencyId: '1',
    associatedTransactionId: '6',
    includes: {
      currencyId: currenciesData['1'],
      associatedTransactionId: {
        id: '6',
        type: 'expenseReversal',
        transactionDate: '2023-04-03',
        description: 'Refund from namecheap.com',
        amount: 29.9,
        homeCurrencyAmount: 29.9,
        currencyId: '1',
      },
    },
  },
  6: {
    id: '6',
    type: 'expenseReversal',
    transactionDate: '2023-04-03',
    description: 'Refund from namecheap.com',
    amount: 29.9,
    homeCurrencyAmount: 29.9,
    currencyId: '1',
    includes: {
      currencyId: currenciesData['1'],
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
    contacts: contactsData,
    countries: countries,
    currencies: currenciesData,
    transactions: transactionsData,
  },
  indexes: initIndexes,
};
