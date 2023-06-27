import { useApiAccess } from '../../src/utils/api.js';
import axios from 'axios';

const apiAccess = useApiAccess();

vi.mock('axios');

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useApiAccess', () => {
  test('should export functions', () => {
    expect(apiAccess).toEqual(expect.objectContaining({
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
  test('when api returns success should return schemas', async() => {
    const spy = vi.spyOn(axios, 'get').mockImplementation((url) => {
      return new Promise((resolve, reject) => {
        resolve({ data: { fields: { id: 'text' } } });
      });
    });

    apiAccess.schemas('tags')
      .then((result) => {
        expect(result).toEqual({ fields: { id: 'text' } });
      });

    expect(spy).toHaveBeenCalledWith('/api/schemas/tags');
  });

  test('when api returns failure should return errors', async() => {
    const spy = vi.spyOn(axios, 'get').mockImplementation((url) => {
      return new Promise((resolve, reject) => {
        reject({ response: { data: { errors: { schema: ['notFound'] } } } });
      });
    });

    await apiAccess.schemas('tags')
      .catch((error) => {
        expect(error).toEqual({ schema: ['notFound'] });
      });

    expect(spy).toHaveBeenCalledWith('/api/schemas/tags');
  });
});

describe('list', () => {
  test('when api returns success should return data', async() => {
    const spy = vi.spyOn(axios, 'get').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        resolve({ data: { total: 1, data: [{ id: '1' }] } });
      });
    });

    apiAccess.list('tags', {})
      .then((result) => {
        expect(result).toEqual({
          total: 1,
          data: [{ id: '1' }],
        });
      });

    expect(spy).toHaveBeenCalledWith('/api/tags', { params: {} });
  });

  test('when url has suffix and api returns success should return data', async() => {
    const spy = vi.spyOn(axios, 'get').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        resolve({ data: { total: 1, data: [{ id: '1' }] } });
      });
    });

    apiAccess.list('system_configs', {}, { path: 'latest' })
      .then((result) => {
        expect(result).toEqual({
          total: 1,
          data: [{ id: '1' }],
        });
      });

    expect(spy).toHaveBeenCalledWith('/api/system_configs/latest', { params: {} });
  });

  test('when api returns failure should return errors', async() => {
    const spy = vi.spyOn(axios, 'get').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        reject({ response: { data: { errors: { root: ['unknown'] } } } });
      });
    });

    await apiAccess.list('tags', {})
      .catch((error) => {
        expect(error).toEqual({ root: ['unknown'] });
      });

    expect(spy).toHaveBeenCalledWith('/api/tags', { params: {} });
  });
});

describe('view', () => {
  test('when api returns success should return data', async() => {
    const spy = vi.spyOn(axios, 'get').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        resolve({ data: { record: { id: '1' } } });
      });
    });

    apiAccess.view('tags', '1', {})
      .then((result) => {
        expect(result).toEqual({
          id: '1',
        });
      });

    expect(spy).toHaveBeenCalledWith('/api/tags/1', { params: {} });
  });

  test('when url has suffix and api returns success should return data', async() => {
    const spy = vi.spyOn(axios, 'get').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        resolve({ data: { record: { id: '1' } } });
      });
    });

    apiAccess.view('chart_configs', '1', {}, { path: 'data' })
      .then((result) => {
        expect(result).toEqual({
          id: '1',
        });
      });

    expect(spy).toHaveBeenCalledWith('/api/chart_configs/1/data', { params: {} });
  });

  test('when api returns failure should return errors', async() => {
    const spy = vi.spyOn(axios, 'get').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        reject({ response: { data: { errors: { id: ['notFound'] } } } });
      });
    });

    await apiAccess.view('tags', '1', {})
      .catch((error) => {
        expect(error).toEqual({ id: ['notFound'] });
      });

    expect(spy).toHaveBeenCalledWith('/api/tags/1', { params: {} });
  });
});

