<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Form from '@/components/Form.vue'
import { useValidations } from '@/utils/validations'

const {
  notEarlierThan
} = useValidations()

import { useSystemConfigsStore } from '@/stores/systemConfigs'
const systemConfigsStore = useSystemConfigsStore()

const formData = ref()
const errorMessages = ref({})

const fieldKeys = computed(() => {
  return dataFields.value.filter((field) => {
    return field.creatable
  }).map(f => f.key)
})

const fieldsLayout = [
  { effectiveStart: 'md', effectiveEnd: 'md' },
  { tagFormat: 'md', timezone: 'md' },
  { baseCurrencyId: 'lg', baseContactId: 'lg' }
]

function recordValue(record) {
  return record.id
}

function currencyLabel(record) {
  return `${record.code} (${record.symbol})`
}

function contactLabel(record) {
  return record.name
}

const dataFields = computed(() => {
  return [
    { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false, sortable: true },
    { key: 'tagFormat', type: 'text', label: 'Tag Format', listable: false, viewable: true, creatable: true, updatable: true },
    { key: 'timezone', type: 'text', label: 'Timezone', listable: false, viewable: true, creatable: true, updatable: true },
    { key: 'effectiveStart', type: 'date', label: 'Effective Start', listable: true, viewable: true, creatable: true, updatable: true, filterable: true, sortable: true },
    { key: 'effectiveEnd', type: 'date', label: 'Effective End', listable: true, viewable: true, creatable: true, updatable: true, filterable: true, sortable: true },
    {
      key: 'baseCurrencyId', type: 'singleSelect', label: 'Base Currency',
      reference: { label: currencyLabel },
      listable: true, viewable: true, creatable: true, updatable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'currencies',
        value: recordValue,
        label: currencyLabel
      }
    },
    {
      key: 'baseContactId', type: 'singleSelect', label: 'Base Contact',
      reference: { label: contactLabel },
      listable: true, viewable: true, creatable: true, updatable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'contacts',
        value: recordValue,
        label: contactLabel
      }
    },
  ]
})

function validateEffectiveEnd(record) {
  return notEarlierThan(record, 'effectiveEnd', 'effectiveStart')
}

const validations = {
  create: {
    effectiveEnd: [
      validateEffectiveEnd
    ]
  },
  update: {
    effectiveEnd: [
      validateEffectiveEnd
    ]
  }
}

const filters = {
  initData: {
    effectiveStart: {
      startDate: null,
      endDate: null
    },
    effectiveEnd: {
      startDate: null,
      endDate: null
    }
  },
  layout: [
    { effectiveStart: 'md' },
    { effectiveEnd: 'md' }
  ]
}

function initFormData() {
  return {
    tagFormat: '{{ category }}:{{ name }}',
    timezone: 'UTC',
    effectiveStart: null,
    effectiveEnd: null,
    baseCurrencyId: [],
    baseContactId: []
  }
}

onMounted(() => {
  const systemConfigs = systemConfigsStore.getSystemConfigs()
  if (Object.hasOwn(systemConfigs, 'id')) {
    formData.value = systemConfigs
  } else {
    formData.value = initFormData()
  }
})
</script>

<template>
  <div class="view-container">
    <Form
      v-if="formData"
      v-model="formData"
      :fields-layout="fieldsLayout"
      :data-fields="fieldKeys"
      :schemas="dataFields"
      :error-messages="errorMessages"
      @submit=""
      @cancel=""
    />
  </div>
</template>
