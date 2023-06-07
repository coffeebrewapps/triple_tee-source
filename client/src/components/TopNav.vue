<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAlertsStore } from '@/stores/alerts';

import {
  TButton
} from 'coffeebrew-vue-components';

const router = useRouter();
const alerts = useAlertsStore();
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
</script>

<template>
  <div class="toggles">
    <div class="theme-toggle tooltipable">
      <TButton
        button-type="icon"
        :icon="themeIcon"
        @click="toggleTheme"
      />
      <span class="tooltip align-right">Switch Theme</span>
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
      <span class="tooltip align-right">System Logs</span>
    </div>

    <div class="tooltipable">
      <TButton
        button-type="icon"
        icon="fa-solid fa-database"
        @click="openDataAdmin"
      />
      <span class="tooltip align-right">Data Admin</span>
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
</template>

<style scoped>
.toggles {
  align-self: flex-end;
  display: flex;
}
</style>
