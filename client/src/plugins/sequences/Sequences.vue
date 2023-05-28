<script setup>
import { useValidations } from '@/utils/validations'
import DataPage from '@/components/DataPage.vue'

const { greaterThan } = useValidations()

const fieldsLayout = [
  { name: 'md' },
  { prefix: 'sm', startingNumber: 'md', suffix: 'sm', incrementStep: 'sm' }
]

const dataFields = [
  { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false, sortable: true },
  { key: 'name', type: 'text', label: 'Name', listable: true, viewable: true, creatable: true, updatable: false, filterable: true, sortable: true },
  { key: 'startingNumber', type: 'number', label: 'Starting Number', listable: true, viewable: true, creatable: true, updatable: false },
  { key: 'lastUsedNumber', type: 'number', label: 'Last Used Number', listable: true, viewable: true, creatable: false, updatable: false },
  { key: 'incrementStep', type: 'number', label: 'Increment Step', listable: true, viewable: true, creatable: true, updatable: false },
  { key: 'prefix', type: 'text', label: 'Prefix', listable: true, viewable: true, creatable: true, updatable: false, filterable: true, sortable: true },
  { key: 'suffix', type: 'text', label: 'Suffix', listable: true, viewable: true, creatable: true, updatable: false, filterable: true, sortable: true }
]

const validations = {
  create: {
    startingNumber: [
      (record) => { return greaterThan(record, 'startingNumber', 0) }
    ],
    incrementStep: [
      (record) => { return greaterThan(record, 'incrementStep', 0) }
    ]
  }
}

const filters = {
  initData: {},
  layout: [
    { name: 'md', prefix: 'md', suffix: 'md' }
  ]
}
</script>

<template>
  <DataPage
    model-class="sequences"
    data-type="Sequences"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
  />
</template>
