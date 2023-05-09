<script setup>

import { onMounted, computed, ref } from 'vue'
import axios from 'axios'

import useConfig from '@/config'
import DataPage from '@/components/DataPage.vue'
import {
  TAlert
} from 'coffeebrew-vue-components'


const config = useConfig()

const errorAlert = ref(false)
const errorContent = ref('')

const tagsUrl = computed(() => {
  return `${config.baseUrl}/api/tags`
})

const transactionsUrl = computed(() => {
  return `${config.baseUrl}/api/transactions`
})

const tags = ref([])
const transactions = ref([])

const fieldsLayout = ref([
  { type: 'lg', transactionDate: 'md' },
  { description: 'lg' },
  { currencyId: 'md', amount: 'md', homeCurrencyAmount: 'md' },
  { tags: 'lg' },
  { associatedTransactionId: 'md' }
])

const dataFields = computed(() => {
  return [
    { key: 'id', type: 'text', label: 'ID', listable: true, viewable: false, creatable: false, updatable: false },
    { key: 'type', type: 'enum', label: 'Type', listable: true, viewable: true, creatable: true, updatable: false },
    { key: 'transactionDate', type: 'date', label: 'Transaction Date', listable: true, viewable: true, creatable: true, updatable: true },
    { key: 'description', type: 'text', label: 'Description', listable: true, viewable: true, creatable: true, updatable: true },
    { key: 'amount', type: 'number', label: 'Amount', listable: true, viewable: true, creatable: true, updatable: true },
    { key: 'homeCurrencyAmount', type: 'number', label: 'Home Currency Amount', listable: false, viewable: true, creatable: true, updatable: true },
    { key: 'tags', type: 'multiSelect', label: 'Tags', listable: true, viewable: true, creatable: true, updatable: true, options: tags.value },
    { key: 'currencyId', type: 'text', label: 'Currency', listable: false, viewable: true, creatable: true, updatable: true },
    { key: 'associatedTransactionId', type: 'select', label: 'Associated Transaction', listable: false, viewable: true, creatable: true, updatable: true, options: transactions.value }
  ]
})

async function loadTags() {
  await axios
    .get(tagsUrl.value)
    .then((res) => {
      tags.value = res.data.data.map(record => {
        return {
          value: record.id,
          label: `${record.category}:${record.name}`
        }
      })
    })
    .catch((err) => {
      errorAlert.value = true
      errorContent.value = JSON.stringify(err)
    })
}

async function loadTransactions() {
  await axios
    .get(transactionsUrl.value)
    .then((res) => {
      transactions.value = res.data.data.map(record => {
        return {
          value: record.id,
          label: record.description
        }
      })
    })
    .catch((err) => {
      errorAlert.value = true
      errorContent.value = JSON.stringify(err)
    })
}

onMounted(async () => {
  await loadTags()
  await loadTransactions()
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

  <TAlert
    title="Error"
    :content="errorContent"
    :width="400"
    :height="250"
    v-model="errorAlert"
  />
</template>
