import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { useSystemConfigsStore } from '../src/stores/systemConfigs.js';
import { useNavStore } from '../src/stores/nav.js';
import App from '../src/App.vue';

vi.mock('../src/utils/dataAccess.js', () => {
  return {
    useDataAccess: () => {
      return {
        list: vi.fn((modelClass, params, suffix) => {
          return new Promise((resolve, reject) => {
            resolve({
              record: {
                id: '1',
                baseCurrencyId: '1',
                baseContactId: '1',
              },
            });
          });
        }),
      };
    },
  };
});

let router;
let systemConfigsStore;
let navigator;

beforeEach(async() => {
  setActivePinia(createPinia());
  systemConfigsStore = useSystemConfigsStore();
  navigator = useNavStore();

  router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        name: 'Home',
        component: () => import('../src/views/HomeView.vue'),
        meta: {
          hidden: true,
          displayName: (route) => {
            return 'Dashboard';
          },
        },
      },
      {
        path: '/work_logs',
        name: 'Work Logs',
        component: () => import('../src/plugins/work_logs/WorkLogs.vue'),
      },
      {
        path: '/configure',
        name: 'Configure',
        component: () => import('../src/plugins/system_configs/ConfigurePage.vue'),
        meta: {
          hidden: true,
        },
        children: [
          {
            path: 'tags',
            name: 'Configure Tags',
            component: () => import('../src/plugins/tags/TagsPage.vue'),
            meta: {
              parentRoute: { name: 'Configure' },
              hidden: true,
            },
          },
        ],
      },
    ],
  })

  router.push('/')
  await router.isReady()
});

describe('App.vue', () => {
  test('should render main app', async() => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: ['router-link', 'router-view'],
      },
    });

    const appContainer = wrapper.get('.app-container');
    expect(appContainer.exists()).toBeTruthy();

    const navMenuContainer = appContainer.get('.nav-container');
    expect(navMenuContainer.exists()).toBeTruthy();

    const contentContainer = appContainer.get('.content-container');
    expect(contentContainer.exists()).toBeTruthy();

    const bannerContainer = contentContainer.get('.banner-container');
    expect(bannerContainer.exists()).toBeTruthy();

    const topNavContainer = contentContainer.get('.nav-container');
    expect(topNavContainer.exists()).toBeTruthy();

    const pageHeading = contentContainer.get('.page-heading');
    expect(pageHeading.exists()).toBeTruthy();

    const alertsContainer = contentContainer.get('.alerts-container');
    expect(alertsContainer.exists()).toBeTruthy();
  });

  test('when route has display name should render custom route name', async() => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: ['router-link', 'router-view'],
      },
    });

    const appContainer = wrapper.get('.app-container');
    const contentContainer = appContainer.get('.content-container');
    const pageHeading = contentContainer.get('.page-heading');
    expect(pageHeading.text()).toBe('Dashboard');
  });

  test('should load system configs on mount', async() => {
    const configsStoreSpy = vi.spyOn(systemConfigsStore, 'updateSystemConfigs');

    const wrapper = await mount(App, {
      global: {
        plugins: [router],
        stubs: ['router-link', 'router-view'],
      },
    });

    await flushPromises();

    expect(configsStoreSpy).toHaveBeenCalledTimes(1);
  });

  test('should load system configs on route change', async() => {
    const configsStoreSpy = vi.spyOn(systemConfigsStore, 'updateSystemConfigs');

    const wrapper = await mount(App, {
      global: {
        plugins: [router],
        stubs: ['router-link', 'router-view'],
      },
    });

    await flushPromises();

    await router.push({ name: 'Configure' });

    const appContainer = wrapper.get('.app-container');
    const contentContainer = appContainer.get('.content-container');
    const pageHeading = contentContainer.get('.page-heading');
    expect(pageHeading.text()).toBe('Configure');

    expect(configsStoreSpy).toHaveBeenCalledTimes(2);
  });

  test('should hide nav menu on route change', async() => {
    const navigatorSpy = vi.spyOn(navigator, 'hide');

    const wrapper = await mount(App, {
      global: {
        plugins: [router],
        stubs: ['router-link', 'router-view'],
      },
    });

    await flushPromises();

    await router.push({ name: 'Configure' });

    expect(navigatorSpy).toHaveBeenCalledTimes(1);
  });
});
