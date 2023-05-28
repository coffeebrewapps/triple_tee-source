<script setup>
import DataPage from '@/components/DataPage.vue'

const fieldsLayout = [
  { category: 'md', name: 'md' },
  { description: 'lg' },
  { textColor: 'md', backgroundColor: 'md' }
]

const dataFields = [
  { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false, sortable: true },
  { key: 'category', type: 'text', label: 'Category', listable: true, viewable: true, creatable: true, updatable: false, filterable: true, sortable: true },
  { key: 'name', type: 'text', label: 'Name', listable: true, viewable: true, creatable: true, updatable: false },
  { key: 'description', type: 'text', label: 'Description', listable: true, viewable: true, creatable: true, updatable: true },
  { key: 'textColor', type: 'text', label: 'Text Color', listable: false, viewable: true, creatable: true, updatable: true },
  { key: 'backgroundColor', type: 'text', label: 'Background Color', listable: false, viewable: true, creatable: true, updatable: true }
]

const filters = {
  initData: {},
  layout: [
    { category: 'md' }
  ]
}
</script>

<template>
  <DataPage
    model-class="tags"
    data-type="Tags"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :filters="filters"
  />
</template>
