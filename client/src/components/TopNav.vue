<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

import { useAlertsStore } from '../stores/alerts'

import {
  TButton
} from 'coffeebrew-vue-components'

const alerts = useAlertsStore()

const theme = ref(true) // true: dark, false: light

const themeIcon = computed(() => {
  if (theme.value) {
    return `fa-solid fa-moon`
  } else {
    return `fa-solid fa-sun`
  }
})

function toggleAlerts() {
  alerts.toggle()
}

function toggleTheme() {
  theme.value = !theme.value

  document.body.classList.toggle('dark', theme.value)
  document.body.classList.toggle('light', !theme.value)
}

function openSystemConfigs() {
  const route = {
    path: '/system_configs',
    name: 'System Configs',
    component: () => import('@/views/SystemConfigs.vue')
  }
  router.addRoute(route)
  router.push({ name: 'System Configs' })
}
</script>

<template>
  <div class="toggles">
    <div class="alert-toggle">
      <TButton button-type="icon" icon="fa-solid fa-bell" @click="toggleAlerts"/>
    </div>

    <div class="theme-toggle">
      <TButton button-type="icon" :icon="themeIcon" @click="toggleTheme"/>
    </div>

    <div class="">
      <TButton button-type="icon" icon="fa-solid fa-gears" @click="openSystemConfigs" />
    </div>
  </div>
</template>

<style scoped>
.toggles {
  align-self: flex-end;
  display: flex;
}
</style>
