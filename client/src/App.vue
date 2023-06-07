<script setup>
/** import:global **/
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute, RouterView } from 'vue-router';
import { useDataAccess } from '@/utils/dataAccess';
/** import:global **/

/** import:components **/
import SystemBanner from '@/components/SystemBanner.vue';
import NavMenu from '@/components/NavMenu.vue';
import TopNav from '@/components/TopNav.vue';
import SystemAlerts from '@/components/SystemAlerts.vue';
import BreadCrumbs from '@/components/BreadCrumbs.vue';
/** import:components **/

/** import:stores **/
import { useNavStore } from '@/stores/nav';
import { useEventsStore } from '@/stores/events';
import { useShortcutsStore } from '@/stores/shortcuts';
import { useSystemConfigsStore } from '@/stores/systemConfigs';
/** import:stores **/

/** section:nav **/
const router = useRouter();
const currentRoute = useRoute();
const transitionName = ref('default');

const navigator = useNavStore();

watch(router.currentRoute, (to, from) => {
  transitionName.value = 'fade';
  loadSystemConfigs();
  navigator.hide();
});
/** section:nav **/

/** section:shortcuts **/
const events = useEventsStore();
const shortcuts = useShortcutsStore();
const modifier = ref(false);

function registerShortcutListener() {
  document.addEventListener('keydown', (event) => {
    const route = router.currentRoute.value.path;
    if (modifier.value) {
      if (event.key !== 'Control') {
        shortcuts.emitShortcut(
          {
            route,
            eventType: `ctrl-${event.key}`,
          },
          event
        );
      }
      modifier.value = false;
      events.emitEvent(`toggleShortcut`, event);
    } else {
      if (event.key === 'Control') {
        modifier.value = true;
        events.emitEvent(`toggleShortcut`, event);
      } else {
        shortcuts.emitShortcut(
          {
            route,
            eventType: `keydown-${event.key}`,
          },
          event
        );
      }
    }
  });
}
/** section:shortcuts **/

/** section:systemConfigs **/
const systemConfigsStore = useSystemConfigsStore();
const dataAccess = useDataAccess();

async function loadSystemConfigs() {
  dataAccess
    .list('system_configs', {}, { path: 'latest' })
    .then((result) => {
      const latestConfig = result.record || {};
      systemConfigsStore.updateSystemConfigs(latestConfig);
    });
}
/** section:systemConfigs **/

onMounted(() => {
  registerShortcutListener();
});
</script>

<template>
  <div class="app-container">
    <NavMenu />

    <div class="content-container">
      <SystemBanner />

      <RouterView v-slot="{ Component }">
        <TopNav />

        <div class="divider" />

        <div class="page-heading">
          {{ currentRoute.name }}
        </div>

        <Transition mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>

      <SystemAlerts />
    </div>
  </div>
</template>

<style scoped>
.page-heading {
  padding: 1rem 0;
  font-size: 1.2rem;
  font-weight: 900;
}
</style>
