const path = require('path');

const config = {};
const logger = {
  log: () => {},
  error: () => {},
};

const utils = require('../../src/utils.js');

const initDir = path.join(__dirname, '../../../_init');
const initSchemas = require(path.join(initDir, 'schemas.json'));
const fixtures = require('../__fixtures__/tax_tables.js');

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
  estimateTax,
} = require('../../src/tax_tables/stores.js')({ dataAccess, logger, utils });

beforeEach(async() => {
  jest
    .useFakeTimers()
    .setSystemTime(new Date('2023-04-01T00:00:00Z'));

  await dataAccess.initData(true);
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('tax_tables store', () => {
  describe('default methods', () => {
    test('modelClass', () => {
      expect(modelClass).toBe('tax_tables');
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

    test('create', () => {
      const dataAccessSpy = jest.spyOn(dataAccess, 'create');

      const params = {
        description: 'Hours by Month',
        chartType: 'hbar',
        dataSource: 'work_logs',
        scaleUnit: 'hour',
        scaleValue: 10,
        groupBy: 'month',
        includeTags: [],
        excludeTags: [],
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        displayOrder: 2,
        active: true,
      };
      const result = create(params);

      expect(dataAccessSpy).toHaveBeenCalledWith(modelClass, params);
    });

    test('update', () => {
      const dataAccessSpy = jest.spyOn(dataAccess, 'update');

      const id = '1';
      const params = {
        displayOrder: 2,
        active: false,
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
    describe('estimateTax', () => {
      test('success result - has payable bracket', () => {
        const result = estimateTax('1');
        expect(result.success).toBeTruthy();

        expect(result.record.incomeBracket).toEqual(expect.objectContaining({
          id: '2',
          minIncome: 20000.01,
          maxIncome: 30000,
          maxPayableAmount: 200,
          rate: 0.02,
          taxTableId: '1',
        }));

        expect(result.record.payable).toEqual(70.18);
        expect(result.record.nettIncome).toEqual(23508.82);
        expect(result.record.totalDeductible).toEqual(17349.11);
      });

      test('success result - no transaction', () => {
        const result = estimateTax('2');
        expect(result.success).toBeTruthy();
        expect(result.record.nettIncome).toEqual(0);
        expect(result.record.totalDeductible).toEqual(0);
        expect(result.record.incomeBracket).toBeNull();
        expect(result.record.payable).toEqual(0);
      });

      test('failure result - no tier', () => {
        const result = estimateTax('3');
        expect(result.success).toBeFalsy();
        expect(result.errors).toEqual(expect.objectContaining({
          payableTier: ['notFound'],
        }));
      });

      test('failure result - negative income', () => {
        const result = estimateTax('4');
        expect(result.success).toBeFalsy();
        expect(result.errors).toEqual(expect.objectContaining({
          nettIncome: ['negative'],
        }));
      });

      test('failure result - no matching bracket', () => {
        const result = estimateTax('5');
        expect(result.success).toBeFalsy();
        expect(result.errors).toEqual(expect.objectContaining({
          payableTier: ['notFound'],
        }));
      });
    });
  });
});
