const path = require('path');

const config = {};
const logger = {
  log: () => {},
  error: () => {},
};

const utils = require('../../src/utils.js');

const initDir = path.join(__dirname, '../../../_init');
const initSchemas = require(path.join(initDir, 'schemas.json'));
const fixtures = require('../__fixtures__/income_receipts.js');

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
  createWithTransaction,
  previewReceipt,
  viewTemplateData,
} = require('../../src/income_receipts/stores.js')({ dataAccess, logger, utils });

beforeEach(async() => {
  jest
    .useFakeTimers()
    .setSystemTime(new Date('2023-04-01T00:00:00Z'));

  await dataAccess.initData(true);
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('income_receipts store', () => {
  describe('default methods', () => {
    test('modelClass', () => {
      expect(modelClass).toBe('income_receipts');
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
        receiptNumber: '1',
        receiptDate: '2023-01-01',
        billableAmount: 234.23,
        paidAmount: 0,
        paymentAmount: 234.23,
        remainingAmount: 0,
        customFields: {},
        voided: false,
        currencyId: '1',
        incomeTransactionId: '1',
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
    describe('createWithTransaction', () => {
      test('success result', async() => {
        const params1 = {
          receipt: {
            receiptDate: '2023-04-01',
            billableAmount: 234.23,
            paidAmount: 175.65,
            paymentAmount: 58.58,
            remainingAmount: 0,
            customFields: {},
            voided: false,
            currencyId: '1',
            contactId: '2',
            invoiceId: '1',
          },
          incomeReceiptConfigId: '1',
        };

        const result1 = createWithTransaction(params1);
        expect(result1.errors).toBe();
        expect(result1.success).toBeTruthy();

        expect(result1.record).toEqual(expect.objectContaining({
          id: '4',
          receiptNumber: '4',
          receiptDate: '2023-04-01',
          billableAmount: 234.23,
          paidAmount: 175.65,
          paymentAmount: 58.58,
          remainingAmount: 0,
          incomeReceiptConfigId: '1',
          invoiceId: '1',
          currencyId: '1',
          contactId: '2',
        }));

        expect(result1.record.transaction).toEqual(expect.objectContaining({
          id: '4',
          type: 'income',
          transactionDate: '2023-04-01',
          description: 'Income from Receipt 4',
          amount: 58.58,
          homeCurrencyAmount: 58.58,
          currencyId: '1',
        }));

        const params2 = {
          receipt: {
            receiptDate: '2023-04-01',
            billableAmount: 289.12,
            paidAmount: 0,
            paymentAmount: 289.12,
            remainingAmount: 0,
            customFields: {},
            voided: false,
            currencyId: '2',
            contactId: '2',
            invoiceId: '2',
          },
          incomeReceiptConfigId: '1',
        };

        const result2 = createWithTransaction(params2);
        expect(result2.success).toBeTruthy();

        expect(result2.record).toEqual(expect.objectContaining({
          id: '5',
          receiptNumber: '5',
          receiptDate: '2023-04-01',
          billableAmount: 289.12,
          paidAmount: 0,
          paymentAmount: 289.12,
          remainingAmount: 0,
          incomeReceiptConfigId: '1',
          invoiceId: '2',
          currencyId: '2',
          contactId: '2',
        }));

        expect(result2.record.transaction).toEqual(expect.objectContaining({
          id: '5',
          type: 'income',
          transactionDate: '2023-04-01',
          description: 'Income from Receipt 5',
          amount: 289.12,
          homeCurrencyAmount: 385.49,
          currencyId: '2',
        }));

        const updatedSequenceNumber = dataAccess.view('sequences', '1', {});
        expect(updatedSequenceNumber.record.lastUsedNumber).toBe(5);
      });
    });

    describe('previewReceipt', () => {
      test('success result', () => {
        const params = {
          invoiceId: '1',
          receiptConfigId: '1',
        };

        const result = previewReceipt(params);
        expect(result.success).toBeTruthy();

        expect(result.record.receipt).toEqual(expect.objectContaining({
          receiptNumber: 4,
          receiptDate: new Date('2023-04-01T00:00:00Z'),
          billableAmount: 234.23,
          paidAmount: 175.65,
          paymentAmount: 0,
          remainingAmount: 58.58,
          incomeReceiptConfigId: '1',
          invoiceId: '1',
          currencyId: '1',
          contactId: '2',
        }));

        expect(result.record.invoice).toEqual(expect.objectContaining({
          id: '1',
          totalAmount: 234.23,
          invoiceConfigId: '1',
          currencyId: '1',
          contactId: '2',
        }));

        expect(result.record.currency).toEqual(expect.objectContaining({
          id: '1',
          code: 'SGD',
          symbol: '$',
          exchangeRate: 1,
        }));

        expect(result.record.logo).toBeUndefined();

        expect(result.record.billingContact).toEqual(expect.objectContaining({
          id: '2',
          name: 'Company ABC',
          country: 'SGP',
          logo: null,
        }));

        expect(result.record.receiptConfig).toEqual(expect.objectContaining({
          id: '1',
          receiptNumberSequenceId: '1',
          billingContactId: '2',
          receiptTemplateId: '2',
        }));

        expect(result.record.receiptNumberSequence).toEqual(expect.objectContaining({
          id: '1',
          name: 'Company ABC Receipt Sequence',
          prefix: 'REC',
          startingNumber: 0,
          lastUsedNumber: 3,
          suffix: 'ABC',
          incrementStep: 1,
        }));

        expect(result.record.receiptTemplate).toEqual(expect.objectContaining({
          id: '2',
          description: 'Receipt Template',
        }));

        expect(result.record.invoiceNumberSequence).toEqual(expect.objectContaining({
          id: '2',
          name: 'Company ABC Invoice Sequence',
          prefix: 'INV',
          startingNumber: 0,
          lastUsedNumber: 1,
          suffix: 'ABC',
          incrementStep: 1,
        }));
      });
    });

    describe('viewTemplateData', () => {
      test('success result', () => {
        const id = '1';
        const result = viewTemplateData(id);
        expect(result.success).toBeTruthy();

        expect(result.record.receipt).toEqual(expect.objectContaining({
          id: '1',
          receiptNumber: '1',
          receiptDate: '2023-01-01',
          billableAmount: 234.23,
          paidAmount: 0,
          paymentAmount: 58.55,
          remainingAmount: 175.68,
          customFields: {},
          voided: false,
          currencyId: '1',
          incomeTransactionId: '1',
          contactId: '2',
          incomeReceiptConfigId: '1',
          invoiceId: '1',
        }));

        expect(result.record.invoice).toEqual(expect.objectContaining({
          id: '1',
          totalAmount: 234.23,
          invoiceConfigId: '1',
          currencyId: '1',
          contactId: '2',
        }));

        expect(result.record.currency).toEqual(expect.objectContaining({
          id: '1',
          code: 'SGD',
          symbol: '$',
          exchangeRate: 1,
        }));

        expect(result.record.transaction).toEqual(expect.objectContaining({
          id: '1',
          type: 'income',
          transactionDate: '2023-01-01',
          description: 'Income from Company ABC',
          amount: 58.55,
          homeCurrencyAmount: 58.55,
          currencyId: '1',
        }));

        expect(result.record.billingContact).toEqual(expect.objectContaining({
          id: '2',
          name: 'Company ABC',
          country: 'SGP',
          logo: null,
        }));

        expect(result.record.country).toEqual(expect.objectContaining({
          countryName: 'Singapore',
          alpha3Code: 'SGP',
        }));

        expect(result.record.logo).toBeUndefined();

        expect(result.record.receiptConfig).toEqual(expect.objectContaining({
          id: '1',
          receiptNumberSequenceId: '1',
          billingContactId: '2',
          receiptTemplateId: '2',
        }));

        expect(result.record.receiptNumberSequence).toEqual(expect.objectContaining({
          id: '1',
          name: 'Company ABC Receipt Sequence',
          prefix: 'REC',
          startingNumber: 0,
          lastUsedNumber: 3,
          suffix: 'ABC',
          incrementStep: 1,
        }));

        expect(result.record.receiptTemplate).toEqual(expect.objectContaining({
          id: '2',
          description: 'Receipt Template',
        }));

        expect(result.record.invoiceNumberSequence).toEqual(expect.objectContaining({
          id: '2',
          name: 'Company ABC Invoice Sequence',
          prefix: 'INV',
          startingNumber: 0,
          lastUsedNumber: 1,
          suffix: 'ABC',
          incrementStep: 1,
        }));
      });
    });
  });
});
