import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import {
  TButton
} from 'coffeebrew-vue-components';
import { useRouter } from 'vue-router';
import { useEventsStore } from '../../src/stores/events.js';
import { useAlertsStore } from '../../src/stores/alerts.js';
import TopNav from '../../src/components/TopNav.vue';

vi.mock('vue-router', () => {
  return {
    useRouter: vi.fn(),
    useRoute: vi.fn(),
  };
});

const routes = [
  {
    path: '/contacts',
    name: 'Contacts',
  },
  {
    path: '/contacts/:contactId',
    name: 'View Contact',
    props: true,
    meta: {
      parentRoute: { name: 'Contacts' },
      hidden: true,
    },
    children: [
      {
        path: '',
        name: 'Contact Details',
        props: true,
        meta: {
          parentRoute: { name: 'Contacts' },
          hidden: true,
        },
      },
    ],
  },
];

const push = vi.fn();

let events;
let alerts;

beforeEach(async() => {
  setActivePinia(createPinia());
  events = useEventsStore();
  alerts = useAlertsStore();

  useRouter.mockImplementation(() => {
    return {
      getRoutes: () => {
        return routes;
      },
      currentRoute: {
        value: {
          path: '/',
          name: 'Home',
        },
      },
      push,
    };
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TopNav.vue', () => {
  test('should render nav buttons', async() => {
    const wrapper = await mount(TopNav);

    await flushPromises();

    const navContainer = wrapper.get('.nav-container');
    expect(navContainer.exists()).toBeTruthy();

    const togglesContainer = navContainer.get('.toggles');
    expect(togglesContainer.exists()).toBeTruthy();
  });

  test('when has no parent route should not render back button', async() => {
    useRouter.mockImplementation(() => {
      return {
        currentRoute: {
          value: {
            path: '/contacts',
            name: 'Contacts',
          },
        },
      };
    });

    const wrapper = await mount(TopNav);

    await flushPromises();

    const navContainer = wrapper.get('.nav-container');
    const routesContainer = navContainer.get('.routes');
    const routeContainer = routesContainer.find('.route');
    expect(routeContainer.exists()).toBeFalsy();
  });

  test('when has parent route should render back button', async() => {
    useRouter.mockImplementation(() => {
      return {
        getRoutes: () => {
          return routes;
        },
        currentRoute: {
          value: {
            path: '/contacts/1',
            name: 'Contacts Details',
            meta: {
              parentRoute: { name: 'Contacts' },
            },
          },
        },
        push,
      };
    });

    const wrapper = await mount(TopNav);

    await flushPromises();

    const navContainer = wrapper.get('.nav-container');
    const routesContainer = navContainer.get('.routes');
    const routeContainer = routesContainer.find('.route');
    const routeButton = routeContainer.findComponent(TButton);
    expect(routeButton.exists()).toBeTruthy();

    await routeButton.trigger('click');
    expect(push).toHaveBeenCalledWith({ name: 'Contacts' });
  });

  test('when parent route does not exist should do nothing on back button click', async() => {
    useRouter.mockImplementation(() => {
      return {
        getRoutes: () => {
          return routes;
        },
        currentRoute: {
          value: {
            path: '/contacts/1',
            name: 'Contacts Details',
            meta: {
              parentRoute: { name: 'Unknown' },
            },
          },
        },
        push,
      };
    });

    const wrapper = await mount(TopNav);

    await flushPromises();

    const navContainer = wrapper.get('.nav-container');
    const routesContainer = navContainer.get('.routes');
    const routeContainer = routesContainer.find('.route');
    const routeButton = routeContainer.findComponent(TButton);
    expect(routeButton.exists()).toBeTruthy();

    await routeButton.trigger('click');
    expect(push).not.toHaveBeenCalled();
  });

  test('should toggle theme', async() => {
    const eventsSpy = vi.spyOn(events, 'emitEvent');

    const wrapper = await mount(TopNav);

    await flushPromises();

    const navContainer = wrapper.get('.nav-container');
    const togglesContainer = navContainer.get('.toggles');
    const toggles = togglesContainer.findAllComponents(TButton);

    const themeToggle = toggles[0];
    expect(themeToggle.exists()).toBeTruthy();

    expect(wrapper.vm.theme).toBeTruthy();
    expect(wrapper.vm.themeIcon).toBe('fa-solid fa-moon');
    await themeToggle.trigger('click');

    expect(wrapper.vm.theme).toBeFalsy();
    expect(wrapper.vm.themeIcon).toBe('fa-solid fa-sun');
    expect(eventsSpy).toHaveBeenCalledWith('themeChange', { newVal: false });
  });

  test('should go to dashboard page', async() => {
    const wrapper = await mount(TopNav);

    await flushPromises();

    const navContainer = wrapper.get('.nav-container');
    const togglesContainer = navContainer.get('.toggles');
    const toggles = togglesContainer.findAllComponents(TButton);

    const dashboardToggle = toggles[1];
    expect(dashboardToggle.exists()).toBeTruthy();
    await dashboardToggle.trigger('click');
    expect(push).toHaveBeenCalledWith({ name: 'Home' });
  });

  test('should go to configure page', async() => {
    const wrapper = await mount(TopNav);

    await flushPromises();

    const navContainer = wrapper.get('.nav-container');
    const togglesContainer = navContainer.get('.toggles');
    const toggles = togglesContainer.findAllComponents(TButton);

    const configureToggle = toggles[2];
    expect(configureToggle.exists()).toBeTruthy();
    await configureToggle.trigger('click');
    expect(push).toHaveBeenCalledWith({ name: 'Configure' });
  });

  test('should go to logs page', async() => {
    const wrapper = await mount(TopNav);

    await flushPromises();

    const navContainer = wrapper.get('.nav-container');
    const togglesContainer = navContainer.get('.toggles');
    const toggles = togglesContainer.findAllComponents(TButton);

    const logsToggle = toggles[3];
    expect(logsToggle.exists()).toBeTruthy();
    await logsToggle.trigger('click');
    expect(push).toHaveBeenCalledWith({ name: 'System Logs' });
  });

  test('should go to data admin page', async() => {
    const wrapper = await mount(TopNav);

    await flushPromises();

    const navContainer = wrapper.get('.nav-container');
    const togglesContainer = navContainer.get('.toggles');
    const toggles = togglesContainer.findAllComponents(TButton);

    const dataAdminToggle = toggles[4];
    expect(dataAdminToggle.exists()).toBeTruthy();
    await dataAdminToggle.trigger('click');
    expect(push).toHaveBeenCalledWith({ name: 'Data Admin' });
  });

  test('should go to inbox page', async() => {
    const wrapper = await mount(TopNav);

    await flushPromises();

    const navContainer = wrapper.get('.nav-container');
    const togglesContainer = navContainer.get('.toggles');
    const toggles = togglesContainer.findAllComponents(TButton);

    const inboxToggle = toggles[5];
    expect(inboxToggle.exists()).toBeTruthy();
    await inboxToggle.trigger('click');
    expect(push).toHaveBeenCalledWith({ name: 'Inbox' });
  });

  test('should toggle alerts', async() => {
    const alertsSpy = vi.spyOn(alerts, 'toggle');
    const wrapper = await mount(TopNav);

    await flushPromises();

    const navContainer = wrapper.get('.nav-container');
    const togglesContainer = navContainer.get('.toggles');
    const toggles = togglesContainer.findAllComponents(TButton);

    const alertsToggle = toggles[6];
    expect(alertsToggle.exists()).toBeTruthy();
    await alertsToggle.trigger('click');
    expect(alertsSpy).toHaveBeenCalled();
  });
});
