import { setActivePinia, createPinia } from 'pinia';
import { useLogsStore } from '../../src/stores/logs.js';

let logsStore;

beforeEach(() => {
  setActivePinia(createPinia());
  logsStore = useLogsStore();
});

describe('saveLog', () => {
  test('should store new log message', () => {
    expect(logsStore.tailLog()).toBe('');
    logsStore.saveLog('[LOG] message 1');
    expect(logsStore.tailLog()).toBe('[LOG] message 1');
  });
});

describe('tailLog', () => {
  test('when less than 20 messages should return all in desc order', () => {
    expect(logsStore.tailLog()).toBe('');
    for (let i = 0; i < 10; i++) {
      logsStore.saveLog(`[LOG] message ${i}`);
    }
    expect(logsStore.tailLog()).toEqual(
      `[LOG] message 9\n` +
      `[LOG] message 8\n` +
      `[LOG] message 7\n` +
      `[LOG] message 6\n` +
      `[LOG] message 5\n` +
      `[LOG] message 4\n` +
      `[LOG] message 3\n` +
      `[LOG] message 2\n` +
      `[LOG] message 1\n` +
      `[LOG] message 0`
    );
  });

  test('when more than 20 messages should return last 20 messages in desc order', () => {
    expect(logsStore.tailLog()).toBe('');
    for (let i = 0; i < 25; i++) {
      logsStore.saveLog(`[LOG] message ${i}`);
    }
    expect(logsStore.tailLog()).toEqual(
      `[LOG] message 24\n` +
      `[LOG] message 23\n` +
      `[LOG] message 22\n` +
      `[LOG] message 21\n` +
      `[LOG] message 20\n` +
      `[LOG] message 19\n` +
      `[LOG] message 18\n` +
      `[LOG] message 17\n` +
      `[LOG] message 16\n` +
      `[LOG] message 15\n` +
      `[LOG] message 14\n` +
      `[LOG] message 13\n` +
      `[LOG] message 12\n` +
      `[LOG] message 11\n` +
      `[LOG] message 10\n` +
      `[LOG] message 9\n` +
      `[LOG] message 8\n` +
      `[LOG] message 7\n` +
      `[LOG] message 6\n` +
      `[LOG] message 5`
    );
  });
});
