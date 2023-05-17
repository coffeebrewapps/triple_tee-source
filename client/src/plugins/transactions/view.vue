<script setup>
import { ref, onMounted } from 'vue'

import { useDataAccess } from '@/utils/dataAccess'
const dataAccess = useDataAccess()

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
  { key: 'type', type: 'enum', label: 'Type', listable: true, viewable: true, creatable: true, updatable: false },
  { key: 'transactionDate', type: 'date', label: 'Transaction Date', listable: true, viewable: true, creatable: true, updatable: true },
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
    listable: true, viewable: true, creatable: true, updatable: true,
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

const filters = ref({
  initData: {},
  schemas: [
    { key: 'type', type: 'enum', label: 'Type' },
    {
      key: 'currencyId', type: 'singleSelect', label: 'Currency',
      reference: { label: currencyLabel },
      listable: true, viewable: true, creatable: true, updatable: true,
      options: {
        server: true,
        pagination: true,
        sourceUrl: currenciesUrl,
        value: recordValue,
        label: currencyLabel
      }
    }
  ],
  layout: [
    { type: 'md', currencyId: 'md' }
  ]
})

async function loadTypeEnums() {
  return new Promise((resolve, reject) => {
    dataAccess
      .schemas(transactionSchemasUrl)
      .then((result) => {
        const fields = result.fields
        const enums = fields.type.enums
        const options = Object.keys(enums).map((e) => {
          return { value: e, label: enums[e] }
        })
        resolve(options)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

onMounted(async () => {
  await loadTypeEnums()
    .then((options) => {
      const schemas = filters.value.schemas[0]
      filters.value.schemas[0] = Object.assign({}, schemas, { options })
    })
})
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
