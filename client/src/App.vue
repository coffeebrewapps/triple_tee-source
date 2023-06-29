<script setup>
/** import:global **/
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute, RouterView } from 'vue-router';
import { useDataAccess } from '@/utils/dataAccess';
/** import:global **/

/** import:components **/
import SystemBanner from '@/components/SystemBanner.vue';
import NavMenu from '@/components/NavMenu.vue';
import TopNav from '@/components/TopNav.vue';
import SystemAlerts from '@/components/SystemAlerts.vue';
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

const navigator = useNavStore();

router.beforeEach(async(to, from) => {
  await loadSystemConfigs();
  navigator.hide();
});

const currentRouteName = computed(() => {
  if (currentRoute.meta && currentRoute.meta.displayName) {
    return currentRoute.meta.displayName(currentRoute);
  } else {
    return currentRoute.name;
  }
});
/** section:nav **/

/** section:shortcuts **/
const events = useEventsStore();
const shortcuts = useShortcutsStore();
const modifier = ref(false);

function registerShortcutListener() {
  document.addEventListener('keydown', (event) => {
    const route = currentRoute.path;
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

onMounted(async() => {
  registerShortcutListener();
  await loadSystemConfigs();
});
</script>

<template>
  <div class="app-container">
    <NavMenu />

    <div class="content-container">
      <SystemBanner />

      <TopNav />

      <div class="divider" />

      <div class="page-heading">
        {{ currentRouteName }}
      </div>

      <RouterView v-slot="{ Component }">
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
