<script setup>
import useConfig from '@/config'
import DataPage from '@/components/DataPage.vue'

const config = useConfig()

const transactionSchemasUrl = `${config.baseUrl}/api/schemas/transactions`
const tagsUrl = `${config.baseUrl}/api/tags`
const currenciesUrl = `${config.baseUrl}/api/currencies`
const transactionsUrl = `${config.baseUrl}/api/transactions`

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
  return `${record.symbol} (${record.code})`
}

function transactionLabel(record) {
  return record.description
}

const dataFields = [
  { key: 'id', type: 'text', label: 'ID', listable: true, viewable: false, creatable: false, updatable: false },
  { key: 'type', type: 'enum', label: 'Type', listable: true, viewable: true, creatable: true, updatable: false, filterable: true },
  { key: 'transactionDate', type: 'date', label: 'Transaction Date', listable: true, viewable: true, creatable: true, updatable: true, filterable: true },
  { key: 'description', type: 'text', label: 'Description', listable: true, viewable: true, creatable: true, updatable: true },
  { key: 'amount', type: 'number', label: 'Amount', listable: true, viewable: true, creatable: true, updatable: true },
  { key: 'homeCurrencyAmount', type: 'number', label: 'Home Currency Amount', listable: false, viewable: true, creatable: true, updatable: true },
  {
    key: 'tags', type: 'multiSelect', label: 'Tags',
    reference: { label: tagLabel },
    listable: true, viewable: true, creatable: true, updatable: true,
    options: {
      server: true,
      pagination: true,
      sourceUrl: tagsUrl,
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
      sourceUrl: currenciesUrl,
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
      sourceUrl: transactionsUrl,
      value: recordValue,
      label: transactionLabel
    }
  }
]

const filters = {
  initData: {
    type: "",
    currencyId: null,
    transactionDate: {
      startDate: null,
      endDate: null
    }
  },
  layout: [
    { type: 'md', currencyId: 'md', transactionDate: 'md' }
  ]
}
</script>

<template>
  <DataPage
    data-type="Transactions"
    url-base="api/transactions"
    schemas-url-base="api/schemas/transactions"
    :fullscreen="true"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :filters="filters"
  />
</template>
