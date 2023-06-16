const fs = require('fs');

beforeEach(() => {
  jest
    .useFakeTimers()
    .setSystemTime(new Date('2023-01-01T01:23:45'));

  jest.mock('fs');
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('logger', () => {
  const mockWrite = jest.fn();
  jest.spyOn(fs, 'createWriteStream').mockImplementation(() => {
    return {
      write: mockWrite,
    };
  });
  const mockStdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});

  const config = { logFile: 'debug.log' };
  const { log, error, warn, tailLog } = require('../logger.js')({ config });

  test('log()', () => {
    expect(mockWrite).not.toHaveBeenCalled();
    expect(mockStdout).not.toHaveBeenCalled();
    log('test', { foo: 'bar' });
    const formattedMessage = `[1/1/2023, 1:23:45 AM][LOG] test: {"foo":"bar"}\n`;
    expect(mockWrite).toHaveBeenCalledWith(formattedMessage);
    expect(mockStdout).toHaveBeenCalledWith(formattedMessage);
  });

  test('error()', () => {
    expect(mockWrite).not.toHaveBeenCalled();
    expect(mockStdout).not.toHaveBeenCalled();
    error('test', { foo: 'bar' });
    const formattedMessage = `[1/1/2023, 1:23:45 AM][ERROR] test: {"foo":"bar"}\n`;
    expect(mockWrite).toHaveBeenCalledWith(formattedMessage);
    expect(mockStdout).toHaveBeenCalledWith(formattedMessage);
  });

  test('warn()', () => {
    expect(mockWrite).not.toHaveBeenCalled();
    expect(mockStdout).not.toHaveBeenCalled();
    warn('test', { foo: 'bar' });
    const formattedMessage = `[1/1/2023, 1:23:45 AM][WARN] test: {"foo":"bar"}\n`;
    expect(mockWrite).toHaveBeenCalledWith(formattedMessage);
    expect(mockStdout).toHaveBeenCalledWith(formattedMessage);
  });

  test('tailLog() - has not exceeded cache length', () => {
    expect(mockWrite).not.toHaveBeenCalled();
    expect(mockStdout).not.toHaveBeenCalled();
    for (let i = 0; i < 20; i++) {
      warn('test', { i, foo: 'bar' });
    }
    const formattedMessages = Array.from(new Array(20)).map((_, i) => {
      const formattedMessage = `[1/1/2023, 1:23:45 AM][WARN] test: {"i":${i},"foo":"bar"}\n`;
      expect(mockWrite).toHaveBeenCalledWith(formattedMessage);
      expect(mockStdout).toHaveBeenCalledWith(formattedMessage);
      return formattedMessage;
    });
    expect(tailLog()).toStrictEqual(formattedMessages.reverse().join(''));
  });

  test('tailLog() - has exceeded cache length', () => {
    expect(mockWrite).not.toHaveBeenCalled();
    expect(mockStdout).not.toHaveBeenCalled();
    for (let i = 0; i < 25; i++) {
      warn('test', { i, foo: 'bar' });
    }
    const formattedMessages = Array.from(new Array(20)).map((_, i) => {
      const formattedMessage = `[1/1/2023, 1:23:45 AM][WARN] test: {"i":${i + 5},"foo":"bar"}\n`;
      expect(mockWrite).toHaveBeenCalledWith(formattedMessage);
      expect(mockStdout).toHaveBeenCalledWith(formattedMessage);
      return formattedMessage;
    });
    expect(tailLog()).toStrictEqual(formattedMessages.reverse().join(''));
  });
});
