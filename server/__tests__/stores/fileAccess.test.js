const path = require('path');
const fs = require('fs');

const {
  emptyModels,
  prefilledModels,
  initIndexes,
  initDataHasExisting,
} = require('../__fixtures__/fileAccess.js');

const testDataDir = path.join(__dirname, '../data/fileAccess');
const config = { dataDir: testDataDir };
const logger = {
  log: () => {},
  error: () => {},
};
const utils = {};

const initDir = path.join(__dirname, '../../../_init');
const initSchemas = require(path.join(initDir, 'schemas.json'));

beforeAll(() => {
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }
});

afterAll(() => {
  if (fs.existsSync(testDataDir)) {
    fs.rmSync(testDataDir, { recursive: true, force: true });
  }
});

describe('fileAccess', () => {
  const fileAccess = require('../../stores/fileAccess.js')({ config, logger, utils });

  const allModels = emptyModels.concat(prefilledModels);

  test('initData - has no existing data', async() => {
    const { schemas, data, indexes } = await fileAccess.initData('_schemas', '_indexes');

    expect(data.map(d => d.modelClass).sort()).toEqual(allModels.sort());

    expect(schemas).toEqual(initSchemas);
    expect(indexes).toEqual(initIndexes);

    emptyModels.forEach((modelClass) => {
      const model = data.find(d => d.modelClass === modelClass);
      expect(Object.keys(model.data).length).toBe(0);
    });

    prefilledModels.forEach((modelClass) => {
      const model = data.find(d => d.modelClass === modelClass);
      expect(Object.keys(model.data).length).toBeGreaterThan(0);
    });
  });

  test('initData - has existing data', async() => {
    const existingIndexes = initDataHasExisting().indexes;

    fs.writeFileSync(path.join(testDataDir, '_indexes.json'), JSON.stringify(existingIndexes));

    const { schemas, data, indexes } = await fileAccess.initData('_schemas', '_indexes');

    expect(data.map(d => d.modelClass).sort()).toEqual(allModels.sort());

    expect(schemas).toEqual(initSchemas);
    expect(indexes).toEqual(existingIndexes);

    emptyModels.forEach((modelClass) => {
      const model = data.find(d => d.modelClass === modelClass);
      expect(Object.keys(model.data).length).toBe(0);
    });

    prefilledModels.forEach((modelClass) => {
      const model = data.find(d => d.modelClass === modelClass);
      expect(Object.keys(model.data).length).toBeGreaterThan(0);
    });

    fs.writeFileSync(path.join(testDataDir, '_indexes.json'), JSON.stringify(initIndexes));
  });
});
