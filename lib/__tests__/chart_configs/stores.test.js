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
  chartData,
} = require('../../src/chart_configs/stores.js')({ dataAccess, logger, utils });

const {
  chartConfigsData,
  chartConfigsIncludes,
  transactionsData,
  workLogsData,
} = require('../__fixtures__/chart_configs.js');

describe('chart_configs store', () => {
  describe('default methods', () => {
    test('modelClass', () => {
      expect(modelClass).toBe('chart_configs');
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
    describe('chartData', () => {
      test('transactions group by category scale by dollar', () => {
        const chartConfigsViewSpy = jest.spyOn(dataAccess, 'view').mockImplementation((modelClass, id, params) => {
          if (modelClass === 'chart_configs') {
            return {
              success: true,
              record: chartConfigsData[id],
            };
          }
        });

        const transactionsListSpy = jest.spyOn(dataAccess, 'list').mockImplementation((modelClass, filters) => {
          if (modelClass === 'transactions') {
            return {
              total: 4,
              data: Object.values(transactionsData).slice(2),
            };
          } else {
            return {
              total: 0,
              data: [],
            };
          }
        });

        const result = chartData('2');

        expect(chartConfigsViewSpy).toHaveBeenCalledWith('chart_configs', '2', {});
        expect(transactionsListSpy).toHaveBeenCalledWith('transactions', expect.objectContaining({
          filters: expect.objectContaining({
            transactionDate: expect.objectContaining({
              startDate: '2023-01-01',
              endDate: '2023-12-31',
            }),
            tags: expect.arrayContaining(['1', '2']),
          }),
          sort: expect.objectContaining({
            field: 'tags',
            order: 'asc',
          }),
        }));

        expect(result.success).toBeTruthy();
        expect(result.record).toEqual(expect.arrayContaining([
          {
            key: 'Company XYZ',
            total: 2859.94,
          },
          {
            key: 'Company ABC',
            total: 2925.64,
          },
        ]));
      });

      test('work_logs group by category scale by hour', () => {
        const chartConfigsViewSpy = jest.spyOn(dataAccess, 'view').mockImplementation((modelClass, id, params) => {
          if (modelClass === 'chart_configs') {
            return {
              success: true,
              record: chartConfigsData[id],
            };
          }
        });

        const workLogsListSpy = jest.spyOn(dataAccess, 'list').mockImplementation((modelClass, filters) => {
          if (modelClass === 'transactions') {
            return {
              total: 5,
              data: Object.values(transactionsData).slice(2),
            };
          } else {
            return {
              total: 3,
              data: Object.values(workLogsData).slice(1),
            };
          }
        });

        const result = chartData('1');

        expect(chartConfigsViewSpy).toHaveBeenCalledWith('chart_configs', '1', {});
        expect(workLogsListSpy).toHaveBeenCalledWith('work_logs', expect.objectContaining({
          filters: expect.objectContaining({
            startTime: expect.objectContaining({
              startTime: '2023-01-01',
            }),
            endTime: expect.objectContaining({
              endTime: '2023-12-31',
            }),
            tags: expect.arrayContaining(['3', '4']),
          }),
          sort: expect.objectContaining({
            field: 'tags',
            order: 'asc',
          }),
        }));

        expect(result.success).toBeTruthy();
        expect(result.record).toEqual(expect.arrayContaining([
          {
            key: 'Testing',
            total: 4,
          },
          {
            key: 'Implementation',
            total: 14,
          },
        ]));
      });

      test('transactions group by month scale by dollar', () => {
        const chartConfigsViewSpy = jest.spyOn(dataAccess, 'view').mockImplementation((modelClass, id, params) => {
          if (modelClass === 'chart_configs') {
            return {
              success: true,
              record: chartConfigsData[id],
            };
          }
        });

        const transactionsListSpy = jest.spyOn(dataAccess, 'list').mockImplementation((modelClass, filters) => {
          if (modelClass === 'transactions') {
            return {
              total: 6,
              data: Object.values(transactionsData).slice(2),
            };
          } else {
            return {
              total: 0,
              data: [],
            };
          }
        });

        const result = chartData('3');

        expect(chartConfigsViewSpy).toHaveBeenCalledWith('chart_configs', '3', {});
        expect(transactionsListSpy).toHaveBeenCalledWith('transactions', expect.objectContaining({
          filters: expect.objectContaining({
            transactionDate: expect.objectContaining({
              startDate: '2023-01-01',
              endDate: '2023-12-31',
            }),
          }),
          sort: expect.objectContaining({
            field: 'transactionDate',
            order: 'asc',
          }),
        }));

        expect(result.success).toBeTruthy();
        expect(result.record).toEqual(expect.arrayContaining([
          {
            key: '2023-Mar',
            total: 972.68,
          },
          {
            key: '2023-Jun',
            total: 1083.63,
          },
          {
            key: '2023-Sep',
            total: 3768.99,
          },
          {
            key: '2023-Nov',
            total: -39.72,
          },
          {
            key: '2023-Dec',
            total: -69.59,
          },
        ]));
      });

      test('transactions group by year scale by dollar', () => {
        const chartConfigsViewSpy = jest.spyOn(dataAccess, 'view').mockImplementation((modelClass, id, params) => {
          if (modelClass === 'chart_configs') {
            return {
              success: true,
              record: chartConfigsData[id],
            };
          }
        });

        const transactionsListSpy = jest.spyOn(dataAccess, 'list').mockImplementation((modelClass, filters) => {
          if (modelClass === 'transactions') {
            return {
              total: 9,
              data: Object.values(transactionsData),
            };
          } else {
            return {
              total: 0,
              data: [],
            };
          }
        });

        const result = chartData('4');

        expect(chartConfigsViewSpy).toHaveBeenCalledWith('chart_configs', '4', {});
        expect(transactionsListSpy).toHaveBeenCalledWith('transactions', expect.objectContaining({
          filters: expect.objectContaining({
            transactionDate: expect.objectContaining({
              startDate: '2022-01-01',
              endDate: '2024-12-31',
            }),
          }),
          sort: expect.objectContaining({
            field: 'transactionDate',
            order: 'asc',
          }),
        }));

        expect(result.success).toBeTruthy();
        expect(result.record).toEqual(expect.arrayContaining([
          {
            key: '2022',
            total: 3074.55,
          },
          {
            key: '2023',
            total: 5715.99,
          },
          {
            key: '2024',
            total: 69.59,
          },
        ]));
      });

      test('work_logs group by day scale by minute', () => {
        const chartConfigsViewSpy = jest.spyOn(dataAccess, 'view').mockImplementation((modelClass, id, params) => {
          if (modelClass === 'chart_configs') {
            return {
              success: true,
              record: chartConfigsData[id],
            };
          }
        });

        const workLogsListSpy = jest.spyOn(dataAccess, 'list').mockImplementation((modelClass, filters) => {
          if (modelClass === 'work_logs') {
            return {
              total: 3,
              data: Object.values(workLogsData).slice(1),
            };
          } else {
            return {
              total: 0,
              data: [],
            };
          }
        });

        const result = chartData('5');

        expect(chartConfigsViewSpy).toHaveBeenCalledWith('chart_configs', '5', {});
        expect(workLogsListSpy).toHaveBeenCalledWith('work_logs', expect.objectContaining({
          filters: expect.objectContaining({
            startTime: expect.objectContaining({
              startTime: '2023-01-01',
            }),
            endTime: expect.objectContaining({
              endTime: '2023-12-31',
            }),
          }),
          sort: expect.objectContaining({
            field: 'startTime',
            order: 'asc',
          }),
        }));

        expect(result.success).toBeTruthy();
        expect(result.record).toEqual(expect.arrayContaining([
          {
            key: '2023-Jan-16',
            total: 336,
          },
          {
            key: '2023-Jan-19',
            total: 254,
          },
          {
            key: '2023-Mar-03',
            total: 501,
          },
        ]));
      });
    });
  });
});
