<script setup>
import { useValidations } from '@/utils/validations'
import DataPage from '@/components/DataPage.vue'

const { notEarlierThan, greaterThan } = useValidations()

const fieldsLayout = [
  { code: 'md', symbol: 'md', exchangeRate: 'md' },
  { effectiveStart: 'md', effectiveEnd: 'md' }
]

const dataFields = [
  { key: 'id', type: 'text', label: 'ID', listable: true, viewable: false, creatable: false, updatable: false, sortable: true },
  { key: 'code', type: 'text', label: 'Code', listable: true, viewable: true, creatable: true, updatable: false, filterable: true, sortable: true },
  { key: 'symbol', type: 'text', label: 'Symbol', listable: true, viewable: true, creatable: true, updatable: false },
  { key: 'exchangeRate', type: 'number', label: 'Exchange Rate', listable: true, viewable: true, creatable: true, updatable: true },
  { key: 'effectiveStart', type: 'date', label: 'Effectve Start', listable: true, viewable: true, creatable: true, updatable: true, filterable: true, sortable: true },
  { key: 'effectiveEnd', type: 'date', label: 'Effectve End', listable: true, viewable: true, creatable: true, updatable: true, filterable: true, sortable: true }
]

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
    { code: 'md' },
    { effectiveStart: 'md', effectiveEnd: 'md' }
  ]
}

const validations = {
  create: {
    exchangeRate: [
      validateExchangeRate
    ],
    effectiveEnd: [
      validateEffectiveEnd
    ]
  },
  update: {
    exchangeRate: [
      validateExchangeRate
    ],
    effectiveEnd: [
      validateEffectiveEnd
    ]
  }
}

function validateEffectiveEnd(record) {
  return notEarlierThan(record, 'effectiveEnd', 'effectiveStart')
}

function validateExchangeRate(record) {
  return greaterThan(record, 'exchangeRate', 0)
}
</script>

<template>
  <DataPage
    model-class="currencies"
    data-type="Currencies"
    url-base="api/currencies"
    schemas-url-base="api/schemas/currencies"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
  />
</template>
