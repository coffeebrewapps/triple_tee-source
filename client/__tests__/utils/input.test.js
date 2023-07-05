import { setActivePinia, createPinia } from 'pinia';
import { useInputHelper } from '../../src/utils/input.js';

vi.mock('../../src/utils/dataAccess.js', () => {
  return {
    useDataAccess: () => {
      return {
        view: (modelClass, id, params) => {
          return new Promise((resolve, reject) => {
            if (modelClass === 'tags') {
              if (id === '1') {
                resolve({ id: '1', category: 'company', name: 'abc' });
              } else {
                resolve({ id: '2', category: 'company', name: 'xyz' });
              }
            } else if (modelClass === 'currencies') {
              if (id === '1') {
                resolve({ id: '1', code: 'USD' });
              } else {
                resolve({ id: '2', code: 'SGD' });
              }
            } else if (modelClass === 'documents') {
              if (id === '1') {
                resolve({
                  id: '1',
                  rawData: 'asdfasdfasdf',
                  filename: 'logo.png',
                  mimeType: 'image/png',
                });
              } else if (id === '2') {
                resolve({
                  id: '2',
                  rawData: 'asdfasdfasdf',
                  filename: 'invalid.png',
                  mimeType: 'image/png',
                });
              } else {
                reject(new Error('notFound'));
              }
            } else {
              resolve({});
            }
          });
        },
        list: (modelClass, pagination) => {
          return new Promise((resolve, reject) => {
            if (modelClass === 'tags') {
              resolve({
                total: 2,
                data: [
                  { id: '1', category: 'company', name: 'abc' },
                  { id: '2', category: 'company', name: 'xyz' },
                ],
              });
            } else {
              resolve({
                total: 0,
                data: [],
              });
            }
          });
        },
      };
    },
  };
});

vi.mock('../../src/utils/file.js', () => {
  return {
    useFileUtils: () => {
      return {
        base64ToFile: (rawData, filename, mimeType) => {
          return new Promise((resolve, reject) => {
            if (filename === 'logo.png') {
              resolve(`fakeFile-${filename}-${rawData}-${mimeType}`);
            } else {
              reject(new Error('invalid'));
            }
          });
        },
      };
    },
  };
});

function recordValue(record) {
  return record.id;
}

function tagLabel(record) {
  return `${record.category}:${record.name}`;
}

function currencyLabel(record) {
  return record.code;
}

const schemas = [
  {
    key: 'id',
    type: 'text',
    label: 'ID',
    listable: true,
    viewable: true,
    creatable: false,
    updatable: false,
    sortable: true,
  },
  {
    key: 'category',
    type: 'text',
    label: 'Category',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: false,
    filterable: true,
    sortable: true,
  },
  {
    key: 'startingNumber',
    type: 'number',
    label: 'Starting Number',
    listable: false,
    viewable: true,
    creatable: true,
    updatable: false,
    defaultValue: () => { return 1; },
  },
  {
    key: 'description',
    type: 'textarea',
    label: 'Description',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: false,
    sortable: false,
  },
  {
    key: 'textColor',
    type: 'text',
    label: 'Text Color',
    listable: false,
    viewable: true,
    creatable: true,
    updatable: true,
  },
  {
    key: 'image',
    type: 'file',
    label: 'Image',
    listable: false,
    viewable: true,
    creatable: true,
    updatable: true,
    file: {
      modelClass: 'documents',
      type: 'img',
      label: (record) => { return record.filename; },
      value: (record) => { return record.rawData; },
    },
  },
  {
    key: 'scale',
    type: 'enum',
    label: 'Scale',
    listable: false,
    viewable: true,
    creatable: true,
    updatable: false,
  },
  {
    key: 'transactionType',
    type: 'select',
    label: 'Transaction Type',
    listable: false,
    viewable: true,
    creatable: true,
    updatable: false,
    options: [
      { value: 'income', label: 'Income' },
      { value: 'incomeReversal', label: 'Income Reversal' },
      { value: 'expense', label: 'Income' },
      { value: 'expenseReversal', label: 'Income Reversal' },
    ],
  },
  {
    key: 'tags',
    type: 'multiSelect',
    label: 'Tags',
    isTags: true,
    reference: { label: tagLabel },
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: true,
    options: {
      server: true,
      pagination: true,
      modelClass: 'tags',
      value: recordValue,
      label: tagLabel,
    },
  },
  {
    key: 'includeTags',
    type: 'multiSelect',
    label: 'Include Tags',
    isTags: true,
    reference: { label: tagLabel },
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: true,
    options: {
      server: true,
      pagination: true,
      modelClass: 'tags',
      value: recordValue,
      label: tagLabel,
    },
  },
  {
    key: 'currencyId',
    type: 'singleSelect',
    label: 'Currency',
    reference: { label: currencyLabel },
    listable: false,
    viewable: true,
    creatable: true,
    updatable: false,
    filterable: true,
    options: {
      server: true,
      pagination: true,
      modelClass: 'currencies',
      value: recordValue,
      label: currencyLabel,
    },
  },
  {
    key: 'startDate',
    type: 'date',
    label: 'Start Date',
    listable: false,
    viewable: true,
    creatable: true,
    updatable: false,
  },
  {
    key: 'endDate',
    type: 'date',
    label: 'End Date',
    listable: false,
    viewable: true,
    creatable: true,
    updatable: true,
    nullToggleable: true,
  },
  {
    key: 'customFields',
    type: 'object',
    label: 'Custom Fields',
    listable: false,
    viewable: true,
    creatable: true,
    updatable: true,
  },
  {
    key: 'createdAt',
    type: 'datetime',
    label: 'Created At',
    listable: false,
    viewable: false,
    creatable: false,
    updatable: false,
    filterable: true,
  },
];

let helper;

