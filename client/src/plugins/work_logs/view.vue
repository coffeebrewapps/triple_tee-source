<script setup>
import { ref, computed, onMounted } from 'vue'

import useConfig from '@/config'
import { useValidations } from '@/utils/validations'

import DataPage from '@/components/DataPage.vue'
import TabContainer from '@/components/TabContainer.vue'

import WeekLog from './WeekLog.vue'

const config = useConfig()
const {
  notEarlierThan
} = useValidations()

const tagsUrl = `${config.baseUrl}/api/tags`

const fieldsLayout = [
  { startTime: 'md', endTime: 'md' },
  { description: 'lg' },
  { content: 'lg' },
  { tags: 'lg' }
]

function recordValue(record) {
  return record.id
}

function tagLabel(record) {
  return `${record.category}:${record.name}`
}

const dataFields = [
  { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false, sortable: true },
  { key: 'startTime', type: 'datetime', label: 'Start Time', listable: true, viewable: true, creatable: true, updatable: true, sortable: true },
  { key: 'endTime', type: 'datetime', label: 'End Time', listable: true, viewable: true, creatable: true, updatable: true, sortable: true },
  { key: 'description', type: 'text', label: 'Description', listable: true, viewable: true, creatable: true, updatable: true },
  { key: 'content', type: 'textarea', label: 'Content', listable: false, viewable: true, creatable: true, updatable: true },
  {
    key: 'tags', type: 'multiSelect', label: 'Tags',
    reference: { label: tagLabel },
    listable: true, viewable: true, creatable: true, updatable: true, filterable: true,
    options: {
      server: true,
      pagination: true,
      sourceUrl: tagsUrl,
      value: recordValue,
      label: tagLabel
    }
  }
]

const filters = {
  initData: {},
  layout: [
    { tags: 'md' }
  ]
}

const validations = {
  create: {
    endTime: [
      validateEndTime
    ]
  },
  update: {
    endTime: [
      validateEndTime
    ]
  }
}

function validateEndTime(record) {
  return notEarlierThan(record, 'endTime', 'startTime')
}

const tabs = [
  { label: 'Weekly' },
  { label: 'All Logs' }
]
</script>

<template>
  <div class="view-container">
    <h2 class="heading">Time Tracking</h2>

    <TabContainer
      :tabs="tabs"
      @tab-change="loadWeekly"
    >
      <template #tab-0>
        <WeekLog />
      </template>

      <template #tab-1>
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
