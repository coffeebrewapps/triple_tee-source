function validateNoError() {
  return {
    modelClass: 'contacts',
    data: {
    },
    record: {
      name: 'Coffee Brew Apps',
    },
    indexes: {
      unique: {},
      foreign: {},
      filter: {},
    },
  };
}

function validateWithForeignKeyNoError() {
  return {
    modelClass: 'transactions',
    data: {
      tags: {
        1: {
          category: 'company',
          name: 'company-abc',
        },
      },
      currencies: {
        1: {
          code: 'USD',
          symbol: '$',
          exchangeRate: 1,
          effectiveStart: '2023-01-01T00:00:00.000Z',
        },
      },
    },
    record: {
      type: 'income',
      transactionDate: '2023-01-01',
      description: 'Income from Company ABC',
      amount: 1235.73,
      homeCurrencyAmount: 1235.73,
      tags: ['1'],
      currencyId: '1',
    },
    indexes: {
      unique: {},
      foreign: {},
      filter: {},
    },
  };
}

function validateRequired() {
  return {
    modelClass: 'contacts',
    data: {
    },
    record: {
    },
    indexes: {
      unique: {},
      foreign: {},
      filter: {},
    },
  };
}

function validateNotUnique() {
  return {
    modelClass: 'currencies',
    data: {
      currencies: {
        1: {
          code: 'USD',
          symbol: '$',
          effectiveStart: '2023-01-01T00:00:00.000Z',
        },
      },
    },
    record: {
      code: 'USD',
      symbol: '$',
      effectiveStart: '2023-01-01T00:00:00.000Z',
    },
    indexes: {
      unique: {
        currencies: {
          'code|symbol|effectiveStart': {
            'USD|$|2023-01-01T00:00:00.000Z': '1',
          },
        },
      },
      foreign: {},
      filter: {},
    },
  };
}

function validateValidForeignKey() {
  return {
    modelClass: 'work_logs',
    data: {
      tags: {
        1: {
          id: '1',
          category: 'company',
          name: 'company-abc',
        },
      },
    },
    record: {
      tags: ['1'],
    },
    indexes: {
      unique: {},
      foreign: {},
      filter: {},
    },
  };
}

function validateInvalidForeignKey() {
  return {
    modelClass: 'work_logs',
    data: {
    },
    record: {
      tags: ['1'],
    },
    indexes: {
      unique: {},
      foreign: {},
      filter: {},
    },
  };
}

function recordIsUsed() {
  return {
    modelClass: 'currencies',
    data: {
      currencies: {
        1: {
          code: 'USD',
          symbol: '$',
          exchangeRate: 1,
          effectiveStart: '2023-01-01T00:00:00.000Z',
        },
      },
      transactions: {
        id: '1',
        type: 'income',
        transactionDate: '2023-01-01',
        description: 'Income from Company ABC',
        amount: 1235.73,
        homeCurrencyAmount: 1235.73,
        currencyId: '1',
      },
    },
    record: {
      id: '1',
      code: 'USD',
      symbol: '$',
      exchangeRate: 1,
      effectiveStart: '2023-01-01T00:00:00.000Z',
    },
    indexes: {
      unique: {},
      foreign: {
        currencies: {
          1: {
            transactions: ['1'],
          },
        },
      },
      filter: {},
    },
  };
}

function recordNotUsed() {
  return {
    modelClass: 'currencies',
    data: {
      currencies: {
        1: {
          code: 'USD',
          symbol: '$',
          exchangeRate: 1,
          effectiveStart: '2023-01-01T00:00:00.000Z',
        },
      },
    },
    record: {
      id: '1',
      code: 'USD',
      symbol: '$',
      exchangeRate: 1,
      effectiveStart: '2023-01-01T00:00:00.000Z',
    },
    indexes: {
      unique: {},
      foreign: {},
      filter: {},
    },
  };
}

module.exports = {
  validateNoError,
  validateWithForeignKeyNoError,
  validateRequired,
  validateNotUnique,
  validateValidForeignKey,
  validateInvalidForeignKey,
  recordIsUsed,
  recordNotUsed,
};
