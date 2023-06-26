const path = require('path');
const initDir = path.join(__dirname, '../../_init');
const initSchemas = require(path.join(initDir, 'schemas.json'));

const config = {
  dataStore: 'fs',
  initDir,
  schemas: '_schemas',
  indexes: '_indexes',
};
const logger = {
  log: () => {},
  error: () => {},
};
const utils = require('../src/utils.js');

const {
  transactionsData,
} = require('./__fixtures__/dataAccess.js');

const persistence = {
  initData: () => {
    const transactionsFixtures = transactionsData();
    return new Promise((resolve, reject) => {
      resolve({
        schemas: initSchemas,
        indexes: transactionsFixtures.indexes,
        data: Object.entries(transactionsFixtures.data).map(([key, val]) => {
          return {
            modelClass: key,
            data: val,
          };
        }),
      });
    });
  },
  write: () => {},
};

const validator = require('../src/validator.js')({ config, logger, utils });
const downloader = {
  downloadRawFile: () => {},
};

const dataAccess = require('../src/dataAccess.js')({
  persistence, validator, downloader, config, logger, utils
});

beforeEach(async() => {
  await dataAccess.initData(true);
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('dataAccess', () => {
  test('list - no filter no includes', async() => {
    const result = dataAccess.list('transactions', {});

    expect(result.total).toBe(5);
    expect(result.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: '1', includes: {} }),
      expect.objectContaining({ id: '2', includes: {} }),
      expect.objectContaining({ id: '3', includes: {} }),
      expect.objectContaining({ id: '4', includes: {} }),
      expect.objectContaining({ id: '5', includes: {} }),
    ]));
  });

  test('list - with filters no includes', async() => {
    const result = dataAccess.list('transactions', {
      filters: {
        currencyId: ['1'],
      },
    });

    expect(result.total).toBe(3);
    expect(result.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: '1', includes: {} }),
      expect.objectContaining({ id: '2', includes: {} }),
      expect.objectContaining({ id: '3', includes: {} }),
    ]));
  });

  test('list - with filters with includes', async() => {
    const result = dataAccess.list('transactions', {
      filters: {
        currencyId: ['1'],
      },
      include: ['currencyId'],
    });

    expect(result.total).toBe(3);
    expect(result.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: '1', includes: { currencyId: { 1: expect.any(Object) } } }),
      expect.objectContaining({ id: '2', includes: { currencyId: { 1: expect.any(Object) } } }),
      expect.objectContaining({ id: '3', includes: { currencyId: { 1: expect.any(Object) } } }),
    ]));
  });

  test('list - with data range filters', async() => {
    const result = dataAccess.list('transactions', {
      filters: {
        transactionDate: {
          startDate: '2023-01-01',
          endDate: '2023-01-31',
        },
      },
    });

    expect(result.total).toBe(2);
    expect(result.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: '1', includes: {} }),
      expect.objectContaining({ id: '2', includes: {} }),
    ]));
  });

  test('list - with array field type filters', async() => {
    const result = dataAccess.list('transactions', {
      filters: {
        tags: ['1'],
      },
    });

    expect(result.total).toBe(1);
    expect(result.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: '1', includes: {} }),
    ]));
  });

  test('list - no filter with sort', async() => {
    const result = dataAccess.list('transactions', {
      sort: {
        field: 'amount',
        order: 'asc',
      },
    });

    expect(result.total).toBe(5);
    expect(result.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: '4', includes: {} }),
      expect.objectContaining({ id: '5', includes: {} }),
      expect.objectContaining({ id: '2', includes: {} }),
      expect.objectContaining({ id: '1', includes: {} }),
      expect.objectContaining({ id: '3', includes: {} }),
    ]));
  });

  test('view - found no includes', async() => {
    const result = dataAccess.view('transactions', '1', {});

    expect(result.success).toBeTruthy();
    expect(result.record).toEqual(
      expect.objectContaining({ id: '1', includes: {} })
    );
  });

  test('view - found with includes', async() => {
    const result = dataAccess.view('transactions', '1', {
      include: ['currencyId'],
    });

    expect(result.success).toBeTruthy();
    expect(result.record).toEqual(
      expect.objectContaining({ id: '1', includes: { currencyId: { 1: expect.any(Object) } } })
    );
  });

  test('view - not found', async() => {
    const result = dataAccess.view('transactions', '6', {});

    expect(result.success).toBeFalsy();
    expect(result.errors).toEqual(
      expect.objectContaining({ id: ['notFound'] })
    );
  });

  test('create - valid', async() => {
    const indexesBefore = dataAccess.downloadIndexes().data;
    expect(indexesBefore.filter.transactions).toEqual(
      expect.objectContaining({
        type: {
          income: ['1', '2', '3'],
          expense: ['4', '5'],
        },
        currencyId: {
          1: ['1', '2', '3'],
          2: ['4', '5'],
        },
      })
    );

    const result = dataAccess.create('transactions', {
      type: 'income',
      transactionDate: '2023-09-19',
      description: 'Income from Company ABC',
      amount: 936.19,
      homeCurrencyAmount: 936.19,
      tags: ['1'],
      currencyId: '1',
    });

    expect(result.success).toBeTruthy();
    expect(result.record).toEqual(
      expect.objectContaining({
        id: '6',
        type: 'income',
        transactionDate: '2023-09-19',
        description: 'Income from Company ABC',
        amount: 936.19,
        homeCurrencyAmount: 936.19,
        tags: ['1'],
        currencyId: '1',
      })
    );

    expect(dataAccess.list('transactions', {}).total).toBe(6);

    const indexesAfter = dataAccess.downloadIndexes().data;
    expect(indexesAfter.filter.transactions).toEqual(
      expect.objectContaining({
        type: {
          income: ['1', '2', '3', '6'],
          expense: ['4', '5'],
        },
        currencyId: {
          1: ['1', '2', '3', '6'],
          2: ['4', '5'],
        },
      })
    );
  });

  test('create - invalid', async() => {
    const result = dataAccess.create('transactions', {});

    expect(result.success).toBeFalsy();
    expect(result.errors).toEqual(
      expect.objectContaining({
        type: ['required'],
        transactionDate: ['required'],
        description: ['required'],
        amount: ['required'],
        homeCurrencyAmount: ['required'],
        currencyId: ['required'],
      })
    );
  });

  test('update - existing', async() => {
    const resultBefore = dataAccess.view('transactions', '1', {});

    expect(resultBefore.success).toBeTruthy();
    expect(resultBefore.record).toEqual(
      expect.objectContaining({
        description: 'Income from Company ABC',
        tags: ['1'],
      })
    );

    const indexesBefore = dataAccess.downloadIndexes().data;
    expect(indexesBefore.foreign.tags).toEqual(
      expect.objectContaining({
        1: {
          transactions: ['1'],
        },
        2: {
          transactions: ['2'],
        },
        3: {
          transactions: ['3'],
        },
      })
    );

    const result = dataAccess.update('transactions', '1', {
      description: 'Payment from Company ABC',
      tags: ['1', '5'],
    });

    expect(result.success).toBeTruthy();
    expect(result.record).toEqual(
      expect.objectContaining({
        description: 'Payment from Company ABC',
        tags: ['1', '5'],
      })
    );

    const resultAfter = dataAccess.view('transactions', '1', {});

    expect(resultAfter.success).toBeTruthy();
    expect(resultAfter.record).toEqual(
      expect.objectContaining({
        description: 'Payment from Company ABC',
        tags: ['1', '5'],
      })
    );

    const indexesAfter = dataAccess.downloadIndexes().data;
    expect(indexesAfter.foreign.tags).toEqual(
      expect.objectContaining({
        1: {
          transactions: ['1'],
        },
        2: {
          transactions: ['2'],
        },
        3: {
          transactions: ['3'],
        },
        5: {
          transactions: ['1'],
        },
      })
    );
  });

  test('update - not found', async() => {
    const result = dataAccess.view('transactions', '6', {
      description: 'Payment from Company ABC',
    });

    expect(result.success).toBeFalsy();
    expect(result.errors).toEqual(
      expect.objectContaining({ id: ['notFound'] })
    );
  });

  test('remove - existing', async() => {
    const resultBefore = dataAccess.list('transactions', {});

    expect(resultBefore.total).toBe(5);
    expect(resultBefore.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: '1', includes: {} }),
      expect.objectContaining({ id: '2', includes: {} }),
      expect.objectContaining({ id: '3', includes: {} }),
      expect.objectContaining({ id: '4', includes: {} }),
      expect.objectContaining({ id: '5', includes: {} }),
    ]));

    const indexesBefore = dataAccess.downloadIndexes().data;
    expect(indexesBefore.foreign.tags).toEqual(
      expect.objectContaining({
        1: {
          transactions: ['1'],
        },
        2: {
          transactions: ['2'],
        },
        3: {
          transactions: ['3'],
        },
      })
    );

    expect(indexesBefore.filter.transactions).toEqual(
      expect.objectContaining({
        type: {
          income: ['1', '2', '3'],
          expense: ['4', '5'],
        },
        currencyId: {
          1: ['1', '2', '3'],
          2: ['4', '5'],
        },
      })
    );

    const result = dataAccess.remove('transactions', '1');

    expect(result.success).toBeTruthy();
    expect(result.record).toEqual(
      expect.objectContaining({ id: '1' })
    );

    const resultAfter = dataAccess.list('transactions', {});

    expect(resultAfter.total).toBe(4);
    expect(resultAfter.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: '2', includes: {} }),
      expect.objectContaining({ id: '3', includes: {} }),
      expect.objectContaining({ id: '4', includes: {} }),
      expect.objectContaining({ id: '5', includes: {} }),
    ]));

    const indexesAfter = dataAccess.downloadIndexes().data;
    expect(indexesAfter.foreign.tags).toEqual(
      expect.objectContaining({
        1: {
          transactions: [],
        },
        2: {
          transactions: ['2'],
        },
        3: {
          transactions: ['3'],
        },
      })
    );

    expect(indexesAfter.filter.transactions).toEqual(
      expect.objectContaining({
        type: {
          income: ['2', '3'],
          expense: ['4', '5'],
        },
        currencyId: {
          1: ['2', '3'],
          2: ['4', '5'],
        },
      })
    );
  });

  test('remove - not found', async() => {
    const resultBefore = dataAccess.list('transactions', {});

    expect(resultBefore.total).toBe(5);

    const result = dataAccess.remove('transactions', '6');

    expect(result.success).toBeFalsy();
    expect(result.errors).toEqual(
      expect.objectContaining({ id: ['notFound'] })
    );
  });

  test('isUsed - not used', async() => {
    const result = dataAccess.isUsed('tags', '4');
    expect(result).toBeFalsy();
  });

  test('isUsed - is used', async() => {
    const result = dataAccess.isUsed('tags', '1');
    expect(result).toBeTruthy();
  });

  test('isUsed - not found', async() => {
    const result = dataAccess.isUsed('tags', '6');
    expect(result).toBeFalsy();
  });

  test('atomic - no error', async() => {
    const transactionsBefore = dataAccess.list('transactions', {});
    expect(transactionsBefore.total).toBe(5);

    const currenciesBefore = dataAccess.list('currencies', {});
    expect(currenciesBefore.total).toBe(2);

    const tagsBefore = dataAccess.list('tags', {});
    expect(tagsBefore.total).toBe(5);

    const { success, results } = dataAccess.atomic(
      [
        {
          id: 'createTag',
          params: { category: 'expense', name: 'furniture', description: 'Office Furniture' },
          invoke: (params) => {
            return dataAccess.create('tags', params);
          },
          rollback: (result) => {
            dataAccess.remove('tags', result.record.id);
          },
        },
        {
          id: 'createCurrency',
          params: { code: 'JPY', symbol: 'Y', exchangeRate: 100, effectiveStart: '2023-01-01T00:00:00.000Z' },
          invoke: (params) => {
            return dataAccess.create('currencies', params);
          },
          rollback: (result) => {
            dataAccess.remove('currencies', result.record.id);
          },
        },
        {
          id: 'createTransaction',
          params: {
            type: 'expense',
            transactionDate: '2023-09-21',
            description: 'Payment to Rakuten',
            amount: 16038.56,
            homeCurrencyAmount: 160.38,
          },
          invoke: (params, pastResults) => {
            const currencyId = pastResults[0].result.record.id;
            const tagId = pastResults[1].result.record.id;
            return dataAccess.create('transactions', Object.assign({}, params, { tags: [tagId], currencyId }));
          },
          rollback: (result) => {
          },
        },
      ]
    );

    expect(success).toBeTruthy();
    expect(results[0].result.record).toEqual(
      expect.objectContaining({
        id: '6',
        type: 'expense',
        transactionDate: '2023-09-21',
        description: 'Payment to Rakuten',
        amount: 16038.56,
        homeCurrencyAmount: 160.38,
        tags: ['6'],
        currencyId: '3',
      })
    );

    const transactionsAfter = dataAccess.list('transactions', {});
    expect(transactionsAfter.total).toBe(6);

    const currenciesAfter = dataAccess.list('currencies', {});
    expect(currenciesAfter.total).toBe(3);
    expect(currenciesAfter.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: '3', code: 'JPY', symbol: 'Y', exchangeRate: 100, effectiveStart: '2023-01-01T00:00:00.000Z',
        }),
      ])
    );

    const tagsAfter = dataAccess.list('tags', {});
    expect(tagsAfter.total).toBe(6);
    expect(tagsAfter.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: '6', category: 'expense', name: 'furniture', description: 'Office Furniture',
        }),
      ])
    );
  });

  test('atomic - with error', async() => {
    const tagsBefore = dataAccess.list('tags', {});
    expect(tagsBefore.total).toBe(5);

    const indexesBefore = dataAccess.downloadIndexes().data;
    expect(indexesBefore.unique.tags['category|name']).toEqual(
      expect.objectContaining({
        'company|company-abc': '1',
        'company|company-xyz': '2',
        'company|company-acme': '3',
        'admin|accounting': '4',
        'activity:implementation': '5',
      })
    );

    const { success, results } = dataAccess.atomic(
      [
        {
          id: 'createNewTag',
          params: { category: 'expense', name: 'furniture', description: 'Office Furniture' },
          invoke: (params) => {
            return dataAccess.create('tags', params);
          },
          rollback: (result) => {
            dataAccess.remove('tags', result.record.id);
          },
        },
        {
          id: 'createTagAlreadyExists',
          params: { category: 'admin', name: 'accounting', description: 'Accounting' },
          invoke: (params) => {
            return dataAccess.create('tags', params);
          },
          rollback: (result) => {
            dataAccess.remove('tags', result.record.id);
          },
        },
      ]
    );

    expect(success).toBeFalsy();
    expect(results[0].result.errors).toEqual({
      category: ['unique'],
      name: ['unique'],
    });
    expect(results[1].result.success).toBeTruthy();
    expect(results[1].result.record).toEqual(
      expect.objectContaining({
        id: '6', category: 'expense', name: 'furniture', description: 'Office Furniture',
      })
    );

    const tagsAfter = dataAccess.list('tags', {});
    expect(tagsAfter.total).toBe(5);

    const indexesAfter = dataAccess.downloadIndexes().data;
    expect(indexesAfter.unique.tags['category|name']).toEqual(
      expect.objectContaining({
        'company|company-abc': '1',
        'company|company-xyz': '2',
        'company|company-acme': '3',
        'admin|accounting': '4',
        'activity:implementation': '5',
      })
    );
  });

  test('downloadRawFile', () => {
    const downloaderSpy = jest.spyOn(downloader, 'downloadRawFile').mockImplementation((mimeType, filePath) => {
      return 'data:image/png;base64,aadafadf';
    });

    const mimeType = 'image/png';
    const filePath = 'uploads/logo.png';
    const result = dataAccess.downloadRawFile(mimeType, filePath);

    expect(downloaderSpy).toHaveBeenCalledWith(mimeType, filePath);
  });
});