beforeEach(() => {
  setActivePinia(createPinia());

  vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
    resolvedOptions: () => ({
      locale: 'en-SG',
    }),
  }));

  helper = useInputHelper(schemas);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('schemasMap', () => {
  test('should return schemas in map', () => {
    expect(helper.schemasMap.value).toEqual({
      id: {
        key: 'id',
        type: 'text',
        label: 'ID',
        listable: true,
        viewable: true,
        creatable: false,
        updatable: false,
        sortable: true,
      },
      category: {
        key: 'category',
        type: 'text',
        label: 'Category',
        listable: true,
        viewable: true,
        creatable: true,
        updatable: false,
        filterable: true,
        sortable: true,
      },
      startingNumber: {
        key: 'startingNumber',
        type: 'number',
        label: 'Starting Number',
        listable: false,
        viewable: true,
        creatable: true,
        updatable: false,
        defaultValue: expect.anything(),
      },
      description: {
        key: 'description',
        type: 'textarea',
        label: 'Description',
        listable: true,
        viewable: true,
        creatable: true,
        updatable: true,
        filterable: false,
        sortable: false,
      },
      textColor: {
        key: 'textColor',
        type: 'text',
        label: 'Text Color',
        listable: false,
        viewable: true,
        creatable: true,
        updatable: true,
      },
      image: {
        key: 'image',
        type: 'file',
        label: 'Image',
        listable: false,
        viewable: true,
        creatable: true,
        updatable: true,
        file: {
          modelClass: 'documents',
          type: 'img',
          label: expect.anything(),
          value: expect.anything(),
        },
      },
      scale: {
        key: 'scale',
        type: 'enum',
        label: 'Scale',
        listable: false,
        viewable: true,
        creatable: true,
        updatable: false,
      },
      transactionType: {
        key: 'transactionType',
        type: 'select',
        label: 'Transaction Type',
        listable: false,
        viewable: true,
        creatable: true,
        updatable: false,
        options: [
          { value: 'income', label: 'Income' },
          { value: 'incomeReversal', label: 'Income Reversal' },
          { value: 'expense', label: 'Income' },
          { value: 'expenseReversal', label: 'Income Reversal' },
        ],
      },
      tags: {
        key: 'tags',
        type: 'multiSelect',
        label: 'Tags',
        isTags: true,
        reference: { label: expect.anything() },
        listable: true,
        viewable: true,
        creatable: true,
        updatable: true,
        filterable: true,
        options: {
          server: true,
          pagination: true,
          modelClass: 'tags',
          value: expect.anything(),
          label: expect.anything(),
        },
      },
      includeTags: {
        key: 'includeTags',
        type: 'multiSelect',
        label: 'Include Tags',
        isTags: true,
        reference: { label: expect.anything() },
        listable: true,
        viewable: true,
        creatable: true,
        updatable: true,
        filterable: true,
        options: {
          server: true,
          pagination: true,
          modelClass: 'tags',
          value: expect.anything(),
          label: expect.anything(),
        },
      },
      currencyId: {
        key: 'currencyId',
        type: 'singleSelect',
        label: 'Currency',
        reference: { label: expect.anything() },
        listable: false,
        viewable: true,
        creatable: true,
        updatable: false,
        filterable: true,
        options: {
          server: true,
          pagination: true,
          modelClass: 'currencies',
          value: expect.anything(),
          label: expect.anything(),
        },
      },
      startDate: {
        key: 'startDate',
        type: 'date',
        label: 'Start Date',
        listable: false,
        viewable: true,
        creatable: true,
        updatable: false,
      },
      endDate: {
        key: 'endDate',
        type: 'date',
        label: 'End Date',
        listable: false,
        viewable: true,
        creatable: true,
        updatable: true,
        nullToggleable: true,
      },
      customFields: {
        key: 'customFields',
        type: 'object',
        label: 'Custom Fields',
        listable: false,
        viewable: true,
        creatable: true,
        updatable: true,
      },
      createdAt: {
        key: 'createdAt',
        type: 'datetime',
        label: 'Created At',
        listable: false,
        viewable: false,
        creatable: false,
        updatable: false,
        filterable: true,
      },
    });
  });
});

describe('listableFields', () => {
  test('should return listable fields', () => {
    expect(helper.listableFields.value).toEqual([
      expect.objectContaining({
        key: 'id',
      }),
      expect.objectContaining({
        key: 'category',
      }),
      expect.objectContaining({
        key: 'description',
      }),
      expect.objectContaining({
        key: 'tags',
      }),
      expect.objectContaining({
        key: 'includeTags',
      }),
    ]);
  });
});

describe('listableKeys', () => {
  test('should return listable keys', () => {
    expect(helper.listableKeys.value).toEqual([
      'id',
      'category',
      'description',
      'tags',
      'includeTags',
    ]);
  });
});

describe('viewableFields', () => {
  test('should return viewable fields', () => {
    expect(helper.viewableFields.value).toEqual([
      expect.objectContaining({
        key: 'id',
      }),
      expect.objectContaining({
        key: 'category',
      }),
      expect.objectContaining({
        key: 'startingNumber',
      }),
      expect.objectContaining({
        key: 'description',
      }),
      expect.objectContaining({
        key: 'textColor',
      }),
      expect.objectContaining({
        key: 'image',
      }),
      expect.objectContaining({
        key: 'scale',
      }),
      expect.objectContaining({
        key: 'transactionType',
      }),
      expect.objectContaining({
        key: 'tags',
      }),
      expect.objectContaining({
        key: 'includeTags',
      }),
      expect.objectContaining({
        key: 'currencyId',
      }),
      expect.objectContaining({
        key: 'startDate',
      }),
      expect.objectContaining({
        key: 'endDate',
      }),
      expect.objectContaining({
        key: 'customFields',
      }),
    ]);
  });
});

describe('viewableKeys', () => {
  test('should return viewable keys', () => {
    expect(helper.viewableKeys.value).toEqual([
      'id',
      'category',
      'startingNumber',
      'description',
      'textColor',
      'image',
      'scale',
      'transactionType',
      'tags',
      'includeTags',
      'currencyId',
      'startDate',
      'endDate',
      'customFields',
    ]);
  });
});

describe('creatableFields', () => {
  test('should return creatable fields', () => {
    expect(helper.creatableFields.value).toEqual([
      expect.objectContaining({
        key: 'category',
      }),
      expect.objectContaining({
        key: 'startingNumber',
      }),
      expect.objectContaining({
        key: 'description',
      }),
      expect.objectContaining({
        key: 'textColor',
      }),
      expect.objectContaining({
        key: 'image',
      }),
      expect.objectContaining({
        key: 'scale',
      }),
      expect.objectContaining({
        key: 'transactionType',
      }),
      expect.objectContaining({
        key: 'tags',
      }),
      expect.objectContaining({
        key: 'includeTags',
      }),
      expect.objectContaining({
        key: 'currencyId',
      }),
      expect.objectContaining({
        key: 'startDate',
      }),
      expect.objectContaining({
        key: 'endDate',
      }),
      expect.objectContaining({
        key: 'customFields',
      }),
    ]);
  });
});

describe('creatableKeys', () => {
  test('should return creatable keys', () => {
    expect(helper.creatableKeys.value).toEqual([
      'category',
      'startingNumber',
      'description',
      'textColor',
      'image',
      'scale',
      'transactionType',
      'tags',
      'includeTags',
      'currencyId',
      'startDate',
      'endDate',
      'customFields',
    ]);
  });
});

describe('updatableFields', () => {
  test('should return updatable fields', () => {
    expect(helper.updatableFields.value).toEqual([
      expect.objectContaining({
        key: 'description',
      }),
      expect.objectContaining({
        key: 'textColor',
      }),
      expect.objectContaining({
        key: 'image',
      }),
      expect.objectContaining({
        key: 'tags',
      }),
      expect.objectContaining({
        key: 'includeTags',
      }),
      expect.objectContaining({
        key: 'endDate',
      }),
      expect.objectContaining({
        key: 'customFields',
      }),
    ]);
  });
});

