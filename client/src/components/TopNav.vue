<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAlertsStore } from '@/stores/alerts';
import { useValidations } from '@/utils/validations';
import { useEventsStore } from '@/stores/events';

import {
  TButton
} from 'coffeebrew-vue-components';

const router = useRouter();
const currentRoute = useRoute();
const alerts = useAlertsStore();
const events = useEventsStore();
const { isEmpty, notEmpty } = useValidations();

const theme = ref(true); // true: dark, false: light

const themeIcon = computed(() => {
  if (theme.value) {
    return `fa-solid fa-moon`;
  } else {
    return `fa-solid fa-sun`;
  }
});

function toggleAlerts() {
  alerts.toggle();
}

function toggleTheme() {
  theme.value = !theme.value;

  document.body.classList.toggle('dark', theme.value);
  document.body.classList.toggle('light', !theme.value);

  events.emitEvent('themeChange', { newVal: theme.value });
}

function goToHome() {
  router.push({ name: 'Home' });
}

function openSystemAdmin() {
  router.push({ name: 'Configure' });
}

function openLogs() {
  router.push({ name: 'System Logs' });
}

function openDataAdmin() {
  router.push({ name: 'Data Admin' });
}

function openInbox() {
  router.push({ name: 'Inbox' });
}

const hasParentRoute = computed(() => {
  return notEmpty(currentRoute.meta) && notEmpty(currentRoute.meta.parentRoute);
});

function findParentRoute() {
  return router.getRoutes().find((route) => {
    if (isEmpty(currentRoute.meta)) { return false; }
    if (isEmpty(currentRoute.meta.parentRoute)) { return false; }

    return route.name === currentRoute.meta.parentRoute.name;
  });
}

function goBackToParent() {
  if (isEmpty(currentRoute.meta)) { return; }
  if (isEmpty(currentRoute.meta.parentRoute)) { return; }

  const parentRoute = findParentRoute();
  if (isEmpty(parentRoute)) { return; }

  if (notEmpty(parentRoute.meta) && notEmpty(parentRoute.meta.buildParams)) {
    router.push({ name: parentRoute.name, ...parentRoute.meta.buildParams(currentRoute) });
  } else {
    router.push({ name: parentRoute.name });
  }
}
</script>

<template>
  <div class="nav-container">
    <div class="routes">
      <div
        v-if="hasParentRoute"
        class="route tooltipable"
      >
        <TButton
          button-type="icon"
          icon="fa-solid fa-arrow-left"
          @click="goBackToParent"
        />
        <span class="tooltip align-middle align-left">Go Back</span>
      </div>
    </div>

    <div class="toggles">
      <div class="tooltipable">
        <TButton
          button-type="icon"
          icon="fa-solid fa-house"
          @click="goToHome"
        />
        <span class="tooltip align-right">Home</span>
      </div>

      <div class="theme-toggle tooltipable">
        <TButton
          button-type="icon"
          :icon="themeIcon"
          @click="toggleTheme"
        />
        <span class="tooltip">Theme</span>
      </div>

      <div class="tooltipable">
        <TButton
          button-type="icon"
          icon="fa-solid fa-screwdriver-wrench"
          @click="openSystemAdmin"
        />
        <span class="tooltip align-right">Configure</span>
      </div>

      <div class="tooltipable">
        <TButton
          button-type="icon"
          icon="fa-solid fa-file-lines"
          @click="openLogs"
        />
        <span class="tooltip align-right">Logs</span>
      </div>

      <div class="tooltipable">
        <TButton
          button-type="icon"
          icon="fa-solid fa-database"
          @click="openDataAdmin"
        />
        <span class="tooltip align-right">Data</span>
      </div>

      <div class="tooltipable">
        <TButton
          button-type="icon"
          icon="fa-solid fa-inbox"
          @click="openInbox"
        />
        <span class="tooltip align-right">Inbox</span>
      </div>

      <div class="alert-toggle tooltipable">
        <TButton
          button-type="icon"
          icon="fa-solid fa-bell"
          @click="toggleAlerts"
        />
        <span class="tooltip align-right">Alerts</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nav-container {
  display: flex;
  align-items: center;
}

.nav-container .routes {
  display: flex;
  flex-grow: 1;
}

.nav-container .toggles {
  display: flex;
}
</style>
