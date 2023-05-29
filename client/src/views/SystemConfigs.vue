<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import DataPage from '@/components/DataPage.vue'
import { useValidations } from '@/utils/validations'

const {
  notEarlierThan
} = useValidations()

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

const dataFields = [
  { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false, sortable: true },
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

onMounted(() => {
})
</script>

<template>
  <DataPage
    model-class="system_configs"
    data-type="System Configs"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
  />
</template>
