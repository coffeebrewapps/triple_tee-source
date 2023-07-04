import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useAlertsStore } from '../../src/stores/alerts.js';
import { useSystemConfigsStore } from '../../src/stores/systemConfigs.js';
import SystemAlerts from '../../src/components/SystemAlerts.vue';

let alerts;
let systemConfigsStore;

beforeEach(async() => {
  setActivePinia(createPinia());
  alerts = useAlertsStore();
  systemConfigsStore = useSystemConfigsStore();
  systemConfigsStore.updateSystemConfigs({
    timezone: 'Asia/Singapore',
  });

  vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
    resolvedOptions: () => ({
      locale: 'en-SG',
    }),
  }));

  vi.useFakeTimers();
  vi.setSystemTime(new Date('2023-04-12T12:34:56.123Z'));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('SystemAlerts.vue', () => {
  test('should render alerts when there is message', async() => {
    alerts.addAlert({
      heading: 'New payment due',
      message: 'You have a payment to Google.com due in 3 days',
    });

    vi.advanceTimersByTime(60000);

    alerts.addAlert({
      heading: 'New income pending',
      message: 'Company ABC is due to make payment in 5 days',
    });

    const wrapper = await mount(SystemAlerts);

    await flushPromises();

    const alertsContainer = wrapper.get('.alerts-container');
    expect(alertsContainer.exists()).toBeTruthy();
    expect(alertsContainer.classes()).toContain('hide');

    const messageContainers = alertsContainer.findAll('.message-container');
    expect(messageContainers.length).toBe(2);

    const message1 = messageContainers[0];
    const message1Heading = message1.get('.heading');
    expect(message1Heading.exists()).toBeTruthy();
    expect(message1Heading.text()).toBe('New income pending');
    const message1Content = message1.get('.content');
    expect(message1Content.exists()).toBeTruthy();
    expect(message1Content.text()).toBe('Company ABC is due to make payment in 5 days');
    const message1Timestamp = message1.get('.timestamp');
    expect(message1Timestamp.exists()).toBeTruthy();
    expect(message1Timestamp.text()).toBe('12/04/2023, 8:35:56 pm');

    const message2 = messageContainers[1];
    const message2Heading = message2.get('.heading');
    expect(message2Heading.exists()).toBeTruthy();
    expect(message2Heading.text()).toBe('New payment due');
    const message2Content = message2.get('.content');
    expect(message2Content.exists()).toBeTruthy();
    expect(message2Content.text()).toBe('You have a payment to Google.com due in 3 days');
    const message2Timestamp = message2.get('.timestamp');
    expect(message2Timestamp.exists()).toBeTruthy();
    expect(message2Timestamp.text()).toBe('12/04/2023, 8:34:56 pm');
  });

  test('should hide container when toggle close button', async() => {
    const wrapper = await mount(SystemAlerts);

    await flushPromises();

    const alertsContainer = wrapper.get('.alerts-container');
    expect(alertsContainer.exists()).toBeTruthy();
    expect(alertsContainer.classes()).toContain('hide');

    const toggle = alertsContainer.get('.toggle');
    expect(toggle.exists()).toBeTruthy();

    toggle.trigger('click');

    await flushPromises();

    expect(alertsContainer.classes()).toContain('show');

    toggle.trigger('click');

    await flushPromises();

    expect(alertsContainer.classes()).toContain('hide');
  });
});
