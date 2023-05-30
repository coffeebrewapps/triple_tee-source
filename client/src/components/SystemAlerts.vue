<script setup>
import { computed } from 'vue';
import { useAlertsStore } from '@/stores/alerts';
import { useFormatter } from '@/utils/formatter';
import { useSystemConfigsStore } from '@/stores/systemConfigs';

const alerts = useAlertsStore();

const systemConfigsStore = useSystemConfigsStore();
const {
  formatTimestamp,
} = useFormatter(systemConfigsStore);

const showAlerts = computed(() => {
  return alerts.showAlert;
});

const messages = computed(() => {
  return alerts.alerts;
});

const alertsContainerClass = computed(() => {
  if (showAlerts.value) {
    return `alerts-container show`;
  } else {
    return `alerts-container hide`;
  }
});

function toggle() {
  alerts.toggle();
}
</script>

<template>
  <div
    :class="alertsContainerClass"
  >
    <div
      class="toggle"
      @click="toggle"
    >
      <i class="fa-sharp fa-solid fa-xmark" />
    </div>

    <div
      v-for="({ heading, message, timestamp }, i) in messages"
      :key="i"
      class="message-container"
    >
      <div class="heading">
        {{ heading }}
      </div>
      <div class="content">
        {{ message }}
      </div>
      <div class="timestamp">
        {{ formatTimestamp(timestamp) }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.alerts-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
  position: fixed;
  padding: 1.5rem;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background-color: var(--color-background-mute);
  border-radius: 4px 0 0 4px;
  transition: all 0.5s linear;
}

.alerts-container.show {
  transform: translate(0px, 0);
}

.alerts-container.hide {
  transform: translate(300px, 0);
}

.alerts-container .toggle {
  display: grid;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.alerts-container .toggle:hover {
  cursor: pointer;
  background-color: var(--color-border-hover);
}

.alerts-container .message-container {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.5rem;
  width: 100%;
  border-radius: 4px;
  border: 1px solid var(--color-border-hover);
  background-color: var(--color-background-soft);
  font-size: 0.8rem;
}

.alerts-container .message-container .heading {
  font-weight: 900;
}

.alerts-container .message-container .timestamp {
  font-size: 0.6rem;
}
</style>
