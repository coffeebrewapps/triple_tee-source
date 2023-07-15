import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useRouter, onBeforeRouteUpdate } from 'vue-router';
import MultiViewContainer from '../../src/components/MultiViewContainer.vue';

vi.mock('vue-router', () => {
  return {
    useRouter: vi.fn(),
    onBeforeRouteUpdate: vi.fn(),
  };
});

const push = vi.fn();

beforeEach(async() => {
  setActivePinia(createPinia());

  useRouter.mockImplementation(() => {
    return {
      push,
    };
  });

  onBeforeRouteUpdate.mockImplementation(() => {
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const views = [
  {
    name: 'View 1',
    hidden: false,
  },
  {
    name: 'View 2',
    hidden: false,
  },
  {
    name: 'View 3',
    hidden: true,
  },
  {
    name: 'View 4',
    hidden: false,
  },
];

describe('MultiViewContainer.vue', () => {
  test('when given views should render views', async() => {
    const wrapper = await mount(MultiViewContainer, {
      props: {
        heading: 'Test View Container',
        views,
      },
      global: {
        stubs: ['router-view'],
      },
    });

    await flushPromises();

    const viewContainer = wrapper.get('.view-container');
    expect(viewContainer.exists()).toBeTruthy();

    const viewsContainer = viewContainer.get('.views');
    expect(viewsContainer.exists()).toBeTruthy();

    const displayableViews = viewsContainer.findAll('.view');
    expect(displayableViews.length).toBe(3);

    const view1 = displayableViews[0].html();
    expect(view1).toContain('View 1');
    expect(view1).toContain('active');

    const view2 = displayableViews[1].html();
    expect(view2).toContain('View 2');
    expect(view2).not.toContain('active');

    const view4 = displayableViews[2].html();
    expect(view4).toContain('View 4');
    expect(view4).not.toContain('active');

    const viewContent = viewContainer.get('.view-content');
    expect(viewContent.exists()).toBeTruthy();

    const heading = viewContent.get('.heading');
    expect(heading.text()).toBe('Test View Container');
  });

  test('when click on view should change route', async() => {
    const wrapper = await mount(MultiViewContainer, {
      props: {
        heading: 'Test View Container',
        views,
      },
      global: {
        stubs: ['router-view'],
      },
    });

    await flushPromises();

    const viewContainer = wrapper.get('.view-container');
    const viewsContainer = viewContainer.get('.views');
    const displayableViews = viewsContainer.findAll('.view');

    const view2 = displayableViews[1].html();
    expect(view2).toContain('View 2');
    expect(view2).not.toContain('active');

    expect(wrapper.vm.selectedView).toBe(0);
    const view2Button = displayableViews[1];

    await view2Button.trigger('click');
    expect(push).toHaveBeenCalledWith({ name: 'View 2' });
    expect(wrapper.vm.selectedView).toBe(1);
  });

  test('when keydown enter on view should change route', async() => {
    const wrapper = await mount(MultiViewContainer, {
      props: {
        heading: 'Test View Container',
        views,
      },
      global: {
        stubs: ['router-view'],
      },
    });

    await flushPromises();

    const viewContainer = wrapper.get('.view-container');
    const viewsContainer = viewContainer.get('.views');
    const displayableViews = viewsContainer.findAll('.view');

    const view2 = displayableViews[1].html();
    expect(view2).toContain('View 2');
    expect(view2).not.toContain('active');

    expect(wrapper.vm.selectedView).toBe(0);
    const view2Button = displayableViews[1];

    await view2Button.trigger('keydown.enter');
    expect(push).toHaveBeenCalledWith({ name: 'View 2' });
    expect(wrapper.vm.selectedView).toBe(1);
  });

  test('when keydown arrow-left on view and has prev view should change route', async() => {
    const wrapper = await mount(MultiViewContainer, {
      props: {
        heading: 'Test View Container',
        views,
      },
      global: {
        stubs: ['router-view'],
      },
    });

    await flushPromises();

    const viewContainer = wrapper.get('.view-container');
    const viewsContainer = viewContainer.get('.views');
    const displayableViews = viewsContainer.findAll('.view');

    const view1ButtonFocusSpy = vi.spyOn(displayableViews[0].element, 'focus');
    const view1ButtonBlurSpy = vi.spyOn(displayableViews[0].element, 'blur');

    const view1Button = displayableViews[0];
    const view2Button = displayableViews[1];

    await view2Button.trigger('click');
    expect(push).toHaveBeenCalledWith({ name: 'View 2' });
    expect(wrapper.vm.selectedView).toBe(1);

    await view2Button.trigger('keydown.arrow-left');
    expect(push).toHaveBeenCalledWith({ name: 'View 1' });
    expect(wrapper.vm.selectedView).toBe(0);
    expect(view1ButtonFocusSpy).toHaveBeenCalled();

    await view1Button.trigger('keydown.esc');
    expect(view1ButtonBlurSpy).toHaveBeenCalled();
  });

  test('when keydown arrow-right on view and has next view should change route', async() => {
    const wrapper = await mount(MultiViewContainer, {
      props: {
        heading: 'Test View Container',
        views,
      },
      global: {
        stubs: ['router-view'],
      },
    });

    await flushPromises();

    const viewContainer = wrapper.get('.view-container');
    const viewsContainer = viewContainer.get('.views');
    const displayableViews = viewsContainer.findAll('.view');

    const view3ButtonFocusSpy = vi.spyOn(displayableViews[2].element, 'focus');
    const view3ButtonBlurSpy = vi.spyOn(displayableViews[2].element, 'blur');

    const view2Button = displayableViews[1];
    const view3Button = displayableViews[2];

    await view2Button.trigger('click');
    expect(push).toHaveBeenCalledWith({ name: 'View 2' });
    expect(wrapper.vm.selectedView).toBe(1);

    await view2Button.trigger('keydown.arrow-right');
    expect(push).toHaveBeenCalledWith({ name: 'View 4' });
    expect(wrapper.vm.selectedView).toBe(2);
    expect(view3ButtonFocusSpy).toHaveBeenCalled();

    await view3Button.trigger('keydown.esc');
    expect(view3ButtonBlurSpy).toHaveBeenCalled();
  });

  test('when keydown arrow-left on view and has no prev view should do nothing', async() => {
    const wrapper = await mount(MultiViewContainer, {
      props: {
        heading: 'Test View Container',
        views,
      },
      global: {
        stubs: ['router-view'],
      },
    });

    await flushPromises();

    const viewContainer = wrapper.get('.view-container');
    const viewsContainer = viewContainer.get('.views');
    const displayableViews = viewsContainer.findAll('.view');

    const view1Button = displayableViews[0];
    expect(wrapper.vm.selectedView).toBe(0);

    await view1Button.trigger('keydown.arrow-left');
    expect(push).not.toHaveBeenCalledWith();
    expect(wrapper.vm.selectedView).toBe(0);
  });

  test('when keydown arrow-right on view and has no next view should do nothing', async() => {
    const wrapper = await mount(MultiViewContainer, {
      props: {
        heading: 'Test View Container',
        views,
      },
      global: {
        stubs: ['router-view'],
      },
    });

    await flushPromises();

    const viewContainer = wrapper.get('.view-container');
    const viewsContainer = viewContainer.get('.views');
    const displayableViews = viewsContainer.findAll('.view');

    const view4Button = displayableViews[2];

    await view4Button.trigger('click');
    expect(push).toHaveBeenCalledWith({ name: 'View 4' });
    expect(wrapper.vm.selectedView).toBe(2);

    await view4Button.trigger('keydown.arrow-right');
    expect(push).not.toHaveBeenCalledWith();
    expect(wrapper.vm.selectedView).toBe(2);
  });

  test('when trigger route with view should change route', async() => {
    const updateRoute = vi.fn();

    onBeforeRouteUpdate.mockImplementation((cb) => {
      const to = {
        name: 'View 2',
      };

      const from = {
      };

      if (cb(to, from)) {
        updateRoute();
      }
    });

    await mount(MultiViewContainer, {
      props: {
        heading: 'Test View Container',
        views,
      },
      global: {
        stubs: ['router-view'],
      },
    });

    await flushPromises();

    expect(updateRoute).toHaveBeenCalled();
  });

  test('when trigger route without view should do nothing', async() => {
    const updateRoute = vi.fn();

    onBeforeRouteUpdate.mockImplementation((cb) => {
      const to = {
        name: 'Invalid',
      };

      const from = {
      };

      if (cb(to, from)) {
        updateRoute();
      }
    });

    const wrapper = await mount(MultiViewContainer, {
      props: {
        heading: 'Test View Container',
        views,
      },
      global: {
        stubs: ['router-view'],
      },
    });

    await flushPromises();

    expect(wrapper.vm.selectedView).toBe(0);

    expect(updateRoute).not.toHaveBeenCalled();
  });
});
