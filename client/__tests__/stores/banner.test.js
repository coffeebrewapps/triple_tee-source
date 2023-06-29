import { setActivePinia, createPinia } from 'pinia';
import { useBannerStore } from '../../src/stores/banner.js';

let bannerStore;

beforeEach(() => {
  setActivePinia(createPinia());
  bannerStore = useBannerStore();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('banner', () => {
  test('should return banner state', () => {
    expect(bannerStore.banner).toBeFalsy();
  });
});

describe('bannerMessage', () => {
  test('should return banner message', () => {
    expect(bannerStore.bannerMessage).toBeNull();
  });
});

describe('show', () => {
  test('should set banner state to true', () => {
    expect(bannerStore.banner).toBeFalsy();
    bannerStore.show();
    expect(bannerStore.banner).toBeTruthy();
  });
});

describe('hide', () => {
  test('should set banner state to false', () => {
    bannerStore.show();
    expect(bannerStore.banner).toBeTruthy();
    bannerStore.hide();
    expect(bannerStore.banner).toBeFalsy();
  });
});

describe('toggle', () => {
  test('when banner state is false should set to true', () => {
    expect(bannerStore.banner).toBeFalsy();
    bannerStore.toggle();
    expect(bannerStore.banner).toBeTruthy();
  });

  test('when banner state is true should set to false', () => {
    bannerStore.show();
    expect(bannerStore.banner).toBeTruthy();
    bannerStore.toggle();
    expect(bannerStore.banner).toBeFalsy();
  });
});

describe('setMessage', () => {
  test('should set banner message', () => {
    expect(bannerStore.bannerMessage).toBeNull();
    bannerStore.setMessage('Data created successfully');
    expect(bannerStore.bannerMessage).toBe('Data created successfully');
  });
});

describe('clearMessage', () => {
  test('should clear banner message', () => {
    bannerStore.setMessage('Data created successfully');
    expect(bannerStore.bannerMessage).toBe('Data created successfully');
    bannerStore.clearMessage();
    expect(bannerStore.bannerMessage).toBeNull();
  });
});

describe('flashMessage', () => {
  test('should show banner message and hide after timeout', () => {
    bannerStore.flashMessage('Data created successfully');
    expect(bannerStore.banner).toBeTruthy();
    expect(bannerStore.bannerMessage).toBe('Data created successfully');
    vi.advanceTimersByTime(5000);
    expect(bannerStore.banner).toBeFalsy();
  });
});
