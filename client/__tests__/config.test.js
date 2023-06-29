import { setActivePinia, createPinia } from 'pinia';
import useConfig from '../src/config.js';

let config;
const originalEnvMode = import.meta.env.MODE;
const originalServerPort = import.meta.env.VITE_SERVER_PORT;
const originalDefaultServerPort = import.meta.env.VITE_DEFAULT_SERVER_PORT;
const originalDataAccess = import.meta.env.VITE_DATA_ACCESS;
const originalDefaultDataAccess = import.meta.env.VITE_DEFAULT_DATA_ACCESS;

beforeEach(() => {
  setActivePinia(createPinia());

  import.meta.env.MODE = originalEnvMode;
  import.meta.env.VITE_SERVER_PORT = originalServerPort;
  import.meta.env.VITE_DEFAULT_SERVER_PORT = originalDefaultServerPort;
  import.meta.env.VITE_DATA_ACCESS = originalDataAccess;
  import.meta.env.VITE_DEFAULT_DATA_ACCESS = originalDefaultDataAccess;
});

describe('useConfig', () => {
  test('when in development mode and has custom server port and data access should return custom values', () => {
    import.meta.env.MODE = 'development';
    import.meta.env.VITE_SERVER_PORT = '5000';
    import.meta.env.VITE_DATA_ACCESS = 'web';
    import.meta.env.VITE_DEFAULT_SERVER_PORT = '4001';
    import.meta.env.VITE_DEFAULT_DATA_ACCESS = 'api';

    config = useConfig();
    expect(config).toEqual({
      baseUrl: 'http://localhost:5000',
      dataAccess: 'web',
    });
  });

  test('when in development mode but has no custom server port and data access should return default values', () => {
    import.meta.env.MODE = 'development';
    import.meta.env.VITE_DEFAULT_SERVER_PORT = '4001';
    import.meta.env.VITE_DEFAULT_DATA_ACCESS = 'api';

    config = useConfig();
    expect(config).toEqual({
      baseUrl: 'http://localhost:4001',
      dataAccess: 'api',
    });
  });

  test('when in staging mode should return staging values', () => {
    import.meta.env.MODE = 'staging';
    import.meta.env.VITE_SERVER_PORT = '5000';
    import.meta.env.VITE_DATA_ACCESS = 'api';
    import.meta.env.VITE_DEFAULT_SERVER_PORT = '4001';
    import.meta.env.VITE_DEFAULT_DATA_ACCESS = 'api';

    config = useConfig();
    expect(config).toEqual({
      baseUrl: '',
      dataAccess: 'web',
    });
  });

  test('when in production mode should return production values', () => {
    import.meta.env.MODE = 'production';
    import.meta.env.VITE_SERVER_PORT = '5000';
    import.meta.env.VITE_DATA_ACCESS = 'web';
    import.meta.env.VITE_DEFAULT_SERVER_PORT = '4001';
    import.meta.env.VITE_DEFAULT_DATA_ACCESS = 'web';

    config = useConfig();
    expect(config).toEqual({
      baseUrl: '',
      dataAccess: 'api',
    });
  });
});
