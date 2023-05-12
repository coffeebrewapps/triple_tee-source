import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useNavStore = defineStore('nav', () => {
  const nav = ref(false)

  function show() {
    nav.value = true
  }

  function hide() {
    nav.value = false
  }

  function toggle() {
    nav.value = !nav.value
  }

  return { nav, show, hide, toggle }
})
