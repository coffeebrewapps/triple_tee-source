import { setActivePinia, createPinia } from 'pinia';
import { useSystemConfigsStore } from '../../src/stores/systemConfigs.js';

let systemConfigsStore;

beforeEach(() => {
  setActivePinia(createPinia());
  systemConfigsStore = useSystemConfigsStore();
});

describe('getSystemConfigs', () => {
  test('should return system configs object', () => {
    expect(systemConfigsStore.getSystemConfigs()).toEqual({});
  });
});

describe('updateSystemConfigs', () => {
  test('should update system configs object', () => {
    const config = {
      id: '1',
      baseCurrencyId: '1',
      baseContactId: '1',
      timezone: 'Asia/Singapore',
      tagFormat: '{{ category }}:{{ name }}',
    };

    expect(systemConfigsStore.getSystemConfigs()).toEqual({});
    systemConfigsStore.updateSystemConfigs(config);
    expect(systemConfigsStore.getSystemConfigs()).toEqual({
      id: '1',
      baseCurrencyId: '1',
      baseContactId: '1',
      timezone: 'Asia/Singapore',
      tagFormat: '{{ category }}:{{ name }}',
    });
  });
});

describe('clearSystemConfigs', () => {
  test('should clear system configs object', () => {
    const config = {
      id: '1',
      baseCurrencyId: '1',
      baseContactId: '1',
      timezone: 'Asia/Singapore',
      tagFormat: '{{ category }}:{{ name }}',
    };

    systemConfigsStore.updateSystemConfigs(config);
    expect(systemConfigsStore.getSystemConfigs()).toEqual({
      id: '1',
      baseCurrencyId: '1',
      baseContactId: '1',
      timezone: 'Asia/Singapore',
      tagFormat: '{{ category }}:{{ name }}',
    });

    systemConfigsStore.clearSystemConfigs();
    expect(systemConfigsStore.getSystemConfigs()).toEqual({});
  });
});