describe('create', () => {
  test('when api returns success should return data', async() => {
    const spy = vi.spyOn(axios, 'post').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        resolve({ data: { record: { id: '1', category: 'company', name: 'company-abc' } } });
      });
    });

    apiAccess.create('tags', { category: 'company', name: 'company-abc' })
      .then((result) => {
        expect(result).toEqual({
          id: '1',
          category: 'company',
          name: 'company-abc',
        });
      });

    expect(spy).toHaveBeenCalledWith(
      '/api/tags',
      { category: 'company', name: 'company-abc' },
      { headers: {} }
    );
  });

  test('when url has suffix and api returns success should return data', async() => {
    const spy = vi.spyOn(axios, 'post').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        resolve({ data: { record: { id: '2', timezone: 'UTC' } } });
      });
    });

    apiAccess.create('system_configs', { timezone: 'UTC' }, { path: 'replace' })
      .then((result) => {
        expect(result).toEqual({
          id: '2',
          timezone: 'UTC',
        });
      });

    expect(spy).toHaveBeenCalledWith(
      '/api/system_configs/replace',
      { timezone: 'UTC' },
      { headers: {} }
    );
  });

  test('when multipart request and api returns success should return data', async() => {
    const spy = vi.spyOn(axios, 'post').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        resolve({ data: { record: { id: '1', name: 'Company ABC' } } });
      });
    });

    apiAccess.create('contacts', { name: 'Company ABC' }, null, true)
      .then((result) => {
        expect(result).toEqual({
          id: '1',
          name: 'Company ABC',
        });
      });

    expect(spy).toHaveBeenCalledWith(
      '/api/contacts',
      { name: 'Company ABC' },
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  });

  test('when api returns failure should return errors', async() => {
    const spy = vi.spyOn(axios, 'post').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        reject({ response: { data: { errors: { category: ['required'] } } } });
      });
    });

    await apiAccess.create('tags', { name: 'company-abc' })
      .catch((error) => {
        expect(error).toEqual({ category: ['required'] });
      });

    expect(spy).toHaveBeenCalledWith(
      '/api/tags',
      { name: 'company-abc' },
      { headers: {} }
    );
  });
});

describe('update', () => {
  test('when api returns success should return data', async() => {
    const spy = vi.spyOn(axios, 'put').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        resolve({ data: { record: { id: '1', category: 'company', name: 'company-abc' } } });
      });
    });

    apiAccess.update('tags', '1', { category: 'company', name: 'company-abc' })
      .then((result) => {
        expect(result).toEqual({
          id: '1',
          category: 'company',
          name: 'company-abc',
        });
      });

    expect(spy).toHaveBeenCalledWith(
      '/api/tags/1',
      { category: 'company', name: 'company-abc' },
      { headers: {} }
    );
  });

  test('when url has suffix and api returns success should return data', async() => {
    const spy = vi.spyOn(axios, 'put').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        resolve({ data: { record: { id: '1', associatedTransaction: '2' } } });
      });
    });

    apiAccess.update('transactions', '1', {}, { path: 'reverse' })
      .then((result) => {
        expect(result).toEqual({
          id: '1',
          associatedTransaction: '2',
        });
      });

    expect(spy).toHaveBeenCalledWith(
      '/api/transactions/1/reverse',
      {},
      { headers: {} }
    );
  });

  test('when multipart request and api returns success should return data', async() => {
    const spy = vi.spyOn(axios, 'put').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        resolve({ data: { record: { id: '1', name: 'Company ABC' } } });
      });
    });

    apiAccess.update('contacts', '1', { name: 'Company ABC' }, null, true)
      .then((result) => {
        expect(result).toEqual({
          id: '1',
          name: 'Company ABC',
        });
      });

    expect(spy).toHaveBeenCalledWith(
      '/api/contacts/1',
      { name: 'Company ABC' },
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  });

  test('when api returns failure should return errors', async() => {
    const spy = vi.spyOn(axios, 'put').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        reject({ response: { data: { errors: { category: ['required'] } } } });
      });
    });

    await apiAccess.update('tags', '1', { name: 'company-abc' })
      .catch((error) => {
        expect(error).toEqual({ category: ['required'] });
      });

    expect(spy).toHaveBeenCalledWith(
      '/api/tags/1',
      { name: 'company-abc' },
      { headers: {} }
    );
  });
});

describe('remove', () => {
  test('when api returns success should return data', async() => {
    const spy = vi.spyOn(axios, 'delete').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        resolve({ data: { record: { id: '1', category: 'company', name: 'company-abc' } } });
      });
    });

    apiAccess.remove('tags', '1')
      .then((result) => {
        expect(result).toEqual({
          id: '1',
          category: 'company',
          name: 'company-abc',
        });
      });

    expect(spy).toHaveBeenCalledWith(
      '/api/tags/1'
    );
  });

  test('when url has suffix and api returns success should return data', async() => {
    const spy = vi.spyOn(axios, 'delete').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        resolve({ data: { record: { id: '1', effectiveEnd: '2023-05-25T12:45:23.342Z' } } });
      });
    });

    apiAccess.remove('system_configs', '1', { path: 'deactivate' })
      .then((result) => {
        expect(result).toEqual({
          id: '1',
          effectiveEnd: '2023-05-25T12:45:23.342Z',
        });
      });

    expect(spy).toHaveBeenCalledWith(
      '/api/system_configs/1/deactivate'
    );
  });

  test('when api returns failure should return errors', async() => {
    const spy = vi.spyOn(axios, 'delete').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        reject({ response: { data: { errors: { id: ['notFound'] } } } });
      });
    });

    await apiAccess.remove('tags', '1')
      .catch((error) => {
        expect(error).toEqual({ id: ['notFound'] });
      });

    expect(spy).toHaveBeenCalledWith(
      '/api/tags/1'
    );
  });
});