describe('updatableKeys', () => {
  test('should return updatable keys', () => {
    expect(helper.updatableKeys.value).toEqual([
      'description',
      'textColor',
      'image',
      'tags',
      'includeTags',
      'endDate',
      'customFields',
    ]);
  });
});

describe('sortableFields', () => {
  test('should return sortable fields', () => {
    expect(helper.sortableFields.value).toEqual([
      expect.objectContaining({
        key: 'id',
      }),
      expect.objectContaining({
        key: 'category',
      }),
    ]);
  });
});

describe('sortableKeys', () => {
  test('should return sortable keys', () => {
    expect(helper.sortableKeys.value).toEqual([
      'id',
      'category',
    ]);
  });
});

describe('multipartData', () => {
  test('should return true', () => {
    expect(helper.multipartData.value).toBeTruthy();
  });
});

describe('clientOptionsKeys', () => {
  test('should return enum and select keys', () => {
    expect(helper.clientOptionsKeys.value).toEqual([
      'scale',
      'transactionType',
    ]);
  });
});

describe('clientOptionsField', () => {
  test('when enum field should return true', () => {
    expect(helper.clientOptionsField('scale')).toBeTruthy();
  });

  test('when select field should return true', () => {
    expect(helper.clientOptionsField('transactionType')).toBeTruthy();
  });

  test('when text field should return false', () => {
    expect(helper.clientOptionsField('category')).toBeFalsy();
  });

  test('when number field should return false', () => {
    expect(helper.clientOptionsField('startingNumber')).toBeFalsy();
  });

  test('when textarea field should return false', () => {
    expect(helper.clientOptionsField('description')).toBeFalsy();
  });

  test('when object field should return false', () => {
    expect(helper.clientOptionsField('customFields')).toBeFalsy();
  });

  test('when singleSelect field should return false', () => {
    expect(helper.clientOptionsField('currencyId')).toBeFalsy();
  });

  test('when multiSelect field should return false', () => {
    expect(helper.clientOptionsField('includeTags')).toBeFalsy();
  });

  test('when file field should return false', () => {
    expect(helper.clientOptionsField('image')).toBeFalsy();
  });
});

describe('serverOptionsKeys', () => {
  test('should return singleSelect and multiSelect keys', () => {
    expect(helper.serverOptionsKeys.value).toEqual([
      'tags',
      'includeTags',
      'currencyId',
    ]);
  });
});

describe('serverOptionsField', () => {
  test('when singleSelect field should return true', () => {
    expect(helper.serverOptionsField('currencyId')).toBeTruthy();
  });

  test('when multiSelect field should return true', () => {
    expect(helper.serverOptionsField('includeTags')).toBeTruthy();
  });

  test('when enum field should return false', () => {
    expect(helper.serverOptionsField('scale')).toBeFalsy();
  });

  test('when select field should return false', () => {
    expect(helper.serverOptionsField('transactionType')).toBeFalsy();
  });

  test('when text field should return false', () => {
    expect(helper.serverOptionsField('category')).toBeFalsy();
  });

  test('when number field should return false', () => {
    expect(helper.serverOptionsField('startingNumber')).toBeFalsy();
  });

  test('when textarea field should return false', () => {
    expect(helper.serverOptionsField('description')).toBeFalsy();
  });

  test('when object field should return false', () => {
    expect(helper.serverOptionsField('customFields')).toBeFalsy();
  });

  test('when file field should return false', () => {
    expect(helper.serverOptionsField('image')).toBeFalsy();
  });
});

describe('selectableKeys', () => {
  test('should return enum, select, singleSelect and multiSelect keys', () => {
    expect(helper.selectableKeys.value).toEqual([
      'scale',
      'transactionType',
      'tags',
      'includeTags',
      'currencyId',
    ]);
  });
});

describe('multiSelectableKeys', () => {
  test('should return multiSelect keys', () => {
    expect(helper.multiSelectableKeys.value).toEqual([
      'tags',
      'includeTags',
    ]);
  });
});

describe('singleSelectableKeys', () => {
  test('should return singleSelect keys', () => {
    expect(helper.singleSelectableKeys.value).toEqual([
      'currencyId',
    ]);
  });
});

describe('inputType', () => {
  test('when key found should return type', () => {
    expect(helper.inputType('scale')).toBe('enum');
  });

  test('when key not found should return undefined', () => {
    expect(helper.inputType('invalid')).toBeUndefined();
  });
});

describe('inputLabel', () => {
  test('when key found should return label', () => {
    expect(helper.inputLabel('scale')).toBe('Scale');
  });

  test('when key not found should return undefined', () => {
    expect(helper.inputLabel('invalid')).toBeUndefined();
  });
});

