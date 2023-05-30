import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useShortcutsStore = defineStore('shortcuts', () => {
  const listeners = ref({});

  function isEmpty(value) {
    return (Object.is(value, undefined) || Object.is(value, null));
  }

  function registerListener({ route, eventType }, listener) {
    if (isEmpty(listeners.value[route])) {
      listeners.value[route] = {};
    }
    if (isEmpty(listeners.value[route][eventType])) {
      listeners.value[route][eventType] = [];
    }

    listeners.value[route][eventType].push(listener);
  }

  function unregisterListener({ route, eventType }, listener) {
    if (isEmpty(listeners.value[route])) { return; }
    if (isEmpty(listeners.value[route][eventType])) { return; }

    const found = listeners.value[route][eventType].findIndex(l => l.id === listener.id);
    if (found < 0) { return; }

    listeners.value[route][eventType].splice(found, 1);
  }

  function emitShortcut({ route, eventType }, payload) {
    if (isEmpty(listeners.value[route])) { return; }
    if (isEmpty(listeners.value[route][eventType])) { return; }

    listeners.value[route][eventType].forEach((listener) => {
      listener.invoke(payload);
    });
  }

  return { listeners, registerListener, unregisterListener, emitShortcut };
});
