const path = require('path');
const request = require('supertest');

const { startServer } = require('../index.js');

const config = {
  dataStore: 'fs',
  initDir: './_init',
  dataDir: './data',
  logFile: './debug.log',
  modulesDir: './server/modules',
  uploadDir: './uploads',
};
const logger = require('../logger.js')({ config });

jest.mock('../logger.js', () => {
  return ({ config }) => {
    return {
      log: () => {},
      error: () => {},
      warn: () => {},
      tailLog: () => {},
    };
  };
});

const port = 4999;
const appConfigPath = path.join(__dirname, '__fixtures__', 'app_config.json');
const appRootDir = path.join(__dirname, '../../');
const logsRootDir = path.join(__dirname, 'data');

let server = null;

beforeAll(async () => {
  server = await startServer({ port, appConfigPath, appRootDir, logsRootDir  });
});

afterAll(() => {
  if (server) {
    server.close();
  }
});

describe('server routes implemented', () => {
  test('/api/schemas', () => {
    return request(server)
      .get('/api/schemas')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });

  test('/api/schemas/alerts', () => {
    return request(server)
      .get('/api/schemas/alerts')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });

  test('/api/schemas/alerts/download', () => {
    return request(server)
      .get('/api/schemas/alerts/download')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });

  test('/api/schemas/alerts/upload', () => {
    return request(server)
      .put('/api/schemas/alerts/upload', {})
      .expect('Content-Type', 'application/json; charset=utf-8')
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });

  test('/api/indexes', () => {
    return request(server)
      .get('/api/indexes')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });

  test('/api/indexes', () => {
    return request(server)
      .put('/api/indexes', {})
      .expect('Content-Type', 'application/json; charset=utf-8')
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });

  test('/api/countries', () => {
    return request(server)
      .get('/api/countries')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });

  test('/api/logs', () => {
    return request(server)
      .post('/api/logs')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });

  test('/api/invalid', () => {
    return request(server)
      .get('/api/invalid')
      .then((response) => {
        expect(response.statusCode).toBe(302);
      });
  });
});
