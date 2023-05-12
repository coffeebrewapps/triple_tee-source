import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAlertsStore = defineStore('alerts', () => {
  const alerts = ref([])
  const showAlert = ref(false)

  function show() {
    showAlert.value = true
  }

  function hide() {
    showAlert.value = false
  }

  function toggle() {
    showAlert.value = !showAlert.value
  }

  function addAlert({ heading, message }) {
    alerts.value.unshift({ heading, message, timestamp: (new Date()) })
  }

  function clearAlerts() {
    alerts.value = []
  }

  return { alerts, showAlert, show, hide, toggle, addAlert, clearAlerts }
})
