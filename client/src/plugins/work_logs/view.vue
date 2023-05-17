<script setup>
import useConfig from '@/config'
import { useValidations } from '@/utils/validations'
import DataPage from '@/components/DataPage.vue'

const config = useConfig()
const { notEarlierThan } = useValidations()

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
  { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false },
  { key: 'startTime', type: 'datetime', label: 'Start Time', listable: true, viewable: true, creatable: true, updatable: true },
  { key: 'endTime', type: 'datetime', label: 'End Time', listable: true, viewable: true, creatable: true, updatable: true },
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
</script>

<template>
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
