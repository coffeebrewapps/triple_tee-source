<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter, RouterView } from 'vue-router'
import Banner from './components/Banner.vue'
import NavMenu from './components/NavMenu.vue'
import TopNav from './components/TopNav.vue'
import Alerts from './components/Alerts.vue'

import { useNavStore } from './stores/nav'
import { useEventsStore } from './stores/events'

const router = useRouter()
const transitionName = ref('default')

const navigator = useNavStore()

watch(router.currentRoute, (to, from) => {
  transitionName.value = 'fade'
  navigator.hide()
})

const events = useEventsStore()

const modifier = ref(false)

onMounted(() => {
  document.addEventListener('keydown', (event) => {
    if (modifier.value) {
      events.emitEvent(
        `evalShortcut`,
        {
          route: router.currentRoute.value.path,
          key: event.key
        }
      )
      modifier.value = false
      events.emitEvent(`toggleShortcut`, event)
    } else {
      if (event.key === 'Control') {
        modifier.value = true
        events.emitEvent(`toggleShortcut`, event)
      } else {
        events.emitEvent(`keydown-${event.key}`, event)
      }
    }
  })
})
</script>

<template>
  <div class="app-container">
    <NavMenu />

    <div class="content-container">
      <Banner />

      <RouterView v-slot="{ Component }">
        <TopNav />

        <div class="divider"></div>

        <Transition mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>

      <Alerts />
    </div>
  </div>
</template>

<style scoped>
</style>
