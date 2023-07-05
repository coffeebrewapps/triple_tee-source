import { setActivePinia, createPinia } from 'pinia';
import { useWebAccess } from '../../src/utils/web.js';
import { useDataStore } from '../../src/stores/data.js';

vi.mock('../../src/stores/data.js', () => {
  return {
    useDataStore: () => {
      return {
        init: vi.fn(),
        viewSchemas: vi.fn(),
        listSchemas: vi.fn(),
        customFunctionsForModel: vi.fn(),
        list: vi.fn(),
        view: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
        upload: vi.fn(),
        uploadIndexes: vi.fn(),
        download: vi.fn(),
        downloadIndexes: vi.fn(),
      };
    },
  };
});

let dataStore;
let webAccess;

beforeEach(() => {
  setActivePinia(createPinia());
  dataStore = useDataStore();
  webAccess = useWebAccess(dataStore);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useWebAccess', () => {
  test('should export functions', () => {
    expect(webAccess).toEqual(expect.objectContaining({
      schemas: expect.anything(),
      list: expect.anything(),
      view: expect.anything(),
      create: expect.anything(),
      update: expect.anything(),
      remove: expect.anything(),
      upload: expect.anything(),
      download: expect.anything(),
      downloadStream: expect.anything(),
    }));
  });
});

describe('schemas', () => {
  test('when given modelClass and store returns success should return schemas', async() => {
    vi.spyOn(dataStore, 'viewSchemas').mockImplementation((modelClass) => {
      return { fields: { id: 'text' } };
    });

    webAccess.schemas('tags')
      .then((result) => {
        expect(result).toEqual({ fields: { id: 'text' } });
      });
  });

  test('when not given modelClass and store returns success should return schemas', async() => {
    vi.spyOn(dataStore, 'listSchemas').mockImplementation((modelClass) => {
      return { tags: { fields: { id: 'text' } } };
    });

    webAccess.schemas()
      .then((result) => {
        expect(result).toEqual({ tags: { fields: { id: 'text' } } });
      });
  });
});

describe('list', () => {
  test('when using default function and store returns success should return data', async() => {
    vi.spyOn(dataStore, 'list').mockImplementation((modelClass, params) => {
      return { data: { total: 1, data: [{ id: '1' }] } };
    });

    webAccess.list('tags', {})
      .then((result) => {
        expect(result).toEqual({
          data: {
            total: 1,
            data: [{ id: '1' }],
          },
        });
      });
  });

  test('when listing indexes and store returns success should return indexes', async() => {
    vi.spyOn(dataStore, 'downloadIndexes').mockImplementation((modelClass, params) => {
      return { unique: {}, foreign: {}, filter: {} };
    });

    webAccess.list('indexes', {})
      .then((result) => {
        expect(result).toEqual({ unique: {}, foreign: {}, filter: {} });
      });
  });

  test('when using default function with suffix and store returns success should return data', async() => {
    vi.spyOn(dataStore, 'list').mockImplementation((modelClass, params) => {
      return { data: { total: 1, data: [{ id: '1' }] } };
    });

    webAccess.list('chart_configs', {}, { path: 'data' })
      .then((result) => {
        expect(result).toEqual({
          data: {
            total: 1,
            data: [{ id: '1' }],
          },
        });
      });
  });

  test('when args have suffix and store returns success should return data', async() => {
    const customList = vi.fn((modelClass, params) => {
      return { data: { total: 1, data: [{ id: '1' }] } };
    });

    vi.spyOn(dataStore, 'customFunctionsForModel').mockImplementation((modelClass, fnType) => {
      return {
        latest: customList,
      };
    });

    webAccess.list('system_configs', {}, { path: 'latest' })
      .then((result) => {
        expect(result).toEqual({
          data: {
            total: 1,
            data: [{ id: '1' }],
          },
        });
      });
  });
});

describe('view', () => {
  test('when using default function and store returns success should return data', async() => {
    vi.spyOn(dataStore, 'view').mockImplementation((modelClass, params) => {
      return { success: true, record: { id: '1' } };
    });

    webAccess.view('tags', '1', {})
      .then((result) => {
        expect(result).toEqual({
          id: '1',
        });
      });
  });

  test('when args have suffix and store returns success should return data', async() => {
    const customView = vi.fn((modelClass, params) => {
      return { success: true, record: { id: '1' } };
    });

    vi.spyOn(dataStore, 'customFunctionsForModel').mockImplementation((modelClass, fnType) => {
      return {
        data: customView,
      };
    });

    webAccess.view('chart_configs', '1', {}, { path: 'data' })
      .then((result) => {
        expect(result).toEqual({
          id: '1',
        });
      });
  });

  test('when store returns failure should return errors', async() => {
    vi.spyOn(dataStore, 'view').mockImplementation((modelClass, params) => {
      return { errors: { id: ['notFound'] } };
    });

    await webAccess.view('tags', '1', {})
      .catch((error) => {
        expect(error).toEqual({ id: ['notFound'] });
      });
  });
});

