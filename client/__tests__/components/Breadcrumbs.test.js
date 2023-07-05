import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useRouter } from 'vue-router';
import Breadcrumbs from '../../src/components/Breadcrumbs.vue';

vi.mock('vue-router');

beforeEach(async() => {
  setActivePinia(createPinia());

  useRouter.mockImplementation(() => {
    return {
      currentRoute: {},
      getRoutes: vi.fn(),
      push: vi.fn(),
    };
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Breadcrumbs.vue', () => {
  test('when route is top level should render only one level hierarchy', async() => {
    const push = vi.fn();

    useRouter.mockImplementation(() => {
      return {
        currentRoute: {
          path: '/admin',
          name: 'Data Admin',
        },
        getRoutes: () => {
          return [
            {
              path: '/admin',
              name: 'Data Admin',
            },
          ];
        },
        push,
      };
    });

    const wrapper = await mount(Breadcrumbs);

    await flushPromises();

    const breadcrumbsContainer = wrapper.get('.breadcrumbs');
    expect(breadcrumbsContainer.exists()).toBeTruthy();

    const navs = breadcrumbsContainer.findAll('.nav');
    expect(navs.length).toBe(1);
    expect(navs[0].html()).toContain('Data Admin');

    await navs[0].trigger('click');
    expect(push).toHaveBeenCalledWith({ name: 'Data Admin' });
  });

  test('when route is nested should render multi-level hierarchy', async() => {
    const push = vi.fn();

    useRouter.mockImplementation(() => {
      return {
        currentRoute: {
          path: '/contacts/1',
          name: 'Contact Details',
          meta: {
            parentRoute: { name: 'Contacts' },
          },
        },
        getRoutes: () => {
          return [
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
        },
        push,
      };
    });

    const wrapper = await mount(Breadcrumbs);

    await flushPromises();

    const breadcrumbsContainer = wrapper.get('.breadcrumbs');
    expect(breadcrumbsContainer.exists()).toBeTruthy();

    const navs = breadcrumbsContainer.findAll('.nav');
    expect(navs.length).toBe(2);
    expect(navs[0].html()).toContain('Contacts');
    expect(navs[1].html()).toContain('Contact Details');

    await navs[0].trigger('click');
    expect(push).toHaveBeenCalledWith({ name: 'Contacts' });
  });
});
