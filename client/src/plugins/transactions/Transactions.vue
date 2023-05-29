<script setup>
import DataPage from '@/components/DataPage.vue'
import { useFormatter } from '@/utils/formatter'
import { useSystemConfigsStore } from '@/stores/systemConfigs'

const systemConfigsStore = useSystemConfigsStore()
const {
  formatDate
} = useFormatter(systemConfigsStore)

const fieldsLayout = [
  { type: 'lg', transactionDate: 'md' },
  { description: 'lg' },
  { currencyId: 'md', amount: 'md', homeCurrencyAmount: 'md' },
  { tags: 'lg' },
  { associatedTransactionId: 'lg' }
]

function recordValue(record) {
  return record.id
}

function tagLabel(record) {
  return `${record.category}:${record.name}`
}

function currencyLabel(record) {
  const startDate = formatDate(record.effectiveStart)
  const endDate = formatDate(record.effectiveEnd)

  return `${record.code} (${startDate} - ${endDate})`
}

function transactionLabel(record) {
  return record.description
}

const dataFields = [
  { key: 'id', type: 'text', label: 'ID', listable: true, viewable: false, creatable: false, updatable: false, sortable: true },
  { key: 'type', type: 'enum', label: 'Type', listable: true, viewable: true, creatable: true, updatable: false, filterable: true },
  { key: 'transactionDate', type: 'date', label: 'Transaction Date', listable: true, viewable: true, creatable: true, updatable: true, filterable: true, sortable: true },
  { key: 'description', type: 'text', label: 'Description', listable: true, viewable: true, creatable: true, updatable: true },
  { key: 'amount', type: 'number', label: 'Amount', listable: true, viewable: true, creatable: true, updatable: true },
  { key: 'homeCurrencyAmount', type: 'number', label: 'Home Currency Amount', listable: false, viewable: true, creatable: true, updatable: true },
  {
    key: 'tags', type: 'multiSelect', label: 'Tags',
    reference: { label: tagLabel },
    listable: true, viewable: true, creatable: true, updatable: true, filterable: true,
    options: {
      server: true,
      pagination: true,
      modelClass: 'tags',
      value: recordValue,
      label: tagLabel
    }
  },
  {
    key: 'currencyId', type: 'singleSelect', label: 'Currency',
    reference: { label: currencyLabel },
    listable: true, viewable: true, creatable: true, updatable: true, filterable: true,
    options: {
      server: true,
      pagination: true,
      modelClass: 'currencies',
      value: recordValue,
      label: currencyLabel
    }
  },
  {
    key: 'associatedTransactionId', type: 'singleSelect', label: 'Associated Transaction',
    reference: { label: transactionLabel },
    listable: false, viewable: true, creatable: true, updatable: true,
    options: {
      server: true,
      pagination: true,
      modelClass: 'transactions',
      value: recordValue,
      label: transactionLabel
    }
  }
]

const filters = {
  initData: {
    type: "",
    currencyId: null,
    tags: [],
    transactionDate: {
      startDate: null,
      endDate: null
    }
  },
  layout: [
    { type: 'md', currencyId: 'md', tags: 'md' },
    { transactionDate: 'md' }
  ]
}
</script>

<template>
  <DataPage
    model-class="transactions"
    data-type="Transactions"
    :fullscreen="true"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :filters="filters"
  />
</template>