describe('create', () => {
  test('when using default function and store returns success should return data', async() => {
    vi.spyOn(dataStore, 'create').mockImplementation((modelClass, params) => {
      return { success: true, record: { id: '1', category: 'company', name: 'company-abc' } };
    });

    webAccess.create('tags', { category: 'company', name: 'company-abc' })
      .then((result) => {
        expect(result).toEqual({
          id: '1',
          category: 'company',
          name: 'company-abc',
        });
      });
  });

  test('when args have suffix and store returns success should return data', async() => {
    const customCreate = vi.fn((modelClass, params) => {
      return { success: true, record: { id: '2', timezone: 'UTC' } };
    });

    vi.spyOn(dataStore, 'customFunctionsForModel').mockImplementation((modelClass, fnType) => {
      return {
        replace: customCreate,
      };
    });

    webAccess.create('system_configs', { timezone: 'UTC' }, { path: 'replace' })
      .then((result) => {
        expect(result).toEqual({
          id: '2',
          timezone: 'UTC',
        });
      });
  });

  test('when store returns failure should return errors', async() => {
    vi.spyOn(dataStore, 'create').mockImplementation((modelClass, params) => {
      return { errors: { category: ['required'] } };
    });

    await webAccess.create('tags', { name: 'company-abc' })
      .catch((error) => {
        expect(error).toEqual({ category: ['required'] });
      });
  });
});

describe('update', () => {
  test('when using default function and store returns success should return data', async() => {
    vi.spyOn(dataStore, 'update').mockImplementation((modelClass, params) => {
      return { success: true, record: { id: '1', category: 'company', name: 'company-abc' } };
    });

    webAccess.update('tags', '1', { category: 'company', name: 'company-abc' })
      .then((result) => {
        expect(result).toEqual({
          id: '1',
          category: 'company',
          name: 'company-abc',
        });
      });
  });

  test('when args have suffix and store returns success should return data', async() => {
    const customUpdate = vi.fn((modelClass, params) => {
      return { success: true, record: { id: '1', associatedTransaction: '2' } };
    });

    vi.spyOn(dataStore, 'customFunctionsForModel').mockImplementation((modelClass, fnType) => {
      return {
        reverse: customUpdate,
      };
    });

    webAccess.update('transactions', '1', {}, { path: 'reverse' })
      .then((result) => {
        expect(result).toEqual({
          id: '1',
          associatedTransaction: '2',
        });
      });
  });

  test('when store returns failure should return errors', async() => {
    vi.spyOn(dataStore, 'update').mockImplementation((modelClass, params) => {
      return { errors: { category: ['required'] } };
    });

    await webAccess.update('tags', '1', { name: 'company-abc' })
      .catch((error) => {
        expect(error).toEqual({ category: ['required'] });
      });
  });
});

describe('remove', () => {
  test('when using default function and store returns success should return data', async() => {
    vi.spyOn(dataStore, 'remove').mockImplementation((modelClass, params) => {
      return { success: true, record: { id: '1', category: 'company', name: 'company-abc' } };
    });

    webAccess.remove('tags', '1')
      .then((result) => {
        expect(result).toEqual({
          id: '1',
          category: 'company',
          name: 'company-abc',
        });
      });
  });

  test('when args have suffix and store returns success should return data', async() => {
    const customRemove = vi.fn((modelClass, params) => {
      return { success: true, record: { id: '1', effectiveEnd: '2023-05-25T12:45:23.342Z' } };
    });

    vi.spyOn(dataStore, 'customFunctionsForModel').mockImplementation((modelClass, fnType) => {
      return {
        deactivate: customRemove,
      };
    });

    webAccess.remove('system_configs', '1', { path: 'deactivate' })
      .then((result) => {
        expect(result).toEqual({
          id: '1',
          effectiveEnd: '2023-05-25T12:45:23.342Z',
        });
      });
  });

  test('when store returns failure should return errors', async() => {
    vi.spyOn(dataStore, 'remove').mockImplementation((modelClass, params) => {
      return { errors: { id: ['notFound'] } };
    });

    await webAccess.remove('tags', '1')
      .catch((error) => {
        expect(error).toEqual({ id: ['notFound'] });
      });
  });
});

