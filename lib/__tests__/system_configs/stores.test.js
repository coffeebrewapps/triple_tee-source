const dataAccess = {
  list: () => {},
  view: () => {},
  create: () => {},
  update: () => {},
  remove: () => {},
};

const logger = {
  log: () => {},
  error: () => {},
};

const utils = require('../../src/utils.js');

const {
  modelClass,
  list,
  view,
  create,
  update,
  remove,
  deactivate,
  viewLatest,
  replaceLatest,
} = require('../../src/system_configs/stores.js')({ dataAccess, logger, utils });

const {
  systemConfigsData,
} = require('../__fixtures__/system_configs.js');

beforeEach(async() => {
  jest
    .useFakeTimers()
    .setSystemTime(new Date('2023-03-01T00:00:00Z'));
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('system_configs store', () => {
  describe('default methods', () => {
    test('modelClass', () => {
      expect(modelClass).toBe('system_configs');
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
        effectiveStart: '2023-01-01',
        baseCurrencyId: '1',
        baseContactId: '1',
      };
      const result = create(params);

      expect(dataAccessSpy).toHaveBeenCalledWith(modelClass, params);
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
    describe('deactivate', () => {
      test('success result - existing record', () => {
        const viewDataSpy = jest.spyOn(dataAccess, 'view').mockImplementation((modelClass, id, params) => {
          const record = Object.assign({}, systemConfigsData[id]);
          delete record.includes;

          return {
            success: true,
            record,
          };
        });

        const updateDataSpy = jest.spyOn(dataAccess, 'update').mockImplementation((modelClass, id, params) => {
          const record = Object.assign({}, systemConfigsData[id], params);
          delete record.includes;

          return {
            success: true,
            record,
          };
        });

        const id = '2';
        const effectiveEnd = new Date();
        const result = deactivate(id, effectiveEnd);

        expect(updateDataSpy).toHaveBeenCalledWith(modelClass, '2', expect.objectContaining({
          id: '2',
          effectiveStart: '2023-02-01',
          effectiveEnd: new Date('2023-03-01T00:00:00.000Z'),
          tagFormat: '{{ category }}:{{ name }}',
          timezone: 'Asia/Singapore',
          baseCurrencyId: '1',
          baseContactId: '1',
        }));

        expect(result.success).toBeTruthy();
        expect(result.record).toEqual(expect.objectContaining({
          id: '2',
          effectiveStart: '2023-02-01',
          effectiveEnd: new Date('2023-03-01T00:00:00.000Z'),
          tagFormat: '{{ category }}:{{ name }}',
          timezone: 'Asia/Singapore',
          baseCurrencyId: '1',
          baseContactId: '1',
        }));
      });

      test('success result - no existing record', () => {
        const viewDataSpy = jest.spyOn(dataAccess, 'view').mockImplementation((modelClass, id, params) => {
          return {
            success: false,
            errors: { id: ['notFound'] },
          };
        });

        const updateDataSpy = jest.spyOn(dataAccess, 'update');

        const id = '2';
        const effectiveEnd = new Date();
        const result = deactivate(id, effectiveEnd);

        expect(updateDataSpy).not.toHaveBeenCalledWith(modelClass, expect.anything(), expect.anything());

        expect(result.success).toBeFalsy();
        expect(result.errors).toEqual(expect.objectContaining({
          id: ['notFound'],
        }));
      });
    });

    describe('viewLatest', () => {
      test('success result - existing record', () => {
        const dataAccessSpy = jest.spyOn(dataAccess, 'list').mockImplementation((modelClass, filters) => {
          const data = Object.values(systemConfigsData).reverse();

          return {
            total: data.length,
            data,
          };
        });

        const result = viewLatest();

        expect(dataAccessSpy).toHaveBeenCalledWith(modelClass, expect.objectContaining({
          sort: {
            field: 'effectiveStart',
            order: 'desc',
          },
          include: ['baseCurrencyId', 'baseContactId'],
          offset: 0,
          limit: 1,
        }));

        expect(result.success).toBeTruthy();
        expect(result.record).toEqual(expect.objectContaining({
          id: '2',
          effectiveStart: '2023-02-01',
          effectiveEnd: null,
          tagFormat: '{{ category }}:{{ name }}',
          timezone: 'Asia/Singapore',
          baseCurrencyId: '1',
          baseContactId: '1',
        }));
      });

      test('success result - no record', () => {
        const dataAccessSpy = jest.spyOn(dataAccess, 'list').mockImplementation((modelClass, filters) => {
          return {
            total: 0,
            data: [],
          };
        });

        const result = viewLatest();

        expect(dataAccessSpy).toHaveBeenCalledWith(modelClass, expect.objectContaining({
          sort: {
            field: 'effectiveStart',
            order: 'desc',
          },
          include: ['baseCurrencyId', 'baseContactId'],
          offset: 0,
          limit: 1,
        }));

        expect(result.success).toBeTruthy();
        expect(result.record).not.toBeDefined();
      });
    });

    describe('replaceLatest', () => {
      test('success result - existing record', () => {
        const listDataSpy = jest.spyOn(dataAccess, 'list').mockImplementation((modelClass, filters) => {
          const data = Object.values(systemConfigsData).reverse();

          return {
            total: data.length,
            data,
          };
        });

        const viewDataSpy = jest.spyOn(dataAccess, 'view').mockImplementation((modelClass, id, params) => {
          const record = Object.assign({}, systemConfigsData[id]);
          delete record.includes;

          return {
            success: true,
            record,
          };
        });

        const updateDataSpy = jest.spyOn(dataAccess, 'update').mockImplementation((modelClass, id, params) => {
          const record = Object.assign({}, systemConfigsData[id], params);
          delete record.includes;

          return {
            success: true,
            record,
          };
        });

        const createDataSpy = jest.spyOn(dataAccess, 'create').mockImplementation((modelClass, params) => {
          return {
            success: true,
            record: Object.assign({}, params, { id: '3' }),
          };
        });

        const params = {
          tagFormat: '{{ category }}-{{ name }}',
          timezone: 'Asia/Singapore',
          baseCurrencyId: '2',
          baseContactId: '1',
        }
        const result = replaceLatest(params);

        expect(listDataSpy).toHaveBeenCalledWith(modelClass, expect.objectContaining({
          sort: {
            field: 'effectiveStart',
            order: 'desc',
          },
          include: ['baseCurrencyId', 'baseContactId'],
          offset: 0,
          limit: 1,
        }));

        expect(updateDataSpy).toHaveBeenCalledWith(modelClass, '2', expect.objectContaining({
          id: '2',
          effectiveStart: '2023-02-01',
          effectiveEnd: new Date('2023-03-01T00:00:00.000Z'),
          tagFormat: '{{ category }}:{{ name }}',
          timezone: 'Asia/Singapore',
          baseCurrencyId: '1',
          baseContactId: '1',
        }));

        expect(createDataSpy).toHaveBeenCalledWith(modelClass, expect.objectContaining({
          effectiveStart: new Date('2023-03-01T00:00:01.000Z'),
          tagFormat: '{{ category }}-{{ name }}',
          timezone: 'Asia/Singapore',
          baseCurrencyId: '2',
          baseContactId: '1',
        }));

        expect(result.success).toBeTruthy();
        expect(result.record).toEqual(expect.objectContaining({
          id: '3',
          effectiveStart: new Date('2023-03-01T00:00:01.000Z'),
          tagFormat: '{{ category }}-{{ name }}',
          timezone: 'Asia/Singapore',
          baseCurrencyId: '2',
          baseContactId: '1',
        }));
      });

      test('success result - no existing record', () => {
        const listDataSpy = jest.spyOn(dataAccess, 'list').mockImplementation((modelClass, filters) => {
          return {
            total: 0,
            data: [],
          };
        });

        const viewDataSpy = jest.spyOn(dataAccess, 'view').mockImplementation((modelClass, id, params) => {
          return {
            success: false,
            errors: { id: ['notFound'] },
          };
        });

        const updateDataSpy = jest.spyOn(dataAccess, 'update');

        const createDataSpy = jest.spyOn(dataAccess, 'create').mockImplementation((modelClass, params) => {
          return {
            success: true,
            record: Object.assign({}, params, { id: '1' }),
          };
        });

        const params = {
          tagFormat: '{{ category }}-{{ name }}',
          timezone: 'Asia/Singapore',
          baseCurrencyId: '2',
          baseContactId: '1',
        }
        const result = replaceLatest(params);

        expect(listDataSpy).toHaveBeenCalledWith(modelClass, expect.objectContaining({
          sort: {
            field: 'effectiveStart',
            order: 'desc',
          },
          include: ['baseCurrencyId', 'baseContactId'],
          offset: 0,
          limit: 1,
        }));

        expect(updateDataSpy).not.toHaveBeenCalledWith(modelClass, expect.anything(), expect.anything());

        expect(createDataSpy).toHaveBeenCalledWith(modelClass, expect.objectContaining({
          effectiveStart: new Date('2023-03-01T00:00:01.000Z'),
          tagFormat: '{{ category }}-{{ name }}',
          timezone: 'Asia/Singapore',
          baseCurrencyId: '2',
          baseContactId: '1',
        }));

        expect(result.success).toBeTruthy();
        expect(result.record).toEqual(expect.objectContaining({
          id: '1',
          effectiveStart: new Date('2023-03-01T00:00:01.000Z'),
          tagFormat: '{{ category }}-{{ name }}',
          timezone: 'Asia/Singapore',
          baseCurrencyId: '2',
          baseContactId: '1',
        }));
      });
    });
  });
});
