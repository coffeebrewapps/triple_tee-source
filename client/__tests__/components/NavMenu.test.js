import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useRouter } from 'vue-router';
import { useNavStore } from '../../src/stores/nav.js';
import NavMenu from '../../src/components/NavMenu.vue';

vi.mock('vue-router');

let navigator;

beforeEach(async() => {
  setActivePinia(createPinia());

  navigator = useNavStore();

  useRouter.mockImplementation(() => {
    return {
      getRoutes: () => {
        return [
          {
            path: '/',
            name: 'Home',
            meta: {
              hidden: true,
            },
          },
          {
            path: '/admin',
            name: 'Data Admin',
          },
          {
            path: '/dashboard',
            name: 'Dashboard',
          },
        ];
      },
      push: vi.fn(),
    };
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('NavMenu.vue', () => {
  test('should render all unhidden routes', async() => {
    const wrapper = await mount(NavMenu, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    });

    await flushPromises();

    const navContainer = wrapper.get('.nav-container');
    expect(navContainer.exists()).toBeTruthy();

    const nav = navContainer.get('.nav');
    expect(nav.exists()).toBeTruthy();

    const navItems = nav.findAll('.nav-item');
    expect(navItems.length).toBe(2);

    expect(navItems[0].html()).toContain('Data Admin');
    expect(navItems[1].html()).toContain('Dashboard');
  });

  test('when toggle nav should hide or show routes', async() => {
    const wrapper = await mount(NavMenu, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    });

    await flushPromises();

    const navContainer = wrapper.get('.nav-container');
    expect(navContainer.exists()).toBeTruthy();

    expect(navigator.nav).toBeFalsy();
    expect(navContainer.html()).toContain('hide');

    const navToggle = navContainer.get('.nav-toggle');
    expect(navToggle.exists()).toBeTruthy();
    await navToggle.trigger('click');

    await flushPromises();

    expect(navigator.nav).toBeTruthy();
    expect(navContainer.html()).toContain('show');
  });
});
