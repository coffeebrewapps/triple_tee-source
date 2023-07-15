const path = require('path');

const config = {};
const logger = {
  log: () => {},
  error: () => {},
};

const utils = require('../../src/utils.js');

const initDir = path.join(__dirname, '../../../_init');
const initSchemas = require(path.join(initDir, 'schemas.json'));
const fixtures = require('../__fixtures__/invoices.js');

const persistence = {
  initData: (_) => {
    const data = Object.entries(fixtures.data).map(([modelClass, modelData]) => {
      return {
        modelClass,
        data: modelData,
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
  createWithLines,
  previewInvoice,
  viewTemplateData,
  voidInvoice,
} = require('../../src/invoices/stores.js')({ dataAccess, logger, utils });

beforeEach(async() => {
  jest
    .useFakeTimers()
    .setSystemTime(new Date('2023-04-01T00:00:00Z'));

  await dataAccess.initData(true);
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('invoices store', () => {
  describe('default methods', () => {
    test('modelClass', () => {
      expect(modelClass).toBe('invoices');
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
        totalAmount: 234.23,
        invoiceConfigId: '1',
        currencyId: '1',
        contactId: '2',
      };
      const result = create(params);

      expect(dataAccessSpy).toHaveBeenCalledWith(modelClass, params);
    });

    test('update', () => {
      const dataAccessSpy = jest.spyOn(dataAccess, 'update');

      const id = '1';
      const params = {
        voided: true,
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
    describe('createWithLines', () => {
      test('success result', () => {
        const params = {
          invoice: {
            invoiceDate: '2023-05-01',
            dueDate: '2023-06-01',
            totalAmount: 2375,
            invoiceConfigId: '2',
            currencyId: '2',
            contactId: '2',
          },
          invoiceNumberSequence: {
            id: '2',
          },
          invoiceLines: [
            {
              description: 'Implementation',
              unit: 'hour',
              unitCost: 95,
              unitValue: 4,
              subtotal: 380,
            },
            {
              description: 'Testing',
              unit: 'hour',
              unitCost: 105,
              unitValue: 19,
              subtotal: 1995,
            },
          ],
        };

        const sequenceBefore = dataAccess.view('sequences', '2', {});
        expect(sequenceBefore.record.lastUsedNumber).toBe(2);

        const invoicesBefore = dataAccess.list('invoices', {});
        expect(invoicesBefore.total).toBe(2);

        const invoiceLinesBefore = dataAccess.list('invoice_lines', {});
        expect(invoiceLinesBefore.total).toBe(2);

        const result = createWithLines(params);
        expect(result.success).toBeTruthy();
        expect(result.record).toEqual(expect.objectContaining({
          id: '3',
          invoiceNumber: '3',
          invoiceDate: '2023-05-01',
          dueDate: '2023-06-01',
          totalAmount: 2375,
          invoiceConfigId: '2',
          currencyId: '2',
          contactId: '2',
          invoiceLines: expect.arrayContaining([
            expect.objectContaining({
              id: '3',
              description: 'Implementation',
              unit: 'hour',
              unitCost: 95,
              unitValue: 4,
              subtotal: 380,
              invoiceId: '3',
            }),
            expect.objectContaining({
              id: '4',
              description: 'Testing',
              unit: 'hour',
              unitCost: 105,
              unitValue: 19,
              subtotal: 1995,
              invoiceId: '3',
            }),
          ]),
        }));

        const sequenceAfter = dataAccess.view('sequences', '2', {});
        expect(sequenceAfter.record.lastUsedNumber).toBe(3);

        const invoicesAfter = dataAccess.list('invoices', {});
        expect(invoicesAfter.total).toBe(3);

        const invoiceLinesAfter = dataAccess.list('invoice_lines', {});
        expect(invoiceLinesAfter.total).toBe(4);
      });

      test('failure result - sequence not exists', () => {
        const params = {
          invoice: {
            invoiceDate: '2023-05-01',
            dueDate: '2023-06-01',
            totalAmount: 2375,
            invoiceConfigId: '2',
            currencyId: '2',
            contactId: '2',
          },
          invoiceNumberSequence: {
            id: '3',
          },
          invoiceLines: [
            {
              description: 'Implementation',
              unit: 'hour',
              unitCost: 95,
              unitValue: 4,
              subtotal: 380,
            },
            {
              description: 'Testing',
              unit: 'hour',
              unitCost: 105,
              unitValue: 19,
              subtotal: 1995,
            },
          ],
        };

        const invoicesBefore = dataAccess.list('invoices', {});
        expect(invoicesBefore.total).toBe(2);

        const invoiceLinesBefore = dataAccess.list('invoice_lines', {});
        expect(invoiceLinesBefore.total).toBe(2);

        const result = createWithLines(params);
        expect(result.success).toBeFalsy();
        expect(result.errors).toEqual(expect.objectContaining({
          id: ['notFound'],
        }));

        const invoicesAfter = dataAccess.list('invoices', {});
        expect(invoicesAfter.total).toBe(2);

        const invoiceLinesAfter = dataAccess.list('invoice_lines', {});
        expect(invoiceLinesAfter.total).toBe(2);
      });

      test('failure result - invoice validate error', () => {
        const params = {
          invoice: {
            dueDate: '2023-06-01',
            totalAmount: 2375,
            invoiceConfigId: '2',
            currencyId: '2',
            contactId: '2',
          },
          invoiceNumberSequence: {
            id: '2',
          },
          invoiceLines: [
            {
              description: 'Implementation',
              unit: 'hour',
              unitCost: 95,
              unitValue: 4,
              subtotal: 380,
            },
            {
              description: 'Testing',
              unit: 'hour',
              unitCost: 105,
              unitValue: 19,
              subtotal: 1995,
            },
          ],
        };

        const sequenceBefore = dataAccess.view('sequences', '2', {});
        expect(sequenceBefore.record.lastUsedNumber).toBe(2);

        const invoicesBefore = dataAccess.list('invoices', {});
        expect(invoicesBefore.total).toBe(2);

        const invoiceLinesBefore = dataAccess.list('invoice_lines', {});
        expect(invoiceLinesBefore.total).toBe(2);

        const result = createWithLines(params);
        expect(result.success).toBeFalsy();
        expect(result.errors).toEqual(expect.objectContaining({
          invoiceDate: ['required'],
        }));

        const sequenceAfter = dataAccess.view('sequences', '2', {});
        expect(sequenceAfter.record.lastUsedNumber).toBe(2);

        const invoicesAfter = dataAccess.list('invoices', {});
        expect(invoicesAfter.total).toBe(2);

        const invoiceLinesAfter = dataAccess.list('invoice_lines', {});
        expect(invoiceLinesAfter.total).toBe(2);
      });

      test('failure result - invoice line validate error', () => {
        const params = {
          invoice: {
            invoiceDate: '2023-05-01',
            dueDate: '2023-06-01',
            totalAmount: 2375,
            invoiceConfigId: '2',
            currencyId: '2',
            contactId: '2',
          },
          invoiceNumberSequence: {
            id: '2',
          },
          invoiceLines: [
            {
              description: 'Implementation',
              unit: 'hour',
              unitCost: 95,
              unitValue: 4,
              subtotal: 380,
            },
            {
              unit: 'hour',
              unitCost: 105,
              unitValue: 19,
              subtotal: 1995,
            },
          ],
        };

        const sequenceBefore = dataAccess.view('sequences', '2', {});
        expect(sequenceBefore.record.lastUsedNumber).toBe(2);

        const invoicesBefore = dataAccess.list('invoices', {});
        expect(invoicesBefore.total).toBe(2);

        const invoiceLinesBefore = dataAccess.list('invoice_lines', {});
        expect(invoiceLinesBefore.total).toBe(2);

        const result = createWithLines(params);
        expect(result.success).toBeFalsy();
        expect(result.errors).toEqual(expect.objectContaining({
          description: ['required'],
        }));

        const sequenceAfter = dataAccess.view('sequences', '2', {});
        expect(sequenceAfter.record.lastUsedNumber).toBe(2);

        const invoicesAfter = dataAccess.list('invoices', {});
        expect(invoicesAfter.total).toBe(2);

        const invoiceLinesAfter = dataAccess.list('invoice_lines', {});
        expect(invoiceLinesAfter.total).toBe(2);
      });
    });

    describe('previewInvoice', () => {
      test('success result', () => {
        const params = {
          invoiceConfigId: '1',
          tags: ['2', '3'],
          startTime: {
            startTime: '2023-03-01T00:00:00.000Z',
            endTime: '2023-03-31T23:59:59.999Z',
          },
        };

        const result = previewInvoice(params);

        expect(result.success).toBeTruthy();

        expect(result.record.invoice).toEqual(expect.objectContaining({
          invoiceNumber: 3,
          invoiceDate: new Date('2023-03-01T00:00:00.000Z'),
          dueDate: new Date('2023-03-31T00:00:00.000Z'),
          totalAmount: 1752.45,
          currencyId: '1',
          invoiceConfigId: '1',
          contactId: '2',
          includes: expect.objectContaining({
            currencyId: expect.objectContaining({
              1: expect.objectContaining({
                id: '1',
              }),
            }),
            invoiceConfigId: expect.objectContaining({
              1: expect.objectContaining({
                id: '1'
              }),
            }),
            contactId: expect.objectContaining({
              2: expect.objectContaining({
                id: '2',
              }),
            }),
          }),
        }));

        expect(result.record.invoiceLines).toEqual(expect.arrayContaining([
          expect.objectContaining({
            description: 'Implementation',
            unit: 'hour',
            unitCost: 105,
            unitValue: 9.85,
            subtotal: 1034.25,
          }),
          expect.objectContaining({
            description: 'Testing',
            unit: 'hour',
            unitCost: 95,
            unitValue: 7.56,
            subtotal: 718.2,
          }),
        ]));

        expect(result.record.invoiceConfig).toEqual(expect.objectContaining({
          id: '1',
        }));

        expect(result.record.invoiceNumberSequence).toEqual(expect.objectContaining({
          id: '2',
          lastUsedNumber: 2,
        }));

        expect(result.record.billingContact).toEqual(expect.objectContaining({
          id: '2',
        }));

        expect(result.record.invoiceTemplate).toEqual(expect.objectContaining({
          id: '1',
        }));

        expect(result.record.currency).toEqual(expect.objectContaining({
          id: '1',
        }));

        expect(result.record.country).toEqual(expect.objectContaining({
          alpha3Code: 'SGP',
        }));

        expect(result.record.logo).toEqual({});
      });
    });

    describe('viewTemplateData', () => {
      test('success result', () => {
        const result = viewTemplateData('1');

        expect(result.success).toBeTruthy();

        expect(result.record.invoice).toEqual(expect.objectContaining({
          id: '1',
          invoiceNumber: '1',
          invoiceDate: '2023-01-01',
          totalAmount: 234.23,
          invoiceConfigId: '1',
          currencyId: '1',
          contactId: '2',
        }));

        expect(result.record.invoiceLines).toEqual(expect.arrayContaining([
          expect.objectContaining({
            description: 'Implementation',
            unit: 'hour',
            unitCost: 105,
            unitValue: 5,
            subtotal: 525,
          }),
        ]));

        expect(result.record.invoiceConfig).toEqual(expect.objectContaining({
          id: '1',
        }));

        expect(result.record.invoiceNumberSequence).toEqual(expect.objectContaining({
          id: '2',
          lastUsedNumber: 2,
        }));

        expect(result.record.billingContact).toEqual(expect.objectContaining({
          id: '2',
        }));

        expect(result.record.invoiceTemplate).toEqual(expect.objectContaining({
          id: '1',
        }));

        expect(result.record.currency).toEqual(expect.objectContaining({
          id: '1',
        }));

        expect(result.record.country).toEqual(expect.objectContaining({
          alpha3Code: 'SGP',
        }));

        expect(result.record.logo).toEqual({});
      });

      test('failure result - not found', () => {
        const result = viewTemplateData('4');

        expect(result.success).toBeFalsy();
        expect(result.errors).toEqual(expect.objectContaining({
          id: ['notFound'],
        }));
      });
    });

    describe('voidInvoice', () => {
      test('success result', () => {
        const invoiceBefore = dataAccess.view('invoices', '1', {}).record;

        expect(invoiceBefore).toEqual(expect.objectContaining({
          id: '1',
          invoiceNumber: '1',
          invoiceDate: '2023-01-01',
          dueDate: '2023-01-31',
          totalAmount: 234.23,
          invoiceConfigId: '1',
          currencyId: '1',
          contactId: '2',
          voided: false,
        }));

        const result = voidInvoice('1');

        expect(result.success).toBeTruthy();

        expect(result.record).toEqual(expect.objectContaining({
          id: '1',
          invoiceNumber: '1',
          invoiceDate: '2023-01-01',
          dueDate: '2023-01-31',
          totalAmount: 234.23,
          invoiceConfigId: '1',
          currencyId: '1',
          contactId: '2',
          voided: true,
        }));
      });

      test('failure result - not found', () => {
        const result = voidInvoice('5');
        expect(result.success).toBeFalsy();
        expect(result.errors).toEqual(expect.objectContaining({
          id: ['notFound'],
        }));
      });

      test('failure result - is used', () => {
        const result = voidInvoice('2');
        expect(result.success).toBeFalsy();
        expect(result.errors).toEqual(expect.objectContaining({
          id: ['isUsed'],
        }));
      });
    });
  });
});
