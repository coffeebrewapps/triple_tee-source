const path = require('path');

const config = {};
const logger = {
  log: () => {},
  error: () => {},
};

const utils = require('../../src/utils.js');

const initDir = path.join(__dirname, '../../../_init');
const initSchemas = require(path.join(initDir, 'schemas.json'));
const fixtures = require('../__fixtures__/transactions.js');

const persistence = {
  initData: (_) => {
    const data = Object.entries(fixtures.data).map(([modelClass, modelData]) => {
      return {
        modelClass,
        data: Object.assign({}, modelData),
      };
    });

    return new Promise((resolve, reject) => {
      resolve({
        schemas: initSchemas,
        indexes: fixtures.indexes,
        data,
      });
    });
  },
  write: () => {},
};

const validator = require('../../src/validator.js')({ utils });
const downloader = {};

const dataAccess = require('../../src/dataAccess.js')({ persistence, validator, downloader, config, logger, utils });

const {
  modelClass,
  list,
  view,
  create,
  update,
  remove,
  reverseTransaction,
} = require('../../src/transactions/stores.js')({ dataAccess, logger, utils });

beforeEach(async() => {
  jest
    .useFakeTimers()
    .setSystemTime(new Date('2023-05-01T00:00:00Z'));

  await dataAccess.initData(true);
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('transactions store', () => {
  describe('default methods', () => {
    test('modelClass', () => {
      expect(modelClass).toBe('transactions');
    });

    test('list', () => {
      const dataAccessSpy = jest.spyOn(dataAccess, 'list');

      const filters = {};
      const result = list(filters);

      expect(dataAccessSpy).toHaveBeenCalledWith(modelClass, filters);
    });

    test('view', () => {
      const dataAccessSpy = jest.spyOn(dataAccess, 'view');

      const id = '1';
      const params = {};
      const result = view(id, params);

      expect(dataAccessSpy).toHaveBeenCalledWith(modelClass, id, params);
    });

    describe('create', () => {
      test('same currency no homeCurrencyAmount', () => {
        const dataAccessSpy = jest.spyOn(dataAccess, 'create');

        const params = {
          type: 'income',
          transactionDate: '2023-04-21',
          description: 'Income from Company XYZ',
          amount: 195.38,
          currencyId: '1',
        };
        const result = create(params);

        expect(dataAccessSpy).toHaveBeenCalledWith(modelClass, params);
        expect(result.success).toBeTruthy();
        expect(result.record).toEqual(expect.objectContaining({
          id: '7',
          type: 'income',
          transactionDate: '2023-04-21',
          description: 'Income from Company XYZ',
          amount: 195.38,
          homeCurrencyAmount: 195.38,
          currencyId: '1',
        }));
      });

      test('same currency has homeCurrencyAmount', () => {
        const dataAccessSpy = jest.spyOn(dataAccess, 'create');

        const params = {
          type: 'income',
          transactionDate: '2023-04-21',
          description: 'Income from Company XYZ',
          amount: 195.38,
          homeCurrencyAmount: 260.51,
          currencyId: '1',
        };
        const result = create(params);

        expect(dataAccessSpy).toHaveBeenCalledWith(modelClass, params);
        expect(result.success).toBeTruthy();
        expect(result.record).toEqual(expect.objectContaining({
          id: '7',
          type: 'income',
          transactionDate: '2023-04-21',
          description: 'Income from Company XYZ',
          amount: 195.38,
          homeCurrencyAmount: 260.51,
          currencyId: '1',
        }));
      });

      test('different currency no homeCurrencyAmount', () => {
        const dataAccessSpy = jest.spyOn(dataAccess, 'create');

        const params = {
          type: 'income',
          transactionDate: '2023-04-21',
          description: 'Income from Company XYZ',
          amount: 195.38,
          currencyId: '2',
        };
        const result = create(params);

        expect(dataAccessSpy).toHaveBeenCalledWith(modelClass, params);
        expect(result.success).toBeTruthy();
        expect(result.record).toEqual(expect.objectContaining({
          id: '7',
          type: 'income',
          transactionDate: '2023-04-21',
          description: 'Income from Company XYZ',
          amount: 195.38,
          homeCurrencyAmount: 260.51,
          currencyId: '2',
        }));
      });

      test('different currency has homeCurrencyAmount', () => {
        const dataAccessSpy = jest.spyOn(dataAccess, 'create');

        const params = {
          type: 'income',
          transactionDate: '2023-04-21',
          description: 'Income from Company XYZ',
          amount: 195.38,
          homeCurrencyAmount: 195.38,
          currencyId: '2',
        };
        const result = create(params);

        expect(dataAccessSpy).toHaveBeenCalledWith(modelClass, params);
        expect(result.success).toBeTruthy();
        expect(result.record).toEqual(expect.objectContaining({
          id: '7',
          type: 'income',
          transactionDate: '2023-04-21',
          description: 'Income from Company XYZ',
          amount: 195.38,
          homeCurrencyAmount: 195.38,
          currencyId: '2',
        }));
      });
    });

    test('update', () => {
      const dataAccessSpy = jest.spyOn(dataAccess, 'update');

      const id = '1';
      const params = {
        timezone: 'Asia/Singapore',
      };
      const result = update(id, params);

      expect(dataAccessSpy).toHaveBeenCalledWith(modelClass, id, params);
    });

    test('remove', () => {
      const dataAccessSpy = jest.spyOn(dataAccess, 'remove');

      const id = '1';
      const result = remove(id);

      expect(dataAccessSpy).toHaveBeenCalledWith(modelClass, id);
    });
  });

  describe('custom methods', () => {
    describe('reverseTransaction', () => {
      test('success result - existing income', () => {
        const result = reverseTransaction('1');

        expect(result.success).toBeTruthy();
        expect(result.record).toEqual(expect.objectContaining({
          id: '1',
          type: 'income',
          transactionDate: '2023-01-01',
          description: 'Income from Company ABC',
          amount: 58.55,
          homeCurrencyAmount: 58.55,
          currencyId: '1',
          associatedTransactionId: '7',
          includes: {
            associatedTransactionId: {
              7: expect.objectContaining({
                id: '7',
                type: 'incomeReversal',
                transactionDate: new Date('2023-05-01T00:00:00.000Z'),
                description: 'Reverse Income from Company ABC',
                amount: 58.55,
                homeCurrencyAmount: 58.55,
                currencyId: '1',
              }),
            },
          },
        }));
      });

      test('success result - existing expense', () => {
        const result = reverseTransaction('2');

        expect(result.success).toBeTruthy();
        expect(result.record).toEqual(expect.objectContaining({
          id: '2',
          type: 'expense',
          transactionDate: '2023-02-01',
          description: 'Payment to google.com',
          amount: 9.9,
          homeCurrencyAmount: 9.9,
          currencyId: '1',
          associatedTransactionId: '7',
          includes: {
            associatedTransactionId: {
              7: expect.objectContaining({
                id: '7',
                type: 'expenseReversal',
                transactionDate: new Date('2023-05-01T00:00:00.000Z'),
                description: 'Reverse Payment to google.com',
                amount: 9.9,
                homeCurrencyAmount: 9.9,
                currencyId: '1',
              }),
            },
          },
        }));
      });

      test('failure result - already reversed', () => {
        const result = reverseTransaction('3');

        expect(result.success).toBeFalsy();
        expect(result.errors).toEqual(expect.objectContaining({
          id: ['alreadyReversed'],
        }));
      });

      test('failure result - incomeReversal not revisible', () => {
        const result = reverseTransaction('4');

        expect(result.success).toBeFalsy();
        expect(result.errors).toEqual(expect.objectContaining({
          type: ['notReversible'],
        }));
      });

      test('failure result - expenseReversal not revisible', () => {
        const result = reverseTransaction('6');

        expect(result.success).toBeFalsy();
        expect(result.errors).toEqual(expect.objectContaining({
          type: ['notReversible'],
        }));
      });

      test('failure result - no record', () => {
        const result = reverseTransaction('8');

        expect(result.success).toBeFalsy();
        expect(result.errors).toEqual(expect.objectContaining({
          id: ['notFound'],
        }));
      });
    });
  });
});
