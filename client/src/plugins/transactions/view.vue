<script setup>

import { onMounted, computed, ref } from 'vue'
import axios from 'axios'

import useConfig from '@/config'
import DataPage from '@/components/DataPage.vue'

const config = useConfig()

const fieldsLayout = ref([
  { type: 'lg', transactionDate: 'md' },
  { description: 'lg' },
  { currencyId: 'md', amount: 'md', homeCurrencyAmount: 'md' },
  { tags: 'lg' },
  { associatedTransactionId: 'md' }
])

const dataFields = computed(() => {
  return [
    { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false },
    { key: 'type', type: 'enum', label: 'Type', listable: true, viewable: true, creatable: true, updatable: false, options: [] },
    { key: 'transactionDate', type: 'date', label: 'Transaction Date', listable: true, viewable: true, creatable: true, updatable: true },
    { key: 'description', type: 'text', label: 'Description', listable: true, viewable: true, creatable: true, updatable: true },
    { key: 'amount', type: 'number', label: 'Amount', listable: true, viewable: true, creatable: true, updatable: true },
    { key: 'homeCurrencyAmount', type: 'number', label: 'Home Currency Amount', listable: false, viewable: true, creatable: true, updatable: true },
    { key: 'tags', type: 'array', label: 'Tags', listable: true, viewable: true, creatable: true, updatable: true },
    { key: 'currencyId', type: 'text', label: 'Currency ID', listable: false, viewable: true, creatable: true, updatable: true },
    { key: 'associatedTransactionId', type: 'text', label: 'Associated Transaction ID', listable: false, viewable: true, creatable: true, updatable: true }
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
    :form-dialog-full-screen="false"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
  />
</template>
