import { setActivePinia, createPinia } from 'pinia';
import { useDataStore } from '../../src/stores/data.js';

let dataStore;

beforeEach(() => {
  setActivePinia(createPinia());
  dataStore = useDataStore();
});

describe('useDataStore', () => {
  test('should return dataAccess functions', () => {
    expect(dataStore).toEqual(expect.objectContaining({
      initData: expect.anything(),
      listSchemas: expect.anything(),
      viewSchemas: expect.anything(),
      list: expect.anything(),
      view: expect.anything(),
      create: expect.anything(),
      createIfNotExists: expect.anything(),
      update: expect.anything(),
      remove: expect.anything(),
      isUsed: expect.anything(),
      download: expect.anything(),
      upload: expect.anything(),
      downloadIndexes: expect.anything(),
      uploadIndexes: expect.anything(),
      atomic: expect.anything(),
      downloadRawFile: expect.anything(),
      indexCache: expect.anything(),
    }));
  });
});

describe('init', () => {
  test('when not initialized should init dataAccess', async() => {
    expect(dataStore.listSchemas()).toEqual([]);
    await dataStore.init();
    expect(dataStore.listSchemas()).toEqual(expect.arrayContaining([
      'alerts',
    ]));
  });

  test('when already initialized should not init dataAccess', async() => {
    expect(dataStore.listSchemas()).toEqual([]);
    await dataStore.init();
    const schemas = dataStore.listSchemas();
    await dataStore.init();
    expect(dataStore.listSchemas()).toEqual(schemas);
  });
});

describe('registerFunction', () => {
  test('when function type has no existing function should register new function', () => {
    expect(dataStore.listCustomFunctions()).toEqual({});

    const viewLatestConfig = () => {};
    dataStore.registerFunction('system_configs', 'list', 'latest', viewLatestConfig);

    expect(dataStore.listCustomFunctions()).toEqual({
      system_configs: {
        list: {
          latest: expect.anything(),
        },
      },
    });
  });

  test('when function type has existing functions should register new function', () => {
    const viewLatestConfig = () => {};
    dataStore.registerFunction('system_configs', 'list', 'latest', viewLatestConfig);

    expect(dataStore.listCustomFunctions()).toEqual({
      system_configs: {
        list: {
          latest: expect.anything(),
        },
      },
    });

    const viewTimezones = () => {};
    dataStore.registerFunction('system_configs', 'list', 'timezones', viewTimezones);

    expect(dataStore.listCustomFunctions()).toEqual({
      system_configs: {
        list: {
          latest: expect.anything(),
          timezones: expect.anything(),
        },
      },
    });
  });

  test('when function type has other existing function types should register new function', () => {
    const viewLatestConfig = () => {};
    dataStore.registerFunction('system_configs', 'list', 'latest', viewLatestConfig);

    expect(dataStore.listCustomFunctions()).toEqual({
      system_configs: {
        list: {
          latest: expect.anything(),
        },
      },
    });

    const viewTimezone = () => {};
    dataStore.registerFunction('system_configs', 'view', 'timezone', viewTimezone);

    expect(dataStore.listCustomFunctions()).toEqual({
      system_configs: {
        list: {
          latest: expect.anything(),
        },
        view: {
          timezone: expect.anything(),
        },
      },
    });
  });
});

describe('customFunctionsForModel', () => {
  test('when model has function for function type should return function', () => {
    const viewLatestConfig = () => {};
    dataStore.registerFunction('system_configs', 'list', 'latest', viewLatestConfig);

    expect(dataStore.customFunctionsForModel('system_configs', 'list')).toEqual({
      latest: expect.anything(),
    });
  });

  test('when model has no function for function type should return undefined', () => {
    const viewLatestConfig = () => {};
    dataStore.registerFunction('system_configs', 'list', 'latest', viewLatestConfig);

    expect(dataStore.customFunctionsForModel('system_configs', 'view')).toBeUndefined();
  });

  test('when model has no existing function should return undefined', () => {
    const viewLatestConfig = () => {};
    dataStore.registerFunction('system_configs', 'list', 'latest', viewLatestConfig);

    expect(dataStore.customFunctionsForModel('tags', 'view')).toBeUndefined();
  });
});
