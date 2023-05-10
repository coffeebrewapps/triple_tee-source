<script setup>
import { onMounted, computed, ref } from 'vue'

import useConfig from '@/config'
import DataPage from '@/components/DataPage.vue'

const config = useConfig()

const fieldsLayout = ref([
  { category: 'md', name: 'md' },
  { description: 'lg' },
  { textColor: 'md', backgroundColor: 'md' }
])

const dataFields = computed(() => {
  return [
    { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false },
    { key: 'category', type: 'text', label: 'Category', listable: true, viewable: true, creatable: true, updatable: false },
    { key: 'name', type: 'text', label: 'Name', listable: true, viewable: true, creatable: true, updatable: false },
    { key: 'description', type: 'text', label: 'Description', listable: true, viewable: true, creatable: true, updatable: true },
    { key: 'textColor', type: 'text', label: 'Text Color', listable: false, viewable: true, creatable: true, updatable: true },
    { key: 'backgroundColor', type: 'text', label: 'Background Color', listable: false, viewable: true, creatable: true, updatable: true }
  ]
})

onMounted(async () => {
})
</script>

<template>
  <DataPage
    data-type="Tags"
    url-base="api/tags"
    schemas-url-base="api/schemas/tags"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
  />
</template>
