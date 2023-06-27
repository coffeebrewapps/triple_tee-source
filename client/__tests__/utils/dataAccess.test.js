import { setActivePinia, createPinia } from 'pinia';
import { useDataStore } from '../../src/stores/data.js';
import { useDataAccess } from '../../src/utils/dataAccess.js';
import { useWebAccess } from '../../src/utils/web.js';
import useConfig from '../../src/config.js';

vi.mock('../../src/config.js', async () => ({
  ...(await vi.importActual('../../src/config.js')),
  default: vi.fn(),
}))

vi.mock('../../src/utils/api.js', async () => ({
  ...(await vi.importActual('../../src/utils/api.js')),
  useApiAccess: () => 'mockedApiAccess',
}))

vi.mock('../../src/utils/web.js', async () => ({
  ...(await vi.importActual('../../src/utils/web.js')),
  useWebAccess: () => 'mockedWebAccess',
}))

beforeEach(() => {
  setActivePinia(createPinia());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useDataAccess', () => {
  test('when api should return api access functions', () => {
    const spy = vi.mocked(useConfig).mockImplementation(() => {
      return { dataAccess: 'api' };
    });

    expect(useDataAccess()).toEqual('mockedApiAccess');
  });

  test('when web should return web access functions', () => {
    const spy = vi.mocked(useConfig).mockImplementation(() => {
      return { dataAccess: 'web' };
    });

    expect(useDataAccess()).toEqual('mockedWebAccess');
  });

  test('when not defined should return no function', () => {
    const spy = vi.mocked(useConfig).mockImplementation(() => {
      return { dataAccess: '' };
    });

    expect(useDataAccess()).toEqual({});
  });
});