describe('inputValue', () => {
  test('when single selectable reference field should return formatted label', () => {
    const field = 'currencyId';
    const record = {
      currencyId: '1',
      includes: {
        currencyId: {
          1: { id: '1', code: 'USD' },
          2: { id: '2', code: 'SGD' },
        },
      },
    };
    const includeKeys = ['currencyId'];
    const systemConfigs = {};

    const result = helper.inputValue(field, record, includeKeys, schemas, systemConfigs);
    expect(result).toBe('USD');
  });

  test('when multi selectable reference field should return formatted label', () => {
    const field = 'tags';
    const record = {
      tags: ['1', '2'],
      includes: {
        tags: {
          1: { id: '1', category: 'company', name: 'abc' },
          2: { id: '2', category: 'company', name: 'xyz' },
        },
      },
    };
    const includeKeys = ['tags'];
    const systemConfigs = {};

    const result = helper.inputValue(field, record, includeKeys, schemas, systemConfigs);
    expect(result).toEqual(['company:abc', 'company:xyz']);
  });

  test('when reference field but no foreign value should return field value as-is', () => {
    const field = 'includeTags';
    const record = {
      includeTags: ['1', '2'],
      includes: {
        includeTags: {},
      },
    };
    const includeKeys = ['includeTags'];
    const systemConfigs = {};

    const result = helper.inputValue(field, record, includeKeys, schemas, systemConfigs);
    expect(result).toEqual(['1', '2']);
  });

  test('when reference field but no includes should return field value as-is', () => {
    const field = 'includeTags';
    const record = {
      includeTags: ['1', '2'],
      includes: {},
    };
    const includeKeys = ['includeTags'];
    const systemConfigs = {};

    const result = helper.inputValue(field, record, includeKeys, schemas, systemConfigs);
    expect(result).toEqual(['1', '2']);
  });

  test('when enum field should return formatted label', () => {
    const field = 'scale';
    const record = { scale: 'hour' };
    const includeKeys = [];
    const systemConfigs = {};
    const combinedSchemas = helper.formatDataFields({
      scale: {
        enums: {
          hour: 'Hour',
          minute: 'Minute',
          second: 'Second',
        },
      },
    });

    const result = helper.inputValue(field, record, includeKeys, combinedSchemas, systemConfigs);
    expect(result).toBe('Hour');
  });

  test('when select field should return formatted label', () => {
    const field = 'transactionType';
    const record = { transactionType: 'income' };
    const includeKeys = [];
    const systemConfigs = {};

    const result = helper.inputValue(field, record, includeKeys, schemas, systemConfigs);
    expect(result).toBe('Income');
  });

  test('when datetime field should return formatted timestamp', () => {
    const field = 'createdAt';
    const record = { createdAt: '2023-05-21T12:34:56.123Z' };
    const includeKeys = [];
    const systemConfigs = { timezone: 'Asia/Singapore' };

    const result = helper.inputValue(field, record, includeKeys, schemas, systemConfigs);
    expect(result).toBe('21/05/2023, 8:34:56 pm');
  });

  test('when date field should return formatted date', () => {
    const field = 'startDate';
    const record = { startDate: '2023-05-21' };
    const includeKeys = [];
    const systemConfigs = { timezone: 'Asia/Singapore' };

    const result = helper.inputValue(field, record, includeKeys, schemas, systemConfigs);
    expect(result).toBe('21/05/2023');
  });

  test('when file field should return file raw data', () => {
    const field = 'image';
    const record = {
      image: '1',
      includes: {
        image: {
          1: { id: '1', rawData: 'data:image/png;base64,asdfasfafsadf' },
          2: { id: '2', rawData: 'data:image/png;base64,qweqweqweqweq' },
        },
      },
    };
    const includeKeys = ['image'];
    const systemConfigs = {};

    const result = helper.inputValue(field, record, includeKeys, schemas, systemConfigs);
    expect(result).toBe('data:image/png;base64,asdfasfafsadf');
  });

  test('when file field but no includes should return undefined', () => {
    const field = 'image';
    const record = {
      image: '1',
      includes: {},
    };
    const includeKeys = ['image'];
    const systemConfigs = {};

    const result = helper.inputValue(field, record, includeKeys, schemas, systemConfigs);
    expect(result).toBeUndefined();
  });

  test('when file field but no foreign value should return undefined', () => {
    const field = 'image';
    const record = {
      image: '1',
      includes: {
        image: {
        },
      },
    };
    const includeKeys = ['image'];
    const systemConfigs = {};

    const result = helper.inputValue(field, record, includeKeys, schemas, systemConfigs);
    expect(result).toBeUndefined();
  });

  test('when input field should return field value as-is', () => {
    const field = 'description';
    const record = { description: 'Implementation' };
    const includeKeys = [];
    const systemConfigs = {};

    const result = helper.inputValue(field, record, includeKeys, schemas, systemConfigs);
    expect(result).toBe('Implementation');
  });

  test('when field value is empty should return undefined', () => {
    const field = 'category';
    const record = {};
    const includeKeys = [];
    const systemConfigs = {};

    const result = helper.inputValue(field, record, includeKeys, schemas, systemConfigs);
    expect(result).toBeUndefined();
  });
});

describe('inputableField', () => {
  test('when text field should return true', () => {
    expect(helper.inputableField('category')).toBeTruthy();
  });

  test('when number field should return true', () => {
    expect(helper.inputableField('startingNumber')).toBeTruthy();
  });

  test('when textarea field should return false', () => {
    expect(helper.inputableField('description')).toBeFalsy();
  });

  test('when object field should return false', () => {
    expect(helper.inputableField('customFields')).toBeFalsy();
  });

  test('when enum field should return false', () => {
    expect(helper.inputableField('scale')).toBeFalsy();
  });

  test('when select field should return false', () => {
    expect(helper.inputableField('transactionType')).toBeFalsy();
  });

  test('when singleSelect field should return false', () => {
    expect(helper.inputableField('currencyId')).toBeFalsy();
  });

  test('when multiSelect field should return false', () => {
    expect(helper.inputableField('includeTags')).toBeFalsy();
  });

  test('when file field should return false', () => {
    expect(helper.inputableField('image')).toBeFalsy();
  });
});

describe('multiInputableField', () => {
  test('when textarea field should return true', () => {
    expect(helper.multiInputableField('description')).toBeTruthy();
  });

  test('when text field should return false', () => {
    expect(helper.multiInputableField('category')).toBeFalsy();
  });

  test('when number field should return false', () => {
    expect(helper.multiInputableField('startingNumber')).toBeFalsy();
  });

  test('when object field should return false', () => {
    expect(helper.multiInputableField('customFields')).toBeFalsy();
  });

  test('when enum field should return false', () => {
    expect(helper.multiInputableField('scale')).toBeFalsy();
  });

  test('when select field should return false', () => {
    expect(helper.multiInputableField('transactionType')).toBeFalsy();
  });

  test('when singleSelect field should return false', () => {
    expect(helper.multiInputableField('currencyId')).toBeFalsy();
  });

  test('when multiSelect field should return false', () => {
    expect(helper.multiInputableField('includeTags')).toBeFalsy();
  });

  test('when file field should return false', () => {
    expect(helper.multiInputableField('image')).toBeFalsy();
  });
});

describe('multiSelectableField', () => {
  test('when multiSelect field should return true', () => {
    expect(helper.multiSelectableField('includeTags')).toBeTruthy();
  });

  test('when text field should return false', () => {
    expect(helper.multiSelectableField('category')).toBeFalsy();
  });

  test('when number field should return false', () => {
    expect(helper.multiSelectableField('startingNumber')).toBeFalsy();
  });

  test('when textarea field should return false', () => {
    expect(helper.multiSelectableField('description')).toBeFalsy();
  });

  test('when object field should return false', () => {
    expect(helper.multiSelectableField('customFields')).toBeFalsy();
  });

  test('when enum field should return false', () => {
    expect(helper.multiSelectableField('scale')).toBeFalsy();
  });

  test('when select field should return false', () => {
    expect(helper.multiSelectableField('transactionType')).toBeFalsy();
  });

  test('when singleSelect field should return false', () => {
    expect(helper.multiSelectableField('currencyId')).toBeFalsy();
  });

  test('when file field should return false', () => {
    expect(helper.multiSelectableField('image')).toBeFalsy();
  });
});

