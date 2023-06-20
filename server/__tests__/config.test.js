const fs = require('fs');
const utils = require('../utils.js');

beforeEach(() => {
  jest.mock('fs');
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('config', () => {
  const appConfigPath = 'configs/';
  const appRootDir = 'apps/';
  const logsRootDir = 'configs/logs/';

  const { readConfigFile } = require('../config.js');

  test('readConfigFile() - relative paths', () => {
    const mockFileContent = JSON.stringify({
      dataRootDir: 'documents/',
      initDir: '_init',
      dataDir: 'data',
      logFile: 'debug.log',
      modulesDir: 'modules',
      uploadDir: 'uploads',
    });

    const mockReadFileSync = jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      return mockFileContent;
    });

    const result = readConfigFile({ utils, appConfigPath, appRootDir, logsRootDir });
    expect(result).toStrictEqual({
      dataRootDir: 'documents/',
      initDir: 'apps/_init',
      dataDir: 'documents/data',
      logFile: 'configs/logs/debug.log',
      modulesDir: 'apps/modules',
      uploadDir: 'documents/uploads',
    });
  });

  test('readConfigFile() - absolute paths', () => {
    const mockFileContent = JSON.stringify({
      dataRootDir: '/users/me/documents/',
      initDir: '/users/me/_init',
      dataDir: '/users/me/data',
      logFile: '/users/me/debug.log',
      modulesDir: '/users/me/modules',
      uploadDir: '/users/me/uploads',
    });

    const mockReadFileSync = jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      return mockFileContent;
    });

    const result = readConfigFile({ utils, appConfigPath, appRootDir, logsRootDir });
    expect(result).toStrictEqual({
      dataRootDir: '/users/me/documents/',
      initDir: '/users/me/_init',
      dataDir: '/users/me/data',
      logFile: '/users/me/debug.log',
      modulesDir: '/users/me/modules',
      uploadDir: '/users/me/uploads',
    });
  });

  test('readConfigFile() - empty config file', () => {
    const mockFileContent = JSON.stringify({});

    const mockReadFileSync = jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      return mockFileContent;
    });

    const result = readConfigFile({ utils, appConfigPath, appRootDir, logsRootDir });
    expect(result).toStrictEqual({
      initDir: 'apps/_init',
      dataDir: 'apps/data',
      logFile: 'configs/logs/debug.log',
      modulesDir: 'apps/modules',
      uploadDir: 'apps/uploads',
    });
  });
});