describe('upload', () => {
  test('when modelClass is indexes and store returns success should return data', async() => {
    vi.spyOn(dataStore, 'uploadIndexes').mockImplementation((modelClass, params) => {
      return {
        data: {
          unique: { tags: { 'category|name': { 'company|company-abc': '1' } } },
          foreign: {},
          filter: {},
        },
      };
    });

    webAccess.upload(
      'indexes',
      {
        unique: { tags: { 'category|name': { 'company|company-abc': '1' } } },
        foreign: {},
        filter: {},
      }
    )
      .then((result) => {
        expect(result).toEqual({
          data: {
            unique: { tags: { 'category|name': { 'company|company-abc': '1' } } },
            foreign: {},
            filter: {},
          },
        });
      });
  });

  test('when modelClass is schemas and store returns success should return data', async() => {
    vi.spyOn(dataStore, 'upload').mockImplementation((modelClass) => {
      return { data: { 1: { id: '1', category: 'company', name: 'company-abc' } } };
    });

    webAccess.upload('tags', { 1: { id: '1', category: 'company', name: 'company-abc' } })
      .then((result) => {
        expect(result).toEqual({
          data: {
            1: {
              id: '1',
              category: 'company',
              name: 'company-abc',
            },
          },
        });
      });
  });
});

describe('download', () => {
  test('when modelClass is indexes and store returns success should return data', async() => {
    vi.spyOn(dataStore, 'downloadIndexes').mockImplementation(() => {
      return {
        data: {
          unique: { tags: { 'category|name': { 'company|company-abc': '1' } } },
          foreign: {},
          filter: {},
        },
      };
    });

    webAccess.download('indexes')
      .then((result) => {
        expect(result).toEqual({
          filename: 'indexes.json',
          data: JSON.stringify({
            unique: { tags: { 'category|name': { 'company|company-abc': '1' } } },
            foreign: {},
            filter: {},
          }),
        });
      });
  });

  test('when modelClass is schemas and store returns success should return data', async() => {
    vi.spyOn(dataStore, 'download').mockImplementation((modelClass) => {
      return { data: { 1: { id: '1', category: 'company', name: 'company-abc' } } };
    });

    webAccess.download('tags')
      .then((result) => {
        expect(result).toEqual({
          filename: 'tags.json',
          data: JSON.stringify({
            total: 1,
            data: [{
              id: '1',
              category: 'company',
              name: 'company-abc',
            }],
          }),
        });
      });
  });
});

describe('downloadStream', () => {
  test('when suffix equals store function and store returns success should return data', async() => {
    const customDownloadStream = vi.fn((modelClass, params) => {
      return new Promise((resolve, reject) => {
        resolve('line1\nline2\n');
      });
    });

    vi.spyOn(dataStore, 'customFunctionsForModel').mockImplementation((modelClass, fnType) => {
      return {
        downloadStream: customDownloadStream,
      };
    });

    webAccess.downloadStream('logs', null, {}, { path: 'downloadStream' })
      .then((result) => {
        expect(result).toBe('line1\nline2\n');
      });
  });

  test('when suffix does not equal store function and store returns success should return data', async() => {
    const customDownloadStream = vi.fn((modelClass, params) => {
      return new Promise((resolve, reject) => {
        resolve({ data: 'line1\nline2\n' });
      });
    });

    vi.spyOn(dataStore, 'customFunctionsForModel').mockImplementation((modelClass, fnType) => {
      return {
        pdf: customDownloadStream,
      };
    });

    webAccess.downloadStream('invoice_templates', '1', {}, { path: 'pdf' })
      .then((result) => {
        expect(result).toEqual({
          data: 'line1\nline2\n',
        });
      });
  });

  test('when store returns failure should return errors', async() => {
    const customDownloadStream = vi.fn((modelClass, params) => {
      return new Promise((resolve, reject) => {
        reject(new Error('invalid parse'));
      });
    });

    vi.spyOn(dataStore, 'customFunctionsForModel').mockImplementation((modelClass, fnType) => {
      return {
        pdf: customDownloadStream,
      };
    });

    webAccess.downloadStream('invoice_templates', '1', {}, { path: 'pdf' })
      .catch((error) => {
        expect(error).toEqual(new Error('invalid parse'));
      });
  });
});
