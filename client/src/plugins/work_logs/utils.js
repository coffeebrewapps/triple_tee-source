import { computed } from 'vue'

import useConfig from '@/config'
import { useValidations } from '@/utils/validations'

const config = useConfig()
const {
  isEmpty,
  notEarlierThan
} = useValidations()

export function useWorkLogUtils() {
  const schemasUrl = `${config.baseUrl}/api/schemas/work_logs`
  const tagsUrl = `${config.baseUrl}/api/tags`
  const worklogsUrl = `${config.baseUrl}/api/work_logs`

  const dataFields = [
    { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false, sortable: true },
    { key: 'startTime', type: 'datetime', label: 'Start Time', defaultValue: () => { return new Date() }, listable: true, viewable: true, creatable: true, updatable: true, filterable: true, sortable: true },
    { key: 'endTime', type: 'datetime', label: 'End Time', listable: true, viewable: true, creatable: true, updatable: true, filterable: true, sortable: true },
    { key: 'description', type: 'text', label: 'Description', defaultValue: () => { return `New Task` }, listable: true, viewable: true, creatable: true, updatable: true },
    { key: 'content', type: 'textarea', label: 'Content', listable: false, viewable: true, creatable: true, updatable: true },
    {
      key: 'tags', type: 'multiSelect', label: 'Tags',
      reference: { label: tagLabel },
      listable: true, viewable: true, creatable: true, updatable: true, filterable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'tags',
        sourceUrl: tagsUrl,
        value: recordValue,
        label: tagLabel
      }
    }
  ]

  const fieldsLayout = [
    { startTime: 'md', endTime: 'md' },
    { description: 'lg' },
    { content: 'lg' },
    { tags: 'lg' }
  ]

  const filters = {
    initData: {
      startTime: {
        startTime: null,
        endTime: null
      },
      endTime: {
        startTime: null,
        endTime: null
      }
    },
    layout: [
      { tags: 'md' },
      { startTime: 'md' },
      { endTime: 'md' }
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

  function recordValue(record) {
    return record.id
  }

  function tagLabel(record) {
    return `${record.category}:${record.name}`
  }

  function validateEndTime(record) {
    return notEarlierThan(record, 'endTime', 'startTime')
  }

  function formatDuration(ms) {
    if (ms === 0) {
      return `0 h 0 m 0 s`
    }

    const days = Math.floor(ms / 1000 / 60 / 60 / 24)
    const daysInMs = days * 1000 * 60 * 60 * 24

    const hours = Math.floor((ms - daysInMs) / 1000 / 60 / 60)
    const hoursInMs = hours * 1000 * 60 * 60

    const minutes = Math.floor((ms - daysInMs - hoursInMs) / 1000 / 60)
    const minutesInMs = minutes * 1000 * 60

    const seconds = Math.floor((ms - daysInMs - hoursInMs - minutesInMs) / 1000)

    const parts = []

    if (days > 0) {
      parts.push(`${days} d`)
    }

    if (hours > 0) {
      parts.push(`${hours} h`)
    }

    if (minutes > 0) {
      parts.push(`${minutes} m`)
    }

    if (seconds > 0) {
      parts.push(`${seconds} s`)
    }

    return parts.join(' ')
  }

  function calculateDuration(entry) {
    if (isEmpty(entry.endTime)) {
      return ((new Date()) - (new Date(entry.startTime)))
    } else {
      return ((new Date(entry.endTime)) - (new Date(entry.startTime)))
    }
  }

  const include = computed(() => {
    return dataFields.filter(h => h.reference)
  })

  const includeKeys = computed(() => {
    return include.value.map(h => h.key)
  })

  return {
    schemasUrl,
    tagsUrl,
    worklogsUrl,
    dataFields,
    fieldsLayout,
    filters,
    validations,
    formatDuration,
    calculateDuration,
    includeKeys,
    recordValue,
    tagLabel
  }
}
