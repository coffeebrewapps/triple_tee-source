import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useSystemConfigsStore = defineStore('systemConfigs', () => {
  const systemConfigs = ref({})

  function getSystemConfigs() {
    return systemConfigs.value
  }

  function updateSystemConfigs(config) {
    systemConfigs.value = config
  }

  function clearSystemConfigs() {
    systemConfigs.value = {}
  }

  return { systemConfigs, getSystemConfigs, updateSystemConfigs, clearSystemConfigs }
})
