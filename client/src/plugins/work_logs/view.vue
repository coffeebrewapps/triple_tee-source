<script setup>
import { ref, computed, onMounted } from 'vue'

import { useEventsStore } from '@/stores/events'
const events = useEventsStore()

import { useWorkLogUtils } from './utils'

import DataPage from '@/components/DataPage.vue'
import TabContainer from '@/components/TabContainer.vue'

import TodayLog from './TodayLog.vue'
import WeekLog from './WeekLog.vue'

const {
  dataFields,
  fieldsLayout,
  filters,
  validations
} = useWorkLogUtils()

const tabs = [
  { label: 'Today', onchange: updateTodayLog },
  { label: 'Weekly', onchange: updateWeeklyLogs },
  { label: 'All Logs', onchange: updateAllLogs }
]

function updateTodayLog() {
  events.emitEvent('loadTodayLogs', {})
}

function updateWeeklyLogs() {
  events.emitEvent('loadWeeklyLogs', {})
}

function updateAllLogs() {
  events.emitEvent('loadData', { dataType: 'Work Logs' })
}

function triggerTabEvent(i) {
  tabs[i].onchange()
}
</script>

<template>
  <div class="view-container">
    <h2 class="heading">Time Tracking</h2>

    <TabContainer
      :tabs="tabs"
      @tab-change="triggerTabEvent"
    >
      <template #tab-0>
        <TodayLog />
      </template>

      <template #tab-1>
        <WeekLog />
      </template>

      <template #tab-2>
        <DataPage
          data-type="Work Logs"
          url-base="api/work_logs"
          schemas-url-base="api/schemas/work_logs"
          :fullscreen="true"
          :fields-layout="fieldsLayout"
          :data-fields="dataFields"
          :validations="validations"
          :filters="filters"
        />
      </template>
    </TabContainer>
  </div>
</template>

<style scoped>
.view-container {
  margin: 1rem 0;
}

.heading {
  font-weight: 900;
}
</style>
