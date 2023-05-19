import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useEventsStore = defineStore('events', () => {
  const listeners = ref({})

  function registerListener(eventType, listener) {
    if(Array.isArray(listeners.value[eventType])) {
      listeners.value[eventType].push(listener)
    } else {
      listeners.value[eventType] = [listener]
    }
  }

  function unregisterListener(eventType, listener) {
    if(!Array.isArray(listeners.value[eventType])) { return }

    const found = listeners.value[eventType].findIndex(l => l.id === listener.id)
    if (found < 0) { return }

    listeners.value[eventType].splice(found, 1)
  }

  function emitEvent(eventType, payload) {
    if (!Array.isArray(listeners.value[eventType])) { return }

    listeners.value[eventType].forEach((listener) => {
      listener.invoke(payload)
    })
  }

  return { listeners, registerListener, unregisterListener, emitEvent }
})
