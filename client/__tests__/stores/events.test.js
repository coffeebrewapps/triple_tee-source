import { setActivePinia, createPinia } from 'pinia';
import { useEventsStore } from '../../src/stores/events.js';

let eventsStore;

beforeEach(() => {
  setActivePinia(createPinia());
  eventsStore = useEventsStore();
});

describe('listeners', () => {
  test('should return registered listeners', () => {
    expect(eventsStore.listeners).toEqual({});
  });
});

describe('registerListener', () => {
  test('when event type has no existing listener should register new listener', () => {
    expect(eventsStore.listeners).toEqual({});

    eventsStore.registerListener(
      'loadData',
      {
        id: 'DataPage-Tags',
        invoke: (payload) => {},
      }
    );

    expect(eventsStore.listeners).toEqual({
      loadData: [
        {
          id: 'DataPage-Tags',
          invoke: expect.anything(),
        },
      ],
    });
  });

  test('when event type has existing listeners should register new listener', () => {
    eventsStore.registerListener(
      'loadData',
      {
        id: 'DataPage-Tags',
        invoke: (payload) => {},
      }
    );

    expect(eventsStore.listeners).toEqual({
      loadData: [
        {
          id: 'DataPage-Tags',
          invoke: expect.anything(),
        },
      ],
    });

    eventsStore.registerListener(
      'loadData',
      {
        id: 'DataPage-Contacts',
        invoke: (payload) => {},
      }
    );

    expect(eventsStore.listeners).toEqual({
      loadData: [
        {
          id: 'DataPage-Tags',
          invoke: expect.anything(),
        },
        {
          id: 'DataPage-Contacts',
          invoke: expect.anything(),
        },
      ],
    });
  });
});

describe('unregisterListener', () => {
  test('when event type has no existing listener should do nothing', () => {
    expect(eventsStore.listeners).toEqual({});

    eventsStore.unregisterListener(
      'loadData',
      {
        id: 'DataPage-Tags',
      }
    );

    expect(eventsStore.listeners).toEqual({});
  });

  test('when event type has existing listener should remove listener', () => {
    eventsStore.registerListener(
      'loadData',
      {
        id: 'DataPage-Tags',
        invoke: (payload) => {},
      }
    );

    eventsStore.registerListener(
      'loadData',
      {
        id: 'DataPage-Contacts',
        invoke: (payload) => {},
      }
    );

    expect(eventsStore.listeners).toEqual({
      loadData: [
        {
          id: 'DataPage-Tags',
          invoke: expect.anything(),
        },
        {
          id: 'DataPage-Contacts',
          invoke: expect.anything(),
        },
      ],
    });

    eventsStore.unregisterListener(
      'loadData',
      {
        id: 'DataPage-Contacts',
      }
    );

    expect(eventsStore.listeners).toEqual({
      loadData: [
        {
          id: 'DataPage-Tags',
          invoke: expect.anything(),
        },
      ],
    });
  });

  test('when event type has existing listener but listener to unregister not exists should do nothing', () => {
    eventsStore.registerListener(
      'loadData',
      {
        id: 'DataPage-Tags',
        invoke: (payload) => {},
      }
    );

    eventsStore.registerListener(
      'loadData',
      {
        id: 'DataPage-Contacts',
        invoke: (payload) => {},
      }
    );

    expect(eventsStore.listeners).toEqual({
      loadData: [
        {
          id: 'DataPage-Tags',
          invoke: expect.anything(),
        },
        {
          id: 'DataPage-Contacts',
          invoke: expect.anything(),
        },
      ],
    });

    eventsStore.unregisterListener(
      'loadData',
      {
        id: 'DataPage-Transactions',
      }
    );

    expect(eventsStore.listeners).toEqual({
      loadData: [
        {
          id: 'DataPage-Tags',
          invoke: expect.anything(),
        },
        {
          id: 'DataPage-Contacts',
          invoke: expect.anything(),
        },
      ],
    });
  });
});

describe('emitEvent', () => {
  test('when listener found for event type should invoke listeners', () => {
    const tagsListener = {
      id: 'DataPage-Tags',
      invoke: (payload) => {
        if (payload.modelClass === 'tags') {
          payload.invoked = 'tags';
        }
      },
    };

    const transactionsListener = {
      id: 'DataPage-Transactions',
      invoke: (payload) => {
        if (payload.modelClass === 'transactions') {
          payload.invoked = 'transactions';
        }
      },
    };

    eventsStore.registerListener(
      'loadData',
      tagsListener
    );

    eventsStore.registerListener(
      'loadData',
      transactionsListener
    );

    const tagsSpy = vi.spyOn(tagsListener, 'invoke');
    const transactionsSpy = vi.spyOn(transactionsListener, 'invoke');

    const payload = { modelClass: 'tags', message: 'Hello' };

    expect(payload.invoked).toBeFalsy();
    eventsStore.emitEvent('loadData', payload);
    expect(tagsSpy).toHaveBeenCalledWith(payload);
    expect(transactionsSpy).toHaveBeenCalledWith(payload);
    expect(payload.invoked).toBe('tags');
  });

  test('when listener not found for event type should do nothing', () => {
    const listener = {
      id: 'DataPage-Tags',
      invoke: (payload) => {
        if (payload.modelClass === 'tags') {
          payload.invoked = 'tags';
        }
      },
    };

    eventsStore.registerListener(
      'loadData',
      listener
    );

    const spy = vi.spyOn(listener, 'invoke');
    const payload = { modelClass: 'tags', message: 'Hello' };

    expect(payload.invoked).toBeFalsy();
    eventsStore.emitEvent('refreshData', payload);
    expect(spy).not.toHaveBeenCalled();
    expect(payload.invoked).toBeFalsy();
  });
});
