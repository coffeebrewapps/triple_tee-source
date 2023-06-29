import { setActivePinia, createPinia } from 'pinia';
import { useAlertsStore } from '../../src/stores/alerts.js';

let alertsStore;

beforeEach(() => {
  setActivePinia(createPinia());
  alertsStore = useAlertsStore();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2023-04-28T12:34:56.123Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('alerts', () => {
  test('should return alerts', () => {
    expect(alertsStore.alerts).toEqual([]);
  });
});

describe('showAlert', () => {
  test('should return show alert state', () => {
    expect(alertsStore.showAlert).toBeFalsy();
  });
});

describe('show', () => {
  test('should set set alert state to true', () => {
    expect(alertsStore.showAlert).toBeFalsy();
    alertsStore.show();
    expect(alertsStore.showAlert).toBeTruthy();
  });
});

describe('hide', () => {
  test('should set set alert state to false', () => {
    alertsStore.show();
    expect(alertsStore.showAlert).toBeTruthy();
    alertsStore.hide();
    expect(alertsStore.showAlert).toBeFalsy();
  });
});

describe('toggle', () => {
  test('when show alert state is false should set to true', () => {
    expect(alertsStore.showAlert).toBeFalsy();
    alertsStore.toggle();
    expect(alertsStore.showAlert).toBeTruthy();
  });

  test('when show alert state is true should set to false', () => {
    alertsStore.show();
    expect(alertsStore.showAlert).toBeTruthy();
    alertsStore.toggle();
    expect(alertsStore.showAlert).toBeFalsy();
  });
});

describe('addAlert', () => {
  test('when no existing alerts should add new alert', () => {
    expect(alertsStore.alerts).toEqual([]);

    alertsStore.addAlert({
      heading: 'New payment due',
      message: 'You have a new payment due to google.com on 2023-05-01',
    });

    expect(alertsStore.alerts).toEqual([
      {
        heading: 'New payment due',
        message: 'You have a new payment due to google.com on 2023-05-01',
        timestamp: new Date('2023-04-28T12:34:56.123Z'),
      },
    ]);
  });

  test('when there are existing alerts should add new alert to latest', () => {
    alertsStore.addAlert({
      heading: 'New payment due',
      message: 'You have a new payment due to google.com on 2023-05-01',
    });

    expect(alertsStore.alerts).toEqual([
      {
        heading: 'New payment due',
        message: 'You have a new payment due to google.com on 2023-05-01',
        timestamp: new Date('2023-04-28T12:34:56.123Z'),
      },
    ]);

    alertsStore.addAlert({
      heading: 'New invoice pending',
      message: 'You have a new invoice to Company ABC pending generation on 2023-05-01',
    });

    expect(alertsStore.alerts).toEqual([
      {
        heading: 'New invoice pending',
        message: 'You have a new invoice to Company ABC pending generation on 2023-05-01',
        timestamp: new Date('2023-04-28T12:34:56.123Z'),
      },
      {
        heading: 'New payment due',
        message: 'You have a new payment due to google.com on 2023-05-01',
        timestamp: new Date('2023-04-28T12:34:56.123Z'),
      },
    ]);
  });
});

describe('clearAlert', () => {
  test('should clear alerts', () => {
    alertsStore.addAlert({
      heading: 'New payment due',
      message: 'You have a new payment due to google.com on 2023-05-01',
    });

    alertsStore.addAlert({
      heading: 'New invoice pending',
      message: 'You have a new invoice to Company ABC pending generation on 2023-05-01',
    });

    expect(alertsStore.alerts).toEqual([
      {
        heading: 'New invoice pending',
        message: 'You have a new invoice to Company ABC pending generation on 2023-05-01',
        timestamp: new Date('2023-04-28T12:34:56.123Z'),
      },
      {
        heading: 'New payment due',
        message: 'You have a new payment due to google.com on 2023-05-01',
        timestamp: new Date('2023-04-28T12:34:56.123Z'),
      },
    ]);

    alertsStore.clearAlerts();
    expect(alertsStore.alerts).toEqual([]);
  });
});
