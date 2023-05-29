<script setup>
/*** import:global ***/
import { ref, watch, onMounted } from 'vue'
import { useRouter, RouterView } from 'vue-router'
import { useDataAccess } from './utils/dataAccess'
/*** import:global ***/

/*** import:components ***/
import Banner from './components/Banner.vue'
import NavMenu from './components/NavMenu.vue'
import TopNav from './components/TopNav.vue'
import Alerts from './components/Alerts.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
/*** import:components ***/

/*** import:stores ***/
import { useNavStore } from './stores/nav'
import { useEventsStore } from './stores/events'
import { useShortcutsStore } from './stores/shortcuts'
import { useSystemConfigsStore } from './stores/systemConfigs'
/*** import:stores ***/

/*** section:nav ***/
const router = useRouter()
const transitionName = ref('default')

const navigator = useNavStore()

watch(router.currentRoute, (to, from) => {
  transitionName.value = 'fade'
  navigator.hide()
})
/*** section:nav ***/

/*** section:shortcuts ***/
const events = useEventsStore()
const shortcuts = useShortcutsStore()
const modifier = ref(false)

function registerShortcutListener() {
  document.addEventListener('keydown', (event) => {
    const route = router.currentRoute.value.path
    if (modifier.value) {
      if (event.key !== 'Control') {
        shortcuts.emitShortcut(
          {
            route,
            eventType: `ctrl-${event.key}`
          },
          event
        )
      }
      modifier.value = false
      events.emitEvent(`toggleShortcut`, event)
    } else {
      if (event.key === 'Control') {
        modifier.value = true
        events.emitEvent(`toggleShortcut`, event)
      } else {
        shortcuts.emitShortcut(
          {
            route,
            eventType: `keydown-${event.key}`
          },
          event
        )
      }
    }
  })
}
/*** section:shortcuts ***/

/*** section:systemConfigs ***/
const systemConfigsStore = useSystemConfigsStore()
const dataAccess = useDataAccess()

async function loadSystemConfigs() {
  dataAccess
    .list('system_configs', { limit: 1, sort: { field: 'effectiveStart', order: 'desc' } })
    .then((result) => {
      const latestConfig = result.data[0] || {}
      systemConfigsStore.updateSystemConfigs(result)
    })
}
/*** section:systemConfigs ***/

onMounted(async () => {
  registerShortcutListener()
  await loadSystemConfigs()
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

        <Breadcrumbs />

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
