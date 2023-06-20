const chartConfigsData = {
  1: {
    id: '1',
    description: 'Hours by Activity',
    chartType: 'hbar',
    dataSource: 'work_logs',
    scaleUnit: 'hour',
    scaleValue: 10,
    groupBy: 'category',
    includeTags: ['3','4'],
    excludeTags: [],
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    displayOrder: 1,
    active: true,
  },
  2: {
    id: '2',
    description: 'Revenue by Company',
    chartType: 'hbar',
    dataSource: 'transactions',
    scaleUnit: 'dollar',
    scaleValue: 1000,
    groupBy: 'category',
    includeTags: ['1', '2'],
    excludeTags: [],
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    displayOrder: 1,
    active: true,
  },
  3: {
    id: '3',
    description: 'Revenue by Month',
    chartType: 'vbar',
    dataSource: 'transactions',
    scaleUnit: 'dollar',
    scaleValue: 1000,
    groupBy: 'month',
    includeTags: [],
    excludeTags: [],
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    displayOrder: 1,
    active: true,
  },
  4: {
    id: '4',
    description: 'Revenue by Year',
    chartType: 'vbar',
    dataSource: 'transactions',
    scaleUnit: 'dollar',
    scaleValue: 1000,
    groupBy: 'year',
    includeTags: [],
    excludeTags: [],
    startDate: '2022-01-01',
    endDate: '2024-12-31',
    displayOrder: 1,
    active: true,
  },
  5: {
    id: '5',
    description: 'Minutes by Day',
    chartType: 'vbar',
    dataSource: 'work_logs',
    scaleUnit: 'minute',
    scaleValue: 1,
    groupBy: 'day',
    includeTags: [],
    excludeTags: [],
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    displayOrder: 1,
    active: true,
  },
};

const chartConfigsIncludes = {
  1: {
    includeTags: {
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
    },
  },
  2: {
    includeTags: {
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
    },
  },
};

const tagsData = {
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
    category: 'activity',
    name: 'implementation',
    description: 'Implementation',
  },
  4: {
    id: '4',
    category: 'activity',
    name: 'testing',
    description: 'Testing',
  },
};

const transactionsData = {
  1: {
    id: '1',
    type: 'income',
    description: 'Income from Company ABC',
    amount: 3083.48,
    homeCurrencyAmount: 3083.48,
    transactionDate: '2022-10-14',
    tags: ['1'],
    includes: {
      tags: {
        1: tagsData['1'],
      },
    },
  },
  2: {
    id: '2',
    type: 'expense',
    description: 'Payment to Google.com',
    amount: 8.93,
    homeCurrencyAmount: 8.93,
    transactionDate: '2022-11-19',
    tags: [],
    includes: {
      tags: {
      },
    },
  },
  3: {
    id: '3',
    type: 'income',
    description: 'Income from Company XYZ',
    amount: 682.63,
    homeCurrencyAmount: 972.68,
    transactionDate: '2023-03-19',
    tags: ['2'],
    includes: {
      tags: {
        2: tagsData['2'],
      },
    },
  },
  4: {
    id: '4',
    type: 'income',
    description: 'Income from Company XYZ',
    amount: 760.49,
    homeCurrencyAmount: 1083.63,
    transactionDate: '2023-06-10',
    tags: ['2'],
    includes: {
      tags: {
        2: tagsData['2'],
      },
    },
  },
  5: {
    id: '5',
    type: 'income',
    description: 'Income from Company XYZ',
    amount: 563.99,
    homeCurrencyAmount: 803.63,
    transactionDate: '2023-09-19',
    tags: ['2'],
    includes: {
      tags: {
        2: tagsData['2'],
      },
    },
  },
  6: {
    id: '6',
    type: 'income',
    description: 'Income from Company ABC',
    amount: 2965.36,
    homeCurrencyAmount: 2965.36,
    transactionDate: '2023-09-23',
    tags: ['1'],
    includes: {
      tags: {
        1: tagsData['1'],
      },
    },
  },
  7: {
    id: '7',
    type: 'incomeReversal',
    description: 'Refund Company ABC',
    amount: 39.72,
    homeCurrencyAmount: 39.72,
    transactionDate: '2023-11-19',
    tags: ['1'],
    includes: {
      tags: {
        1: tagsData['1'],
      },
    },
  },
  8: {
    id: '8',
    type: 'expense',
    description: 'Payment to namecheap.com',
    amount: 69.59,
    homeCurrencyAmount: 69.59,
    transactionDate: '2023-12-03',
    tags: [],
    includes: {
      tags: {
      },
    },
  },
  9: {
    id: '9',
    type: 'expenseReversal',
    description: 'Refund from namecheap.com',
    amount: 69.59,
    homeCurrencyAmount: 69.59,
    transactionDate: '2024-01-19',
    tags: [],
    includes: {
      tags: {
      },
    },
  },
};

const workLogsData = {
  1: {
    id: '1',
    startTime: '2022-11-23T12:31:28.234Z',
    endTime: '2022-11-23T19:14:42.794Z',
    description: 'Implement website for Company ABC',
    tags: ['1', '3'],
    includes: {
      tags: {
        1: tagsData['1'],
        3: tagsData['3'],
      },
    },
  },
  2: {
    id: '2',
    startTime: '2023-01-16T09:29:49.490Z',
    endTime: '2023-01-16T15:06:16.893Z',
    description: 'Implement features for Company ABC',
    tags: ['1', '3'],
    includes: {
      tags: {
        1: tagsData['1'],
        3: tagsData['3'],
      },
    },
  },
  3: {
    id: '3',
    startTime: '2023-01-19T10:18:39.290Z',
    endTime: '2023-01-19T14:32:24.088Z',
    description: 'Testing for Company ABC',
    tags: ['1', '4'],
    includes: {
      tags: {
        1: tagsData['1'],
        4: tagsData['4'],
      },
    },
  },
  4: {
    id: '4',
    startTime: '2023-03-03T09:29:35.405Z',
    endTime: '2023-03-03T17:50:23.532Z',
    description: 'Implement features for Company XYZ',
    tags: ['2', '3'],
    includes: {
      tags: {
        1: tagsData['1'],
        3: tagsData['3'],
      },
    },
  },
};

module.exports = {
  chartConfigsData,
  chartConfigsIncludes,
  transactionsData,
  tagsData,
  workLogsData,
};