describe('singleSelectableField', () => {
  test('when singleSelect field should return true', () => {
    expect(helper.singleSelectableField('currencyId')).toBeTruthy();
  });

  test('when text field should return false', () => {
    expect(helper.singleSelectableField('category')).toBeFalsy();
  });

  test('when number field should return false', () => {
    expect(helper.singleSelectableField('startingNumber')).toBeFalsy();
  });

  test('when textarea field should return false', () => {
    expect(helper.singleSelectableField('description')).toBeFalsy();
  });

  test('when object field should return false', () => {
    expect(helper.singleSelectableField('customFields')).toBeFalsy();
  });

  test('when enum field should return false', () => {
    expect(helper.singleSelectableField('scale')).toBeFalsy();
  });

  test('when select field should return false', () => {
    expect(helper.singleSelectableField('transactionType')).toBeFalsy();
  });

  test('when multiSelect field should return false', () => {
    expect(helper.singleSelectableField('includeTags')).toBeFalsy();
  });

  test('when file field should return false', () => {
    expect(helper.singleSelectableField('image')).toBeFalsy();
  });
});

describe('selectableField', () => {
  test('when enum field should return true', () => {
    expect(helper.selectableField('scale')).toBeTruthy();
  });

  test('when select field should return true', () => {
    expect(helper.selectableField('transactionType')).toBeTruthy();
  });

  test('when singleSelect field should return true', () => {
    expect(helper.selectableField('currencyId')).toBeTruthy();
  });

  test('when multiSelect field should return true', () => {
    expect(helper.selectableField('includeTags')).toBeTruthy();
  });

  test('when text field should return false', () => {
    expect(helper.selectableField('category')).toBeFalsy();
  });

  test('when number field should return false', () => {
    expect(helper.selectableField('startingNumber')).toBeFalsy();
  });

  test('when textarea field should return false', () => {
    expect(helper.selectableField('description')).toBeFalsy();
  });

  test('when object field should return false', () => {
    expect(helper.selectableField('customFields')).toBeFalsy();
  });

  test('when file field should return false', () => {
    expect(helper.selectableField('image')).toBeFalsy();
  });
});

describe('nullToggleableKeys', () => {
  test('should return nullToggleable keys', () => {
    expect(helper.nullToggleableKeys.value).toEqual([
      'endDate',
    ]);
  });
});

describe('nullToggleableField', () => {
  test('when null toggleable field should return true', () => {
    expect(helper.nullToggleableField('endDate')).toBeTruthy();
  });

  test('when not null toggleable field should return true', () => {
    expect(helper.nullToggleableField('startDate')).toBeFalsy();
  });
});

describe('tagsKeys', () => {
  test('should return tags keys', () => {
    expect(helper.tagsKeys.value).toEqual([
      'tags',
      'includeTags',
    ]);
  });
});

describe('tagsField', () => {
  test('when field is tags should return true', () => {
    expect(helper.tagsField('tags')).toBeTruthy();
  });

  test('when is tags field should return true', () => {
    expect(helper.tagsField('includeTags')).toBeTruthy();
  });

  test('when not tags field should return true', () => {
    expect(helper.tagsField('currencyId')).toBeFalsy();
  });
});

describe('objectKeys', () => {
  test('should return object keys', () => {
    expect(helper.objectKeys.value).toEqual([
      'customFields',
    ]);
  });
});

describe('objectField', () => {
  test('when object field should return true', () => {
    expect(helper.objectField('customFields')).toBeTruthy();
  });

  test('when enum field should return false', () => {
    expect(helper.objectField('scale')).toBeFalsy();
  });

  test('when select field should return false', () => {
    expect(helper.objectField('transactionType')).toBeFalsy();
  });

  test('when singleSelect field should return false', () => {
    expect(helper.objectField('currencyId')).toBeFalsy();
  });

  test('when multiSelect field should return false', () => {
    expect(helper.objectField('includeTags')).toBeFalsy();
  });

  test('when text field should return false', () => {
    expect(helper.objectField('category')).toBeFalsy();
  });

  test('when number field should return false', () => {
    expect(helper.objectField('startingNumber')).toBeFalsy();
  });

  test('when textarea field should return false', () => {
    expect(helper.objectField('description')).toBeFalsy();
  });

  test('when file field should return false', () => {
    expect(helper.objectField('image')).toBeFalsy();
  });
});

describe('numberKeys', () => {
  test('should return number keys', () => {
    expect(helper.numberKeys.value).toEqual([
      'startingNumber',
    ]);
  });
});

describe('numberField', () => {
  test('when number field should return true', () => {
    expect(helper.numberField('startingNumber')).toBeTruthy();
  });

  test('when enum field should return false', () => {
    expect(helper.numberField('scale')).toBeFalsy();
  });

  test('when select field should return false', () => {
    expect(helper.numberField('transactionType')).toBeFalsy();
  });

  test('when singleSelect field should return false', () => {
    expect(helper.numberField('currencyId')).toBeFalsy();
  });

  test('when multiSelect field should return false', () => {
    expect(helper.numberField('includeTags')).toBeFalsy();
  });

  test('when text field should return false', () => {
    expect(helper.numberField('category')).toBeFalsy();
  });

  test('when textarea field should return false', () => {
    expect(helper.numberField('description')).toBeFalsy();
  });

  test('when file field should return false', () => {
    expect(helper.numberField('image')).toBeFalsy();
  });

  test('when object field should return false', () => {
    expect(helper.numberField('customFields')).toBeFalsy();
  });
});

describe('fileKeys', () => {
  test('should return file keys', () => {
    expect(helper.fileKeys.value).toEqual([
      'image',
    ]);
  });
});

describe('fileField', () => {
  test('when file field should return true', () => {
    expect(helper.fileField('image')).toBeTruthy();
  });

  test('when number field should return false', () => {
    expect(helper.fileField('startingNumber')).toBeFalsy();
  });

  test('when enum field should return false', () => {
    expect(helper.fileField('scale')).toBeFalsy();
  });

  test('when select field should return false', () => {
    expect(helper.fileField('transactionType')).toBeFalsy();
  });

  test('when singleSelect field should return false', () => {
    expect(helper.fileField('currencyId')).toBeFalsy();
  });

  test('when multiSelect field should return false', () => {
    expect(helper.fileField('includeTags')).toBeFalsy();
  });

  test('when text field should return false', () => {
    expect(helper.fileField('category')).toBeFalsy();
  });

  test('when textarea field should return false', () => {
    expect(helper.fileField('description')).toBeFalsy();
  });

  test('when object field should return false', () => {
    expect(helper.fileField('customFields')).toBeFalsy();
  });
});

describe('includeKeys', () => {
  test('should return include keys', () => {
    expect(helper.includeKeys.value).toEqual([
      'image',
      'tags',
      'includeTags',
      'currencyId',
    ]);
  });
});

describe('formatInputOptionsData', () => {
  test('should return formatted data', () => {
    const dataFromServer = {
      total: 2,
      data: [
        { id: '1', code: 'USD' },
        { id: '2', code: 'SGD' },
      ],
    };

    expect(helper.formatInputOptionsData('currencyId', 0, 10, dataFromServer)).toEqual({
      loading: false,
      pagination: { offset: 0, limit: 10, client: false },
      total: 2,
      data: [
        { id: '1', code: 'USD' },
        { id: '2', code: 'SGD' },
      ],
    });
  });
});

