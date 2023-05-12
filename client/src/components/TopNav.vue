<script setup>
import { computed } from 'vue'
import { useAlertsStore } from '../stores/alerts'

import {
  TButton
} from 'coffeebrew-vue-components'

const alerts = useAlertsStore()

function toggleAlerts() {
  alerts.toggle()
}
</script>

<template>
  <div class="alert-toggle">
    <TButton button-type="icon" icon="fa-solid fa-bell" @click="toggleAlerts"/>
  </div>
</template>

<style scoped>
.alert-toggle {
  align-self: flex-end;
}
</style>
