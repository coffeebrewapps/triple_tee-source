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
    {
      key: 'tags', type: 'multiSelect', label: 'Tags', reference: true,
      listable: true, viewable: true, creatable: true, updatable: true,
      options: {
        server: true,
        sourceUrl: tagsUrl.value,
        value: (record) => { return record.id },
        label: (record) => { return `${record.category}:${record.name}` }
      }
    },
    { key: 'currencyId', type: 'text', label: 'Currency', listable: false, viewable: true, creatable: true, updatable: true },
    {
      key: 'associatedTransactionId', type: 'select', label: 'Associated Transaction', reference: true,
      listable: false, viewable: true, creatable: true, updatable: true,
      options: {
        server: true,
        sourceUrl: transactionsUrl.value,
        value: (record) => { return record.id },
        label: (record) => { return record.description }
      }
    }
  ]
})

function formatTags(value) {
  return value.split(', ')
}

async function loadTags(offset = 0 , limit = 5) {
  return new Promise((resolve, reject) => {
    axios
      .get(tagsUrl.value, { params: { offset, limit } })
      .then((res) => {
        const data = res.data.data.map((record) => {
          return {
            value: record.id,
            label: `${record.category}:${record.name}`
          }
        })
        resolve({
          total: res.data.total,
          data: data
        })
      })
      .catch((err) => {
        reject(err)
      })
  })
}

async function loadTransactions(offset = 0 , limit = 5) {
  return new Promise((resolve, reject) => {
    axios
      .get(transactionsUrl.value, { params: { offset, limit } })
      .then((res) => {
        const data = res.data.data.map(record => {
          return {
            value: record.id,
            label: record.description
          }
        })
        resolve({
          total: res.data.total,
          data: data
        })
      })
      .catch((err) => {
        reject(err)
      })
  })
}

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
  >
    <template #view-col.tags="{ field, value, formattedValue }">
      <div class="data-label">Tags</div>
      <div class="data-value tags">
        <div
          class="tag"
          v-for="tag in formatTags(formattedValue)"
        >
          {{ tag }}
        </div>
      </div>
    </template>
  </DataPage>

  <TAlert
    title="Error"
    :content="errorContent"
    :width="400"
    :height="250"
    v-model="errorAlert"
  />
</template>

<style scoped>
.data-value.tags {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
</style>