describe('formatDataFields', () => {
  test('when enum field should return formatted data', () => {
    const fields = {
      scale: {
        enums: {
          hour: 'Hour',
          minute: 'Minute',
          second: 'Second',
        },
      },
    };

    const result = helper.formatDataFields(fields);

    expect(result).toEqual([
      {
        key: 'id',
        type: 'text',
        label: 'ID',
        listable: true,
        viewable: true,
        creatable: false,
        updatable: false,
        sortable: true,
      },
      {
        key: 'category',
        type: 'text',
        label: 'Category',
        listable: true,
        viewable: true,
        creatable: true,
        updatable: false,
        filterable: true,
        sortable: true,
      },
      {
        key: 'startingNumber',
        type: 'number',
        label: 'Starting Number',
        listable: false,
        viewable: true,
        creatable: true,
        updatable: false,
        defaultValue: expect.anything(),
      },
      {
        key: 'description',
        type: 'textarea',
        label: 'Description',
        listable: true,
        viewable: true,
        creatable: true,
        updatable: true,
        filterable: false,
        sortable: false,
      },
      {
        key: 'textColor',
        type: 'text',
        label: 'Text Color',
        listable: false,
        viewable: true,
        creatable: true,
        updatable: true,
      },
      {
        key: 'image',
        type: 'file',
        label: 'Image',
        listable: false,
        viewable: true,
        creatable: true,
        updatable: true,
        file: {
          modelClass: 'documents',
          type: 'img',
          label: expect.anything(),
          value: expect.anything(),
        },
      },
      {
        key: 'scale',
        type: 'enum',
        label: 'Scale',
        listable: false,
        viewable: true,
        creatable: true,
        updatable: false,
        options: [
          { value: 'hour', label: 'Hour' },
          { value: 'minute', label: 'Minute' },
          { value: 'second', label: 'Second' },
        ],
      },
      {
        key: 'transactionType',
        type: 'select',
        label: 'Transaction Type',
        listable: false,
        viewable: true,
        creatable: true,
        updatable: false,
        options: [
          { value: 'income', label: 'Income' },
          { value: 'incomeReversal', label: 'Income Reversal' },
          { value: 'expense', label: 'Income' },
          { value: 'expenseReversal', label: 'Income Reversal' },
        ],
      },
      {
        key: 'tags',
        type: 'multiSelect',
        label: 'Tags',
        isTags: true,
        reference: { label: expect.anything() },
        listable: true,
        viewable: true,
        creatable: true,
        updatable: true,
        filterable: true,
        options: {
          server: true,
          pagination: true,
          modelClass: 'tags',
          value: expect.anything(),
          label: expect.anything(),
        },
      },
      {
        key: 'includeTags',
        type: 'multiSelect',
        label: 'Include Tags',
        isTags: true,
        reference: { label: expect.anything() },
        listable: true,
        viewable: true,
        creatable: true,
        updatable: true,
        filterable: true,
        options: {
          server: true,
          pagination: true,
          modelClass: 'tags',
          value: expect.anything(),
          label: expect.anything(),
        },
      },
      {
        key: 'currencyId',
        type: 'singleSelect',
        label: 'Currency',
        reference: { label: expect.anything() },
        listable: false,
        viewable: true,
        creatable: true,
        updatable: false,
        filterable: true,
        options: {
          server: true,
          pagination: true,
          modelClass: 'currencies',
          value: expect.anything(),
          label: expect.anything(),
        },
      },
      {
        key: 'startDate',
        type: 'date',
        label: 'Start Date',
        listable: false,
        viewable: true,
        creatable: true,
        updatable: false,
      },
      {
        key: 'endDate',
        type: 'date',
        label: 'End Date',
        listable: false,
        viewable: true,
        creatable: true,
        updatable: true,
        nullToggleable: true,
      },
      {
        key: 'customFields',
        type: 'object',
        label: 'Custom Fields',
        listable: false,
        viewable: true,
        creatable: true,
        updatable: true,
      },
      {
        key: 'createdAt',
        type: 'datetime',
        label: 'Created At',
        listable: false,
        viewable: false,
        creatable: false,
        updatable: false,
        filterable: true,
      },
    ]);
  });
});

