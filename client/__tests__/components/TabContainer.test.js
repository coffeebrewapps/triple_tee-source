import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import TabContainer from '../../src/components/TabContainer.vue';

beforeEach(async() => {
  setActivePinia(createPinia());
});

afterEach(() => {
  vi.restoreAllMocks();
});

const tabs = [
  { label: 'Tab 1' },
  { label: 'Tab 2' },
  { label: 'Tab 3' },
  { label: 'Tab 4' },
];

const slots = {
  'tab-0': 'Tab 1 Content',
  'tab-1': 'Tab 2 Content',
  'tab-2': 'Tab 3 Content',
  'tab-3': 'Tab 4 Content',
};

describe('TabContainer.vue', () => {
  test('when given tabs should render tabs and slots', async() => {
    const wrapper = await mount(TabContainer, {
      props: {
        tabs,
      },
      slots,
    });

    await flushPromises();

    const tabContainer = wrapper.get('.tab-container');
    expect(tabContainer.exists()).toBeTruthy();

    const tabsContainer = tabContainer.get('.tabs');
    expect(tabsContainer.exists()).toBeTruthy();

    const tabButtons = tabsContainer.findAll('.tab');
    expect(tabButtons.length).toBe(4);

    const tab1 = tabButtons[0].html();
    expect(tab1).toContain('Tab 1');
    expect(tab1).toContain('active');

    const tab2 = tabButtons[1].html();
    expect(tab2).toContain('Tab 2');
    expect(tab2).not.toContain('active');

    const tab3 = tabButtons[2].html();
    expect(tab3).toContain('Tab 3');
    expect(tab3).not.toContain('active');

    const tab4 = tabButtons[3].html();
    expect(tab4).toContain('Tab 4');
    expect(tab4).not.toContain('active');

    const tabContents = tabContainer.findAll('.tab-content');
    expect(tabContents.length).toBe(4);

    const tabContent1 = tabContents[0].html();
    expect(tabContent1).toContain('Tab 1 Content');
    expect(tabContent1).toContain('active');

    const tabContent2 = tabContents[1].html();
    expect(tabContent2).toContain('Tab 2 Content');
    expect(tabContent2).not.toContain('active');

    const tabContent3 = tabContents[2].html();
    expect(tabContent3).toContain('Tab 3 Content');
    expect(tabContent3).not.toContain('active');

    const tabContent4 = tabContents[3].html();
    expect(tabContent4).toContain('Tab 4 Content');
    expect(tabContent4).not.toContain('active');
  });

  test('when click on tab should emit tab change event', async() => {
    const wrapper = await mount(TabContainer, {
      props: {
        tabs,
      },
      slots,
    });

    await flushPromises();

    const tabContainer = wrapper.get('.tab-container');
    const tabsContainer = tabContainer.get('.tabs');
    const tabButtons = tabsContainer.findAll('.tab');

    const tab2Button = tabButtons[1];

    await tab2Button.trigger('click');

    const tabChangeEvents = wrapper.emitted().tabChange;
    expect(tabChangeEvents.length).toBe(1);
    expect(tabChangeEvents[0]).toEqual([1]);
  });

  test('when keydown enter on tab should emit tab change event', async() => {
    const wrapper = await mount(TabContainer, {
      props: {
        tabs,
      },
      slots,
    });

    await flushPromises();

    const tabContainer = wrapper.get('.tab-container');
    const tabsContainer = tabContainer.get('.tabs');
    const tabButtons = tabsContainer.findAll('.tab');

    const tab2Button = tabButtons[1];

    await tab2Button.trigger('keydown.enter');

    const tabChangeEvents = wrapper.emitted().tabChange;
    expect(tabChangeEvents.length).toBe(1);
    expect(tabChangeEvents[0]).toEqual([1]);
  });

  test('when keydown arrow-left on tab and has prev tab should emit tab change event', async() => {
    const wrapper = await mount(TabContainer, {
      props: {
        tabs,
      },
      slots,
    });

    await flushPromises();

    const tabContainer = wrapper.get('.tab-container');
    const tabsContainer = tabContainer.get('.tabs');
    const tabButtons = tabsContainer.findAll('.tab');

    const tab1ButtonFocusSpy = vi.spyOn(tabButtons[0].element, 'focus');
    const tab1ButtonBlurSpy = vi.spyOn(tabButtons[0].element, 'blur');

    const tab1Button = tabButtons[0];
    const tab2Button = tabButtons[1];

    await tab2Button.trigger('keydown.arrow-left');

    const tabChangeEvents = wrapper.emitted().tabChange;
    expect(tabChangeEvents.length).toBe(1);
    expect(tabChangeEvents[0]).toEqual([0]);
    expect(tab1ButtonFocusSpy).toHaveBeenCalled();

    await tab1Button.trigger('keydown.esc');
    expect(tab1ButtonBlurSpy).toHaveBeenCalled();
  });

  test('when keydown arrow-right on tab and has next tab should emit tab change event', async() => {
    const wrapper = await mount(TabContainer, {
      props: {
        tabs,
      },
      slots,
    });

    await flushPromises();

    const tabContainer = wrapper.get('.tab-container');
    const tabsContainer = tabContainer.get('.tabs');
    const tabButtons = tabsContainer.findAll('.tab');

    const tab3ButtonFocusSpy = vi.spyOn(tabButtons[2].element, 'focus');
    const tab3ButtonBlurSpy = vi.spyOn(tabButtons[2].element, 'blur');

    const tab2Button = tabButtons[1];
    const tab3Button = tabButtons[2];

    await tab2Button.trigger('keydown.arrow-right');

    const tabChangeEvents = wrapper.emitted().tabChange;
    expect(tabChangeEvents.length).toBe(1);
    expect(tabChangeEvents[0]).toEqual([2]);
    expect(tab3ButtonFocusSpy).toHaveBeenCalled();

    await tab3Button.trigger('keydown.esc');
    expect(tab3ButtonBlurSpy).toHaveBeenCalled();
  });

  test('when keydown arrow-left on tab and has no prev tab should do nothing', async() => {
    const wrapper = await mount(TabContainer, {
      props: {
        tabs,
      },
      slots,
    });

    await flushPromises();

    const tabContainer = wrapper.get('.tab-container');
    const tabsContainer = tabContainer.get('.tabs');
    const tabButtons = tabsContainer.findAll('.tab');

    const tab1Button = tabButtons[0];

    await tab1Button.trigger('click');

    await tab1Button.trigger('keydown.arrow-left');

    const tabChangeEvents = wrapper.emitted().tabChange;
    expect(tabChangeEvents[0]).toEqual([0]);
  });

  test('when keydown arrow-right on tab and has no next tab should do nothing', async() => {
    const wrapper = await mount(TabContainer, {
      props: {
        tabs,
      },
      slots,
    });

    await flushPromises();

    const tabContainer = wrapper.get('.tab-container');
    const tabsContainer = tabContainer.get('.tabs');
    const tabButtons = tabsContainer.findAll('.tab');

    const tab4Button = tabButtons[3];

    await tab4Button.trigger('click');

    await tab4Button.trigger('keydown.arrow-right');

    const tabChangeEvents = wrapper.emitted().tabChange;
    expect(tabChangeEvents[0]).toEqual([3]);
  });
});
