import { setActivePinia, createPinia } from 'pinia';
import { useMemAccess } from '../../src/utils/memAccess.js';
import { useLogger } from '../../src/utils/logger.js';
import { default as utils } from '../../../lib/dist/utils.js';

const config = {
  schemas: '_schemas',
  indexes: '_indexes',
};
let logger;
let memAccess;

beforeEach(() => {
  setActivePinia(createPinia());

  logger = useLogger();
  memAccess = useMemAccess({ config, logger, utils });
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('useMemAccess', () => {
  test('should return functions', () => {
    expect(memAccess).toEqual(expect.objectContaining({
      initData: expect.anything(),
      write: expect.anything(),
    }));
  });
});

describe('initData', () => {
  test('when no existing data should init data in local storage', () => {
    localStorage.setItem(config.schemas, '{}');
    localStorage.setItem(config.indexes, '{}');

    memAccess.initData()
      .then((result) => {
        expect(result.schemas).toEqual(expect.objectContaining({
          countries: {
            fields: {
              alpha3Code: {
                type: 'text',
              },
              countryName: {
                type: 'text',
              },
            },
            constraints: {
              primary: ['alpha3Code'],
              foreign: {},
              unique: [],
              required: [],
            },
          },
        }));

        expect(JSON.parse(localStorage.getItem(config.schemas))).toEqual(expect.objectContaining({
          countries: {
            fields: {
              alpha3Code: {
                type: 'text',
              },
              countryName: {
                type: 'text',
              },
            },
            constraints: {
              primary: ['alpha3Code'],
              foreign: {},
              unique: [],
              required: [],
            },
          },
        }));

        expect(result.indexes).toEqual({
          unique: {},
          filter: {},
          foreign: {},
        });

        expect(result.data).toEqual(expect.arrayContaining([
          {
            modelClass: 'contacts',
            data: {
              1: expect.objectContaining({ id: '1', name: 'Your Company' }),
            },
          },
          {
            modelClass: 'countries',
            data: expect.objectContaining({
              AFG: expect.objectContaining({ countryName: 'Afghanistan', alpha3Code: 'AFG' }),
            }),
          },
          {
            modelClass: 'currencies',
            data: {
              1: expect.objectContaining({ id: '1', code: 'USD' }),
            },
          },
          {
            modelClass: 'system_configs',
            data: {
              1: expect.objectContaining({ id: '1', tagFormat: '{{ category }}:{{ name }}', timezone: 'UTC' }),
            },
          },
          {
            modelClass: 'alerts',
            data: {},
          },
          {
            modelClass: 'billing_configs',
            data: {},
          },
          {
            modelClass: 'chart_configs',
            data: {},
          },
          {
            modelClass: 'documents',
            data: {},
          },
          {
            modelClass: 'invoices',
            data: {},
          },
          {
            modelClass: 'invoice_configs',
            data: {},
          },
          {
            modelClass: 'invoice_lines',
            data: {},
          },
          {
            modelClass: 'invoice_templates',
            data: {},
          },
          {
            modelClass: 'income_receipts',
            data: {},
          },
          {
            modelClass: 'receipt_configs',
            data: {},
          },
          {
            modelClass: 'receipt_templates',
            data: {},
          },
          {
            modelClass: 'sequences',
            data: {},
          },
          {
            modelClass: 'tags',
            data: {},
          },
          {
            modelClass: 'tax_deductibles',
            data: {},
          },
          {
            modelClass: 'tax_tables',
            data: {},
          },
          {
            modelClass: 'tax_tiers',
            data: {},
          },
          {
            modelClass: 'transactions',
            data: {},
          },
          {
            modelClass: 'work_logs',
            data: {},
          },
        ]));
      });
  });

  test('when has existing data should init data from local storage', () => {
    localStorage.setItem(config.schemas, '{}');
    localStorage.setItem(config.indexes, JSON.stringify({
      unique: {
        tags: {
          'category|name': {
            'company|company-abc': '1',
            'company|company-xyz': '2',
          },
        },
      },
      foreign: {},
      filter: {
        tags: {
          category: {
            company: ['1', '2'],
          },
        },
      },
    }));

    localStorage.setItem('data', JSON.stringify({
      tags: {
        1: { id: '1', category: 'company', name: 'company-abc' },
        2: { id: '2', category: 'company', name: 'company-xyz' },
      },
    }));

    memAccess.initData()
      .then((result) => {
        expect(result.indexes).toEqual({
          unique: {
            tags: {
              'category|name': {
                'company|company-abc': '1',
                'company|company-xyz': '2',
              },
            },
          },
          foreign: {},
          filter: {
            tags: {
              category: {
                company: ['1', '2'],
              },
            },
          },
        });

        expect(result.data).toEqual(expect.arrayContaining([
          {
            modelClass: 'contacts',
            data: {
              1: expect.objectContaining({ id: '1', name: 'Your Company' }),
            },
          },
          {
            modelClass: 'countries',
            data: expect.objectContaining({
              AFG: expect.objectContaining({ countryName: 'Afghanistan', alpha3Code: 'AFG' }),
            }),
          },
          {
            modelClass: 'currencies',
            data: {
              1: expect.objectContaining({ id: '1', code: 'USD' }),
            },
          },
          {
            modelClass: 'system_configs',
            data: {
              1: expect.objectContaining({ id: '1', tagFormat: '{{ category }}:{{ name }}', timezone: 'UTC' }),
            },
          },
          {
            modelClass: 'alerts',
            data: {},
          },
          {
            modelClass: 'billing_configs',
            data: {},
          },
          {
            modelClass: 'chart_configs',
            data: {},
          },
          {
            modelClass: 'documents',
            data: {},
          },
          {
            modelClass: 'invoices',
            data: {},
          },
          {
            modelClass: 'invoice_configs',
            data: {},
          },
          {
            modelClass: 'invoice_lines',
            data: {},
          },
          {
            modelClass: 'invoice_templates',
            data: {},
          },
          {
            modelClass: 'income_receipts',
            data: {},
          },
          {
            modelClass: 'receipt_configs',
            data: {},
          },
          {
            modelClass: 'receipt_templates',
            data: {},
          },
          {
            modelClass: 'sequences',
            data: {},
          },
          {
            modelClass: 'tags',
            data: {
              1: { id: '1', category: 'company', name: 'company-abc' },
              2: { id: '2', category: 'company', name: 'company-xyz' },
            },
          },
          {
            modelClass: 'tax_deductibles',
            data: {},
          },
          {
            modelClass: 'tax_tables',
            data: {},
          },
          {
            modelClass: 'tax_tiers',
            data: {},
          },
          {
            modelClass: 'transactions',
            data: {},
          },
          {
            modelClass: 'work_logs',
            data: {},
          },
        ]));
      });
  });
});

describe('write', () => {
  test('when modelClass is indexes should write to indexes storage', () => {
    localStorage.setItem('data', '{}');
    localStorage.setItem(config.indexes, '{}');
    expect(JSON.parse(localStorage.getItem('data'))).toEqual({});
    expect(JSON.parse(localStorage.getItem(config.indexes))).toEqual({});

    memAccess.write('indexes', {
      unique: {
        tags: {
          'category|name': {
            'company|company-abc': '1',
            'company|company-xyz': '2',
          },
        },
      },
      foreign: {},
      filter: {
        tags: {
          category: {
            company: ['1', '2'],
          },
        },
      },
    });

    expect(JSON.parse(localStorage.getItem('data'))).toEqual({});
    expect(JSON.parse(localStorage.getItem(config.indexes))).toEqual({
      unique: {
        tags: {
          'category|name': {
            'company|company-abc': '1',
            'company|company-xyz': '2',
          },
        },
      },
      foreign: {},
      filter: {
        tags: {
          category: {
            company: ['1', '2'],
          },
        },
      },
    });
  });

  test('when modelClass is schema should write to data storage', () => {
    localStorage.setItem('data', '{}');
    localStorage.setItem(config.indexes, '{}');
    expect(JSON.parse(localStorage.getItem('data'))).toEqual({});
    expect(JSON.parse(localStorage.getItem(config.indexes))).toEqual({});

    memAccess.write('tags', {
      1: { id: '1', category: 'company', name: 'company-abc' },
      2: { id: '2', category: 'company', name: 'company-xyz' },
    });

    expect(JSON.parse(localStorage.getItem('data'))).toEqual({
      tags: {
        1: { id: '1', category: 'company', name: 'company-abc' },
        2: { id: '2', category: 'company', name: 'company-xyz' },
      },
    });
    expect(JSON.parse(localStorage.getItem(config.indexes))).toEqual({});
  });
});