describe('formatDataForShow', () => {
  test('when field value is not empty should return value', async() => {
    const field = 'category';
    const record = { category: 'company' };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toBe('company');
      });
  });

  test('when field value is empty but has default value should return default value', async() => {
    const field = 'startingNumber';
    const record = {};

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toBe(1);
      });
  });

  test('when field value is empty and has no default value should return undefined', async() => {
    const field = 'category';
    const record = {};

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toBeUndefined();
      });
  });

  test('when object field value is not empty should return string', async() => {
    const field = 'customFields';
    const record = {
      customFields: {
        foo: 'bar',
        alice: 'bob',
      },
    };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toEqual(
          `{\n` +
          `    "foo": "bar",\n` +
          `    "alice": "bob"\n` +
          `}`
        );
      });
  });

  test('when object field value is empty should return undefined', async() => {
    const field = 'customFields';
    const record = {};

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toBeUndefined();
      });
  });

  test('when file field and has includes should return foreign value in File', async() => {
    const field = 'image';
    const record = {
      image: '1',
      includes: {
        image: {
          1: {
            rawData: 'asdfasdfasdf',
            filename: 'logo.png',
            mimeType: 'image/png',
          },
        },
      },
    };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toBe('fakeFile-logo.png-asdfasdfasdf-image/png');
      });
  });

  test('when file field and has no includes should fetch from server and set as includes', async() => {
    const field = 'image';
    const record = { image: '1' };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toBe('fakeFile-logo.png-asdfasdfasdf-image/png');
        expect(record.includes).toEqual({
          image: {
            1: {
              id: '1',
              rawData: 'asdfasdfasdf',
              filename: 'logo.png',
              mimeType: 'image/png',
            },
          },
        });
      });
  });

  test('when file field and has no includes and fetch fail should return null', async() => {
    const field = 'image';
    const record = { image: '3' };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toBeNull();
        expect(record.includes).toBeUndefined();
      });
  });

  test('when file field and has includes but convert to File fail should return null', async() => {
    const field = 'image';
    const record = {
      image: '1',
      includes: {
        image: {
          1: {
            rawData: 'asdfasdfasdf',
            filename: 'invalid.png',
            mimeType: 'image/png',
          },
        },
      },
    };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toBeNull();
      });
  });

  test('when file field and has no includes but convert fetched data from server fail should return null', async() => {
    const field = 'image';
    const record = { image: '2' };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toBeNull();
        expect(record.includes).toBeUndefined();
      });
  });

  test('when text field should return value as-is', async() => {
    const field = 'id';
    const record = { id: '1' };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toBe('1');
      });
  });

  test('when textarea field should return value as-is', async() => {
    const field = 'description';
    const record = { description: 'Implementation' };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toBe('Implementation');
      });
  });

  test('when number field should return value as-is', async() => {
    const field = 'startingNumber';
    const record = { startingNumber: 2 };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toBe(2);
      });
  });

  test('when date field with date value should return value as-is', async() => {
    const field = 'startDate';
    const record = { startDate: new Date('2023-04-11') };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toEqual(new Date('2023-04-11'));
      });
  });

  test('when date field with string value should return date', async() => {
    const field = 'startDate';
    const record = { startDate: '2023-04-11' };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toEqual(new Date('2023-04-11'));
      });
  });

  test('when date field with range value should return date range', async() => {
    const field = 'startDate';
    const record = {
      startDate: {
        startDate: '2023-04-11',
        endDate: '2023-04-15',
      },
    };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toEqual({
          startDate: new Date('2023-04-11'),
          endDate: new Date('2023-04-15'),
        });
      });
  });

  test('when datetime field with string value should return datetime', async() => {
    const field = 'createdAt';
    const record = { createdAt: '2023-04-11T12:34:56.234Z' };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toEqual(new Date('2023-04-11T12:34:56.234Z'));
      });
  });

  test('when datetime field with range value should return datetime range', async() => {
    const field = 'createdAt';
    const record = {
      createdAt: {
        startTime: '2023-04-11T00:00:00.000Z',
        endTime: '2023-04-15T23:59:59.999Z',
      },
    };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toEqual({
          startTime: new Date('2023-04-11T00:00:00.000Z'),
          endTime: new Date('2023-04-15T23:59:59.999Z'),
        });
      });
  });

  test('when enum field should return field value as-is', async() => {
    const field = 'scale';
    const record = { scale: 'hour' };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toBe('hour');
      });
  });

  test('when select field should return field value as-is', async() => {
    const field = 'transactionType';
    const record = { transactionType: 'income' };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toBe('income');
      });
  });

  test('when singleSelect field and has fetched options should return formatted options', async() => {
    const field = 'currencyId';
    const record = { currencyId: '1' };

    const options = [
      { value: '1', label: 'USD' },
      { value: '2', label: 'SGD' },
    ];

    const combinedSchemas = [
      {
        key: 'currencyId',
        type: 'singleSelect',
        label: 'Currency',
        reference: { label: currencyLabel },
        listable: false,
        viewable: true,
        creatable: true,
        updatable: false,
        filterable: true,
        options,
      },
    ];

    helper = useInputHelper(combinedSchemas);
    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toEqual([{ value: '1', label: 'USD' }]);
      });
  });

  test('when multiSelect field and has fetched options should return formatted options', async() => {
    const field = 'tags';
    const record = { tags: ['1', '2'] };

    const options = [
      { value: '1', label: 'company:abc' },
      { value: '2', label: 'company:xyz' },
    ];

    const combinedSchemas = [
      {
        key: 'tags',
        type: 'multiSelect',
        label: 'Tags',
        isTags: true,
        reference: { label: tagLabel },
        listable: true,
        viewable: true,
        creatable: true,
        updatable: true,
        filterable: true,
        options,
      },
    ];

    helper = useInputHelper(combinedSchemas);
    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toEqual([
          { value: '1', label: 'company:abc' },
          { value: '2', label: 'company:xyz' },
        ]);
      });
  });

  test('when singleSelect field and has includes should return formatted options', async() => {
    const field = 'currencyId';
    const record = {
      currencyId: '1',
      includes: {
        currencyId: {
          1: { id: '1', code: 'USD' },
          2: { id: '2', code: 'SGD' },
        },
      },
    };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toEqual([{ value: '1', label: 'USD' }]);
      });
  });

  test('when multiSelect field and has includes should return formatted options', async() => {
    const field = 'tags';
    const record = {
      tags: ['1', '2'],
      includes: {
        tags: {
          1: { id: '1', category: 'company', name: 'abc' },
          2: { id: '2', category: 'company', name: 'xyz' },
        },
      },
    };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toEqual([
          { value: '1', label: 'company:abc' },
          { value: '2', label: 'company:xyz' },
        ]);
      });
  });

  test('when singleSelect field and has no includes nor fetched options should fetch from server', async() => {
    const field = 'currencyId';
    const record = { currencyId: '1' };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toEqual([{ value: '1', label: 'USD' }]);
      });
  });

  test('when multiSelect field and has no includes nor fetched options should fetch from server', async() => {
    const field = 'tags';
    const record = { tags: ['1', '2'] };

    helper.formatDataForShow(field, record)
      .then((result) => {
        expect(result).toEqual([
          { value: '1', label: 'company:abc' },
          { value: '2', label: 'company:xyz' },
        ]);
      });
  });
});

describe('formatDataForSave', () => {
  test('when has values should return formatted data', () => {
    const params = {
      category: 'company',
      startDate: '2023-01-01',
      createdAt: '2023-01-01T00:00:00.000Z',
      startingNumber: '123.23',
      scale: 'hour',
      transactionType: 'income',
      tags: [
        { value: '1', label: 'company:company-abc' },
        { value: '2', label: 'company:company-xyz' },
      ],
      includeTags: [
        { value: '2', label: 'company:company-xyz' },
      ],
      currencyId: [
        { value: '1', label: 'USD' },
      ],
      customFields: '{"foo":"bar"}',
    };

    const result = helper.formatDataForSave(params);

    expect(result).toEqual({
      category: 'company',
      startDate: '2023-01-01',
      createdAt: '2023-01-01T00:00:00.000Z',
      startingNumber: 123.23,
      image: '',
      scale: 'hour',
      transactionType: 'income',
      tags: [
        '1',
        '2',
      ],
      includeTags: [
        '2',
      ],
      currencyId: '1',
      customFields: {
        foo: 'bar',
      },
    });
  });

  test('when no values should return formatted data', () => {
    const params = {
      category: null,
      startDate: null,
      createdAt: null,
      startingNumber: null,
      scale: null,
      transactionType: null,
      tags: [],
      includeTags: [],
      currencyId: [],
      customFields: '',
    };

    const result = helper.formatDataForSave(params);

    expect(result).toEqual({
      category: null,
      startDate: null,
      createdAt: null,
      startingNumber: null,
      image: '',
      scale: '',
      transactionType: '',
      tags: [],
      includeTags: [],
      currencyId: '',
      customFields: {},
    });
  });
});

