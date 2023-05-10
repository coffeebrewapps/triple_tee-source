<script setup>

import { onMounted, computed, ref } from 'vue'

import useConfig from '@/config'
import DataPage from '@/components/DataPage.vue'

const config = useConfig()

const tagsUrl = computed(() => {
  return `${config.baseUrl}/api/tags`
})

const transactionsUrl = computed(() => {
  return `${config.baseUrl}/api/transactions`
})

const fieldsLayout = ref([
  { type: 'lg', transactionDate: 'md' },
  { description: 'lg' },
  { currencyId: 'md', amount: 'md', homeCurrencyAmount: 'md' },
  { tags: 'lg' },
  { associatedTransactionId: 'md' }
])

function recordValue(record) {
  return record.id
}

function tagLabel(record) {
  return `${record.category}:${record.name}`
}

function transactionLabel(record) {
  return record.description
}

const dataFields = computed(() => {
  return [
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
        sourceUrl: tagsUrl.value,
        value: recordValue,
        label: tagLabel
      }
    },
    { key: 'currencyId', type: 'text', label: 'Currency', listable: false, viewable: true, creatable: true, updatable: true },
    {
      key: 'associatedTransactionId', type: 'select', label: 'Associated Transaction',
      reference: { label: transactionLabel },
      listable: false, viewable: true, creatable: true, updatable: true,
      options: {
        server: true,
        sourceUrl: transactionsUrl.value,
        value: recordValue,
        label: transactionLabel
      }
    }
  ]
})

onMounted(async () => {
})
</script>

<template>
  <DataPage
    data-type="Transaction"
    url-base="api/transactions"
    schemas-url-base="api/schemas/transactions"
    :form-dialog-full-screen="true"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
  />
</template>

<style scoped>
.data-value.tags {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
</style>
