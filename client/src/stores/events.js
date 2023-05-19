import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useEventsStore = defineStore('events', () => {
  const listeners = ref({})

  function registerListener(eventType, listener) {
    if(Array.isArray(listeners[eventType])) {
      listeners[eventType].push(listener)
    } else {
      listeners[eventType] = [listener]
    }
  }

  function unregisterListener(eventType, listener) {
    if(!Array.isArray(listeners[eventType])) { return }

    const found = listeners.findIndex(l => l.id === listener.id)
    if (found < 0) { return }

    listeners.splice(found, 1)
  }

  function emitEvent(eventType, payload) {
    if (!Array.isArray(listeners[eventType])) { return }

    listeners[eventType].forEach((listener) => {
      listener.invoke(payload)
    })
  }

  return { listeners, registerListener, unregisterListener, emitEvent }
})
