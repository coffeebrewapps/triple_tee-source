import { setActivePinia, createPinia } from 'pinia';
import { useNavStore } from '../../src/stores/nav.js';

let navStore;

beforeEach(() => {
  setActivePinia(createPinia());
  navStore = useNavStore();
});

describe('nav', () => {
  test('should return nav menu state', () => {
    expect(navStore.nav).toBeFalsy();
  });
});


describe('show', () => {
  test('should set nav menu state to true', () => {
    expect(navStore.nav).toBeFalsy();
    navStore.show();
    expect(navStore.nav).toBeTruthy();
  });
});


describe('hide', () => {
  test('should set nav menu state to false', () => {
    navStore.show();
    expect(navStore.nav).toBeTruthy();
    navStore.hide();
    expect(navStore.nav).toBeFalsy();
  });
});

describe('toggle', () => {
  test('when nav menu state is false should set to true', () => {
    expect(navStore.nav).toBeFalsy();
    navStore.toggle();
    expect(navStore.nav).toBeTruthy();
  });

  test('when nav menu state is true should set to false', () => {
    navStore.show();
    expect(navStore.nav).toBeTruthy();
    navStore.toggle();
    expect(navStore.nav).toBeFalsy();
  });
});
