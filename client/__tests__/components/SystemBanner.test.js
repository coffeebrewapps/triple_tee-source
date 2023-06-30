import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useBannerStore } from '../../src/stores/banner.js';
import SystemBanner from '../../src/components/SystemBanner.vue';

let banner;

beforeEach(async() => {
  setActivePinia(createPinia());
  banner = useBannerStore();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SystemBanner.vue', () => {
  test('should render banner when there is message', async() => {
    const wrapper = await mount(SystemBanner);

    await flushPromises();

    const bannerContainer = wrapper.get('.banner-container');
    expect(bannerContainer.exists()).toBeTruthy();

    const messageContainer = bannerContainer.get('.message');
    expect(messageContainer.exists()).toBeTruthy();

    expect(bannerContainer.html()).toContain('hide');
    expect(messageContainer.text()).toBe('');
    banner.show('Data created successfully!');

    await flushPromises();

    expect(bannerContainer.html()).toContain('show');
    expect(messageContainer.text()).toBe('Data created successfully!');
  });

  test('should hide banner when toggle close button', async() => {
    const wrapper = await mount(SystemBanner);

    await flushPromises();

    const bannerContainer = wrapper.get('.banner-container');

    expect(bannerContainer.html()).toContain('hide');
    banner.show('Data created successfully!');

    await flushPromises();

    expect(bannerContainer.html()).toContain('show');

    const closeButton = bannerContainer.get('.close-button');
    expect(closeButton.exists()).toBeTruthy();
    await closeButton.trigger('click');

    expect(bannerContainer.html()).toContain('hide');
  });
});
