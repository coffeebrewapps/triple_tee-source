<script setup>
import { ref } from 'vue';
import { useFormatter } from '@/utils/formatter';
import { useEventsStore } from '@/stores/events';
import { useSystemConfigsStore } from '@/stores/systemConfigs';

import { useWorkLogUtils } from './utils';

import DataPage from '@/components/DataPage.vue';
import TabContainer from '@/components/TabContainer.vue';

import TodayLog from './TodayLog.vue';
import WeekLog from './WeekLog.vue';

const events = useEventsStore();

const {
  formatTagSync,
  tagStyle,
} = useFormatter();
const systemConfigsStore = useSystemConfigsStore();
const systemConfigs = systemConfigsStore.getSystemConfigs();

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
        <template #[`data-col.startTime`]="{ row }">
          Total duration <strong>{{ formatDuration(calculateDuration(row)) }}</strong>
        </template>

        <template #[`data-col.tags`]="{ row, key, rawValue }">
          <span
            v-for="(tag, t) in rawValue"
            :key="t"
            class="tag inline"
            :style="tagStyle(row, tag, key)"
          >
            {{ formatTagSync(row, tag, key, systemConfigs.tagFormat) }}
          </span>
        </template>
      </DataPage>
    </template>
  </TabContainer>
</template>
