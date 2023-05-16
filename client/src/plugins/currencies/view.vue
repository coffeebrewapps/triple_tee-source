<script setup>
import { onMounted, computed, ref } from 'vue'
import axios from 'axios'

import useConfig from '@/config'
import { useValidations } from '@/utils/validations'
import DataPage from '@/components/DataPage.vue'

const config = useConfig()
const { notEarlierThan } = useValidations()

const fieldsLayout = ref([
  { code: 'md', symbol: 'md', exchangeRate: 'md' },
  { effectiveStart: 'md', effectiveEnd: 'md' }
])

const dataFields = computed(() => {
  return [
    { key: 'id', type: 'text', label: 'ID', listable: true, viewable: false, creatable: false, updatable: false },
    { key: 'code', type: 'text', label: 'Code', listable: true, viewable: true, creatable: true, updatable: false },
    { key: 'symbol', type: 'text', label: 'Symbol', listable: true, viewable: true, creatable: true, updatable: false },
    { key: 'exchangeRate', type: 'number', label: 'Exchange Rate', listable: true, viewable: true, creatable: true, updatable: true },
    { key: 'effectiveStart', type: 'date', label: 'Effectve Start', listable: true, viewable: true, creatable: true, updatable: true },
    { key: 'effectiveEnd', type: 'date', label: 'Effectve End', listable: true, viewable: true, creatable: true, updatable: true }
  ]
})

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

function validateEffectiveEnd(record) {
  return notEarlierThan(record, 'effectiveEnd', 'effectiveStart')
}

onMounted(async () => {
})
</script>

<template>
  <DataPage
    data-type="Currencies"
    url-base="api/currencies"
    schemas-url-base="api/schemas/currencies"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
  />
</template>
