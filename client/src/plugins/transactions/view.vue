<script setup>
import { onMounted, computed, ref } from 'vue'
import axios from 'axios'

import useConfig from '@/config'
import DataPage from '@/components/DataPage.vue'

const config = useConfig()

const dataFields = computed(() => {
  return [
    { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, updatable: false },
    { key: 'description', type: 'text', label: 'Description', listable: true, viewable: true, updatable: true }
  ]
})

onMounted(async () => {
})
</script>

<template>
  <DataPage
    data-type="Transactions"
    url-base="api/transactions"
    schemas-url-base="api/schemas/transactions"
    :data-fields="dataFields"
  />
</template>
