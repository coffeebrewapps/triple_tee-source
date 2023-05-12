import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useNavStore = defineStore('nav', () => {
  const nav = ref(false)
  function toggle() {
    nav.value = !nav.value
  }

  return { nav, toggle }
})
