function transactionsData() {
  return {
    indexes: {
      unique: {
        currencies: {
          'code|symbol|effectiveStart': {
            'SGD|$|2023-01-01T00:00:00.000Z': '1',
            'USD|$|2023-01-01T00:00:00.000Z': '2',
          },
        },
        tags: {
          'category|name': {
            'company|company-abc': '1',
            'company|company-xyz': '2',
            'company|company-acme': '3',
            'admin|accounting': '4',
            'activity:implementation': '5',
          },
        },
      },
      foreign: {
        currencies: {
          1: {
            transactions: ['1', '2', '3'],
          },
          2: {
            transactions: ['4', '5'],
          },
        },
        tags: {
          1: {
            transactions: ['1'],
          },
          2: {
            transactions: ['2'],
          },
          3: {
            transactions: ['3'],
          },
        },
      },
      filter: {
        currencies: {
          code: {
            SGD: ['1'],
            USD: ['2'],
          },
        },
        tags: {
          category: {
            company: ['1', '2', '3'],
            admin: ['4'],
            activity: ['5'],
          },
        },
        transactions: {
          type: {
            income: ['1', '2', '3'],
            expense: ['4', '5'],
          },
          currencyId: {
            1: ['1', '2', '3'],
            2: ['4', '5'],
          },
        },
      },
    },
    data: {
      currencies: {
        1: {
          id: '1',
          code: 'SGD',
          symbol: '$',
          exchangeRate: 1,
          effectiveStart: '2023-01-01T00:00:00.000Z',
        },
        2: {
          id: '2',
          code: 'USD',
          symbol: '$',
          exchangeRate: 0.714,
          effectiveStart: '2023-01-01T00:00:00.000Z',
        },
      },
      transactions: {
        1: {
          id: '1',
          type: 'income',
          transactionDate: '2023-01-01',
          description: 'Income from Company ABC',
          amount: 1235.73,
          homeCurrencyAmount: 1235.73,
          tags: ['1'],
          currencyId: '1',
        },
        2: {
          id: '2',
          type: 'income',
          transactionDate: '2023-01-17',
          description: 'Income from Company XYZ',
          amount: 694.73,
          homeCurrencyAmount: 694.73,
          tags: ['2'],
          currencyId: '1',
        },
        3: {
          id: '3',
          type: 'income',
          transactionDate: '2023-02-06',
          description: 'Income from Company ACME',
          amount: 1950.73,
          homeCurrencyAmount: 1950.73,
          tags: ['3'],
          currencyId: '1',
        },
        4: {
          id: '4',
          type: 'expense',
          transactionDate: '2023-05-10',
          description: 'Payment to google.com',
          amount: 9.9,
          homeCurrencyAmount: 13.86,
          tags: [],
          currencyId: '2',
        },
        5: {
          id: '5',
          type: 'expense',
          transactionDate: '2023-08-27',
          description: 'Payment to namecheap.com',
          amount: 29.9,
          homeCurrencyAmount: 41.86,
          tags: [],
          currencyId: '2',
        },
      },
      tags: {
        1: {
          id: '1',
          category: 'company',
          name: 'company-abc',
          description: 'Company ABC',
        },
        2: {
          id: '2',
          category: 'company',
          name: 'company-xyz',
          description: 'Company XYZ',
        },
        3: {
          id: '3',
          category: 'company',
          name: 'company-acme',
          description: 'Company ACME',
        },
        4: {
          id: '4',
          category: 'admin',
          name: 'accounting',
          description: 'Accounting',
        },
        5: {
          id: '5',
          category: 'activity',
          name: 'implementation',
          description: 'Implementation',
        },
      },
    },
  };
}

module.exports = {
  transactionsData,
};
