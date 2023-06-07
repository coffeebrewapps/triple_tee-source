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
  formatDuration,
  calculateDuration,
} = useWorkLogUtils();

const tableStyle = {
  oneline: true,
  showHeader: false,
  highlightField: 'description',
};

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
        :table-style="tableStyle"
      >
        <template #data-col.startTime="{ row }">
          Total duration <strong>{{ formatDuration(calculateDuration(row)) }}</strong>
        </template>
      </DataPage>
    </template>
  </TabContainer>
</template>
