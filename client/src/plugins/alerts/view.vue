<script setup>
import { onMounted, computed, ref } from 'vue'
import axios from 'axios'

import useConfig from '@/config'
import DataPage from '@/components/DataPage.vue'

const config = useConfig()

const fieldsLayout = ref([
  { title: 'md' },
  { content: 'lg' }
])

const dataFields = computed(() => {
  return [
    { key: 'id', type: 'text', label: 'ID', listable: true, viewable: false, creatable: false, updatable: false },
    { key: 'title', type: 'text', label: 'Title', listable: true, viewable: true, creatable: true, updatable: false },
    { key: 'content', type: 'text', label: 'Content', listable: false, viewable: true, creatable: true, updatable: false }
  ]
})

onMounted(async () => {
})
</script>

<template>
  <DataPage
    data-type="Alerts"
    url-base="api/alerts"
    schemas-url-base="api/schemas/alerts"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
  />
</template>