describe('upload', () => {
  test('when modelClass is indexes and api returns success should return data', async() => {
    const spy = vi.spyOn(axios, 'put').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        resolve({
          data: {
            data: {
              unique: { tags: { 'category|name': { 'company|company-abc': '1' } } },
              foreign: {},
              filter: {},
            },
          },
        });
      });
    });

    apiAccess.upload(
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

    expect(spy).toHaveBeenCalledWith(
      '/api/indexes',
      {
        unique: { tags: { 'category|name': { 'company|company-abc': '1' } } },
        foreign: {},
        filter: {},
      }
    );
  });

  test('when modelClass is schemas and api returns success should return data', async() => {
    const spy = vi.spyOn(axios, 'put').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        resolve({ data: { data: { 1: { id: '1', category: 'company', name: 'company-abc' } } } });
      });
    });

    apiAccess.upload('tags', { 1: { id: '1', category: 'company', name: 'company-abc' } })
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

    expect(spy).toHaveBeenCalledWith(
      '/api/schemas/tags/upload',
      {
        1: {
          id: '1',
          category: 'company',
          name: 'company-abc',
        },
      }
    );
  });

  test('when api returns failure should return errors', async() => {
    const spy = vi.spyOn(axios, 'put').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        reject({ response: { data: { errors: { root: ['unknown'] } } } });
      });
    });

    apiAccess.upload('tags', { 1: { id: '1', category: 'company', name: 'company-abc' } })
      .catch((error) => {
        expect(error).toEqual({ root: ['unknown'] });
      });

    expect(spy).toHaveBeenCalledWith(
      '/api/schemas/tags/upload',
      {
        1: {
          id: '1',
          category: 'company',
          name: 'company-abc',
        },
      }
    );
  });
});

describe('download', () => {
  test('when modelClass is indexes and api returns success should return data', async() => {
    const spy = vi.spyOn(axios, 'get').mockImplementation((url, params) => {
      return new Promise((resolve, reject) => {
        resolve({
          data: {
            data: {
              unique: { tags: { 'category|name': { 'company|company-abc': '1' } } },
              foreign: {},
              filter: {},
            },
          },
        });
      });
    });

    apiAccess.download('indexes')
      .then((result) => {
        expect(result).toEqual({
          data: {
            unique: { tags: { 'category|name': { 'company|company-abc': '1' } } },
            foreign: {},
            filter: {},
          },
        });
      });

    expect(spy).toHaveBeenCalledWith('/api/indexes/download');
  });

  test('when modelClass is schemas and api returns success should return data', async() => {
    const spy = vi.spyOn(axios, 'get').mockImplementation((url) => {
      return new Promise((resolve, reject) => {
        resolve({ data: { data: { 1: { id: '1', category: 'company', name: 'company-abc' } } } });
      });
    });

    apiAccess.download('tags')
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

    expect(spy).toHaveBeenCalledWith('/api/tags/download');
  });

  test('when api returns failure should return errors', async() => {
    const spy = vi.spyOn(axios, 'get').mockImplementation((url) => {
      return new Promise((resolve, reject) => {
        reject({ response: { data: { errors: { root: ['unknown'] } } } });
      });
    });

    apiAccess.download('tags')
      .catch((error) => {
        expect(error).toEqual({ root: ['unknown'] });
      });

    expect(spy).toHaveBeenCalledWith('/api/tags/download');
  });
});

describe('downloadStream', () => {
  test('when api returns success should return data', async() => {
    axios.mockResolvedValue('line1\nline2\n');

    apiAccess.downloadStream('logs', null, {})
      .then((result) => {
        expect(result).toEqual('line1\nline2\n');
      });

    expect(axios).toHaveBeenCalledWith({
      method: 'post',
      url: '/api/logs',
      responseType: 'blob',
      data: {},
    });
  });

  test('when url has suffix and api returns success should return data', async() => {
    axios.mockResolvedValue('line1\nline2\n');

    apiAccess.downloadStream('invoice_templates', '1', {}, { path: 'pdf' })
      .then((result) => {
        expect(result).toEqual('line1\nline2\n');
      });

    expect(axios).toHaveBeenCalledWith({
      method: 'post',
      url: '/api/invoice_templates/1/pdf',
      responseType: 'blob',
      data: {},
    });
  });

  test('when api returns failure should return errors', async() => {
    axios.mockRejectedValue({ response: { data: { errors: { id: ['notFound'] } } } });

    apiAccess.downloadStream('invoice_templates', '1', {}, { path: 'pdf' })
      .catch((error) => {
        expect(error).toEqual({ id: ['notFound'] });
      });

    expect(axios).toHaveBeenCalledWith({
      method: 'post',
      url: '/api/invoice_templates/1/pdf',
      responseType: 'blob',
      data: {},
    });
  });
});
