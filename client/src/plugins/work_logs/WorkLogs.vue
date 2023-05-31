<script setup>
import { ref } from 'vue';
import { useEventsStore } from '@/stores/events';

import { useWorkLogUtils } from './utils';

import DataPage from '@/components/DataPage.vue';
import TabContainer from '@/components/TabContainer.vue';

import TodayLog from './TodayLog.vue';
import WeekLog from './WeekLog.vue';

const events = useEventsStore();

const {
  dataFields,
  fieldsLayout,
  filters,
  validations,
} = useWorkLogUtils();

const selectedTab = ref(0);
const tabs = [
  { label: 'Today', onchange: updateTodayLog },
  { label: 'Weekly', onchange: updateWeeklyLogs },
  { label: 'All Logs', onchange: updateAllLogs },
];

function updateTodayLog() {
  events.emitEvent('loadTodayLogs', {});
}

function updateWeeklyLogs() {
  events.emitEvent('loadWeeklyLogs', {});
}

function updateAllLogs() {
  events.emitEvent('loadData', { dataType: 'Work Logs' });
}

async function triggerTabEvent(i) {
  await tabs[i].onchange();
  selectedTab.value = i;
}
</script>

<template>
  <div class="view-container">
    <h2 class="heading">
      Time Tracking
    </h2>

    <TabContainer
      :tabs="tabs"
      :selected-tab="selectedTab"
      @tab-change="triggerTabEvent"
    >
      <template #tab-0>
        <TodayLog
          v-if="selectedTab === 0"
        />
      </template>

      <template #tab-1>
        <WeekLog
          v-if="selectedTab === 1"
        />
      </template>

      <template #tab-2>
        <DataPage
          v-if="selectedTab === 2"
          model-class="work_logs"
          data-type="Work Logs"
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
