import { setActivePinia, createPinia } from 'pinia';
import { useShortcutsStore } from '../../src/stores/shortcuts.js';

let shortcutsStore;

beforeEach(() => {
  setActivePinia(createPinia());
  shortcutsStore = useShortcutsStore();
});

describe('listeners', () => {
  test('should return registered listeners', () => {
    expect(shortcutsStore.listeners).toEqual({});
  });
});

describe('registerListener', () => {
  test('when event type has no existing listener should register new listener', () => {
    expect(shortcutsStore.listeners).toEqual({});

    shortcutsStore.registerListener(
      {
        route: '/work_logs',
        eventType: 'keydown-Escape',
      },
      {
        id: 'CloseDialog-StartTask',
        invoke: (payload) => {},
      }
    );

    expect(shortcutsStore.listeners).toEqual({
      '/work_logs': {
        'keydown-Escape': [
          {
            id: 'CloseDialog-StartTask',
            invoke: expect.anything(),
          },
        ],
      },
    });
  });

  test('when event type has existing listeners should register new listener', () => {
    shortcutsStore.registerListener(
      {
        route: '/work_logs',
        eventType: 'keydown-Escape',
      },
      {
        id: 'CloseDialog-StartTask',
        invoke: (payload) => {},
      }
    );

    expect(shortcutsStore.listeners).toEqual({
      '/work_logs': {
        'keydown-Escape': [
          {
            id: 'CloseDialog-StartTask',
            invoke: expect.anything(),
          },
        ],
      },
    });

    shortcutsStore.registerListener(
      {
        route: '/work_logs',
        eventType: 'keydown-Escape',
      },
      {
        id: 'CloseDialog-EndTask',
        invoke: (payload) => {},
      }
    );

    expect(shortcutsStore.listeners).toEqual({
      '/work_logs': {
        'keydown-Escape': [
          {
            id: 'CloseDialog-StartTask',
            invoke: expect.anything(),
          },
          {
            id: 'CloseDialog-EndTask',
            invoke: expect.anything(),
          },
        ],
      },
    });
  });
});

describe('unregisterListener', () => {
  test('when event type has no existing listener should do nothing', () => {
    expect(shortcutsStore.listeners).toEqual({});

    shortcutsStore.unregisterListener(
      {
        route: '/work_logs',
        eventType: 'keydown-Escape',
      },
      {
        id: 'CloseDialog-EndTask',
      }
    );

    expect(shortcutsStore.listeners).toEqual({});
  });

  test('when event type has existing listener should remove listener', () => {
    shortcutsStore.registerListener(
      {
        route: '/work_logs',
        eventType: 'keydown-Escape',
      },
      {
        id: 'CloseDialog-StartTask',
        invoke: (payload) => {},
      }
    );

    shortcutsStore.registerListener(
      {
        route: '/work_logs',
        eventType: 'keydown-Escape',
      },
      {
        id: 'CloseDialog-EndTask',
        invoke: (payload) => {},
      }
    );

    expect(shortcutsStore.listeners).toEqual({
      '/work_logs': {
        'keydown-Escape': [
          {
            id: 'CloseDialog-StartTask',
            invoke: expect.anything(),
          },
          {
            id: 'CloseDialog-EndTask',
            invoke: expect.anything(),
          },
        ],
      },
    });

    shortcutsStore.unregisterListener(
      {
        route: '/work_logs',
        eventType: 'keydown-Escape',
      },
      {
        id: 'CloseDialog-EndTask',
      }
    );

    expect(shortcutsStore.listeners).toEqual({
      '/work_logs': {
        'keydown-Escape': [
          {
            id: 'CloseDialog-StartTask',
            invoke: expect.anything(),
          },
        ],
      },
    });
  });

  test('when event type has existing listener but listener to unregister not exists should do nothing', () => {
    shortcutsStore.registerListener(
      {
        route: '/work_logs',
        eventType: 'keydown-Escape',
      },
      {
        id: 'CloseDialog-StartTask',
        invoke: (payload) => {},
      }
    );

    expect(shortcutsStore.listeners).toEqual({
      '/work_logs': {
        'keydown-Escape': [
          {
            id: 'CloseDialog-StartTask',
            invoke: expect.anything(),
          },
        ],
      },
    });

    shortcutsStore.unregisterListener(
      {
        route: '/work_logs',
        eventType: 'keydown-Escape',
      },
      {
        id: 'CloseDialog-QuickStart',
      }
    );

    expect(shortcutsStore.listeners).toEqual({
      '/work_logs': {
        'keydown-Escape': [
          {
            id: 'CloseDialog-StartTask',
            invoke: expect.anything(),
          },
        ],
      },
    });
  });
});

describe('emitShortcut', () => {
  test('when listener found for event type should invoke listeners', () => {
    const startTaskListener = {
      id: 'CloseDialog-StartTask',
      invoke: (payload) => {
        if (payload.target === 'StartTask') {
          payload.invoked = 'StartTask';
        }
      },
    };

    const endTaskListener = {
      id: 'CloseDialog-EndTask',
      invoke: (payload) => {
        if (payload.target === 'EndTask') {
          payload.invoked = 'EndTask';
        }
      },
    };

    shortcutsStore.registerListener(
      {
        route: '/work_logs',
        eventType: 'keydown-Escape',
      },
      startTaskListener
    );

    shortcutsStore.registerListener(
      {
        route: '/work_logs',
        eventType: 'keydown-Escape',
      },
      endTaskListener
    );

    const startTaskSpy = vi.spyOn(startTaskListener, 'invoke');
    const endTaskSpy = vi.spyOn(endTaskListener, 'invoke');

    const payload = { target: 'StartTask' };

    expect(payload.invoked).toBeFalsy();
    shortcutsStore.emitShortcut(
      {
        route: '/work_logs',
        eventType: 'keydown-Escape',
      },
      payload
    );
    expect(startTaskSpy).toHaveBeenCalledWith(payload);
    expect(endTaskSpy).toHaveBeenCalledWith(payload);
    expect(payload.invoked).toBe('StartTask');
  });

  test('when listener not found for event type should do nothing', () => {
    const startTaskListener = {
      id: 'CloseDialog-StartTask',
      invoke: (payload) => {
        if (payload.target === 'StartTask') {
          payload.invoked = 'StartTask';
        }
      },
    };

    shortcutsStore.registerListener(
      {
        route: '/work_logs',
        eventType: 'keydown-Escape',
      },
      startTaskListener
    );

    const startTaskSpy = vi.spyOn(startTaskListener, 'invoke');
    const payload = { target: 'StartTask' };

    expect(payload.invoked).toBeFalsy();
    shortcutsStore.emitShortcut(
      {
        route: '/tags',
        eventType: 'keydown-Escape',
      },
      payload
    );
    expect(startTaskSpy).not.toHaveBeenCalled();
    expect(payload.invoked).toBeUndefined();
  });
});
