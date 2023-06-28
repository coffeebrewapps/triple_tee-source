import { setActivePinia, createPinia } from 'pinia';
import { useLogger } from '../../src/utils/logger.js';
import { useLogsStore } from '../../src/stores/logs.js';

vi.mock('../../src/stores/systemConfigs.js', () => {
  return {
    useSystemConfigsStore: () => {
      return {
        getSystemConfigs: () => {
          return {
            timezone: 'Asia/Singapore',
          };
        },
      };
    },
  };
});

let logsStore;
let logger;

beforeEach(() => {
  setActivePinia(createPinia());
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2023-04-12T12:34:56.123Z'));

  vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
    resolvedOptions: () => ({
      locale: 'en-SG',
    }),
  }));

  logsStore = useLogsStore();
  logger = useLogger();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('useLogger', () => {
  test('should return logger functions', () => {
    expect(logger).toEqual(expect.objectContaining({
      log: expect.anything(),
      error: expect.anything(),
      warn: expect.anything(),
      debug: expect.anything(),
      tailLog: expect.anything(),
    }));
  });
});

describe('log', () => {
  test('should save log to store and log to console', () => {
    const storeSpy = vi.spyOn(logsStore, 'saveLog');
    const consoleSpy = vi.spyOn(console, 'log');

    logger.log('Created data successfully', { id: '1' });
    const formattedMessage = '[12/04/2023, 8:34:56 pm][LOG] Created data successfully: {"id":"1"}\n';

    expect(storeSpy).toHaveBeenCalledWith(formattedMessage);
    expect(consoleSpy).toHaveBeenCalledWith(formattedMessage);
  });
});

describe('error', () => {
  test('should save log to store and log to console', () => {
    const storeSpy = vi.spyOn(logsStore, 'saveLog');
    const consoleSpy = vi.spyOn(console, 'error');

    logger.error('Failed to create data', { id: '1' });
    const formattedMessage = '[12/04/2023, 8:34:56 pm][ERROR] Failed to create data: {"id":"1"}\n';

    expect(storeSpy).toHaveBeenCalledWith(formattedMessage);
    expect(consoleSpy).toHaveBeenCalledWith(formattedMessage);
  });
});

describe('warn', () => {
  test('should save log to store and log to console', () => {
    const storeSpy = vi.spyOn(logsStore, 'saveLog');
    const consoleSpy = vi.spyOn(console, 'warn');

    logger.warn('Data may not be compatible', { id: '1' });
    const formattedMessage = '[12/04/2023, 8:34:56 pm][WARN] Data may not be compatible: {"id":"1"}\n';

    expect(storeSpy).toHaveBeenCalledWith(formattedMessage);
    expect(consoleSpy).toHaveBeenCalledWith(formattedMessage);
  });
});

describe('debug', () => {
  test('should save log to store and log to console', () => {
    const storeSpy = vi.spyOn(logsStore, 'saveLog');
    const consoleSpy = vi.spyOn(console, 'debug');

    logger.debug('Converted data from json to string', { id: '1' });
    const formattedMessage = '[12/04/2023, 8:34:56 pm][DEBUG] Converted data from json to string: {"id":"1"}\n';

    expect(storeSpy).toHaveBeenCalledWith(formattedMessage);
    expect(consoleSpy).toHaveBeenCalledWith(formattedMessage);
  });
});

describe('tailLog', () => {
  test('should tail logs from store', () => {
    for (let i = 0; i < 25; i++) {
      logger.log('Log', { i });
    }

    const expectedLogs = `` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":24}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":23}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":22}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":21}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":20}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":19}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":18}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":17}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":16}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":15}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":14}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":13}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":12}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":11}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":10}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":9}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":8}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":7}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":6}\n` +
      `\n` +
      `[12/04/2023, 8:34:56 pm][LOG] Log: {"i":5}\n`;

    const logs = logger.tailLog();

    expect(logs).toEqual(expectedLogs);
  });
});