describe('formatErrorsForDisplay', () => {
  test('should return formatted errors', () => {
    const error = {
      id: ['required'],
      category: ['required', 'unique'],
      tags: ['foreign'],
    };

    const result = helper.formatErrorsForDisplay(error);

    expect(result).toEqual({
      id: [
        { name: 'required', params: {} },
      ],
      category: [
        { name: 'required', params: {} },
        { name: 'unique', params: {} },
      ],
      tags: [
        { name: 'foreign', params: {} },
      ],
    });
  });
});

describe('formatFiltersForShow', () => {
  test('when has values should return formatted filters', () => {
    const filters = {
      category: 'company',
      startDate: {
        startDate: '2023-01-01',
        endDate: '2023-01-01',
      },
      createdAt: {
        startTime: '2023-01-01T00:00:00.000Z',
        endTime: '2023-12-31T23:59:59.999Z',
      },
      scale: [
        { value: 'hour', label: 'Hour' },
      ],
      transactionType: [
        { value: 'income', label: 'Income' },
      ],
      tags: [
        { value: '1', label: 'company:company-abc' },
        { value: '2', label: 'company:company-xyz' },
      ],
      includeTags: [
        { value: '2', label: 'company:company-xyz' },
      ],
      currencyId: [
        { value: '1', label: 'USD' },
      ],
    };

    const result = helper.formatFiltersForShow(filters);

    expect(result).toEqual({
      category: 'company',
      startDate: {
        startDate: '2023-01-01',
        endDate: '2023-01-01',
      },
      createdAt: {
        startTime: '2023-01-01T00:00:00.000Z',
        endTime: '2023-12-31T23:59:59.999Z',
      },
      scale: 'hour',
      transactionType: 'income',
      tags: [
        '1',
        '2',
      ],
      includeTags: [
        '2',
      ],
      currencyId: [
        '1',
      ],
    });
  });

  test('when no values should return formatted filters', () => {
    const filters = {
      category: null,
      startDate: {
        startDate: null,
        endDate: null,
      },
      createdAt: null,
      scale: [],
      transactionType: [],
      tags: [],
      includeTags: [],
      currencyId: [],
    };

    const result = helper.formatFiltersForShow(filters);

    expect(result).toEqual({
      category: null,
      startDate: {
        startDate: null,
        endDate: null,
      },
      createdAt: null,
      scale: [],
      transactionType: [],
      tags: [],
      includeTags: [],
      currencyId: [],
    });
  });
});

describe('formatFiltersForLoad', () => {
  test('when has values should return formatted filters', () => {
    const filters = {
      category: 'company',
      startDate: {
        startDate: '2023-01-01',
        endDate: '2023-01-01',
      },
      createdAt: {
        startTime: '2023-01-01T00:00:00.000Z',
        endTime: '2023-12-31T23:59:59.999Z',
      },
      scale: 'hour',
      transactionType: 'income',
      tags: [
        { value: '1', label: 'company:company-abc' },
        { value: '2', label: 'company:company-xyz' },
      ],
      includeTags: [
        { value: '2', label: 'company:company-xyz' },
      ],
      currencyId: [
        { value: '1', label: 'USD' },
      ],
    };

    const result = helper.formatFiltersForLoad(filters);

    expect(result).toEqual({
      category: 'company',
      startDate: {
        startDate: '2023-01-01',
        endDate: '2023-01-01',
      },
      createdAt: {
        startTime: '2023-01-01T00:00:00.000Z',
        endTime: '2023-12-31T23:59:59.999Z',
      },
      scale: 'hour',
      transactionType: 'income',
      tags: [
        '1',
        '2',
      ],
      includeTags: [
        '2',
      ],
      currencyId: '1',
    });
  });

  test('when no values should return formatted filters', () => {
    const filters = {
      category: null,
      startDate: {
        startDate: null,
        endDate: null,
      },
      createdAt: null,
      scale: [],
      transactionType: [],
      tags: [],
      includeTags: [],
      currencyId: [],
    };

    const result = helper.formatFiltersForLoad(filters);

    expect(result).toEqual({});
  });
});

describe('validateParams', () => {
  test('when valid should return no error', () => {
    const validations = {
      startingNumber: [
        (record) => {
          if (record.startingNumber > 0) { return; }
          return 'Must be greater than 0';
        },
      ],
    };

    const params = {
      startingNumber: 1,
    };

    const result = helper.validateParams(validations, params);
    expect(result).toEqual({});
  });

  test('when invalid should return errors', () => {
    const validations = {
      startingNumber: [
        (record) => {
          if (Object.is(record.startingNumber, undefined)) {
            return 'Required';
          }
        },
        (record) => {
          if (Object.is(record.startingNumber, undefined)) { return; }

          if (record.startingNumber <= 0) {
            return 'Must be greater than 0';
          }
        },
      ],
    };

    const params = {};

    const result = helper.validateParams(validations, params);
    expect(result).toEqual({
      startingNumber: ['Required'],
    });
  });
});

describe('fetchOptions', () => {
  test('when server options field has data should return options from server', async() => {
    helper.fetchOptions('tags', 0)
      .then((result) => {
        expect(result).toEqual({
          loading: false,
          pagination: { offset: 0, limit: 5, client: false },
          total: 2,
          data: [
            { value: '1', label: 'company:abc' },
            { value: '2', label: 'company:xyz' },
          ],
        });
      });
  });

  test('when server options field has no data should return options from server', async() => {
    helper.fetchOptions('currencyId', 0)
      .then((result) => {
        expect(result).toEqual({
          loading: false,
          pagination: { offset: 0, limit: 5, client: false },
          total: 0,
          data: [],
        });
      });
  });

  test('when client options field has data should return options as-is', async() => {
    helper.fetchOptions('transactionType', 0)
      .then((result) => {
        expect(result).toEqual({
          loading: false,
          pagination: { offset: 0, limit: 5, client: true },
          total: 4,
          data: [
            { value: 'income', label: 'Income' },
            { value: 'incomeReversal', label: 'Income Reversal' },
            { value: 'expense', label: 'Income' },
            { value: 'expenseReversal', label: 'Income Reversal' },
          ],
        });
      });
  });
});

describe('initOptionsData', () => {
  test('should fetch all server-side options', async() => {
    helper.initOptionsData()
      .then((result) => {
        expect(result).toEqual({
          tags: {
            loading: false,
            pagination: { offset: 0, limit: 5, client: false },
            total: 2,
            data: [
              { value: '1', label: 'company:abc' },
              { value: '2', label: 'company:xyz' },
            ],
          },
          includeTags: {
            loading: false,
            pagination: { offset: 0, limit: 5, client: false },
            total: 2,
            data: [
              { value: '1', label: 'company:abc' },
              { value: '2', label: 'company:xyz' },
            ],
          },
          currencyId: {
            loading: false,
            pagination: { offset: 0, limit: 5, client: false },
            total: 0,
            data: [],
          },
        });
      });
  });
});
