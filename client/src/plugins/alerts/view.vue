<script setup>
import DataPage from '@/components/DataPage.vue'

const fieldsLayout = [
  { title: 'md' },
  { content: 'lg' }
]

const dataFields = [
  { key: 'id', type: 'text', label: 'ID', listable: true, viewable: false, creatable: false, updatable: false },
  { key: 'title', type: 'text', label: 'Title', listable: true, viewable: true, creatable: true, updatable: false },
  { key: 'content', type: 'text', label: 'Content', listable: false, viewable: true, creatable: true, updatable: false }
]
</script>

<template>
  <DataPage
    model-class="alerts"
    data-type="Alerts"
    url-base="api/alerts"
    schemas-url-base="api/schemas/alerts"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
  />
</template>
