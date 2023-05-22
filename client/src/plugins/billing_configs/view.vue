<script setup>
import useConfig from '@/config'
import { useValidations } from '@/utils/validations'
import DataPage from '@/components/DataPage.vue'

const config = useConfig()

const { notEarlierThan, greaterThanOrEqual } = useValidations()

const tagsUrl = `${config.baseUrl}/api/tags`
const contactsUrl = `${config.baseUrl}/api/contacts`

const fieldsLayout = [
  { effectiveStart: 'md', effectiveEnd: 'md' },
  { rateType: 'md', unitCost: 'md', unit: 'md' },
  { includeTags: 'lg', excludeTags: 'lg' },
  { contactId: 'lg' }
]

const dataFields = [
  { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false, sortable: true },
  { key: 'effectiveStart', type: 'datetime', label: 'Effective Start', listable: true, viewable: true, creatable: true, updatable: false, filterable: true, sortable: true },
  { key: 'effectiveEnd', type: 'datetime', label: 'Effective End', listable: true, viewable: true, creatable: true, updatable: true, filterable: true, sortable: true },
  { key: 'rateType', type: 'enum', label: 'Rate Type', listable: true, viewable: true, creatable: true, updatable: false },
  { key: 'unit', type: 'enum', label: 'Unit', listable: true, viewable: true, creatable: true, updatable: false },
  { key: 'unitCost', type: 'number', label: 'Unit Cost', listable: true, viewable: true, creatable: true, updatable: false },
  {
    key: 'includeTags', type: 'multiSelect', label: 'Include Tags', isTags: true,
    reference: { label: tagLabel },
    listable: false, viewable: true, creatable: true, updatable: true, filterable: true,
    options: {
      server: true,
      pagination: true,
      sourceUrl: tagsUrl,
      value: recordValue,
      label: tagLabel
    }
  },
  {
    key: 'excludeTags', type: 'multiSelect', label: 'Exclude Tags', isTags: true,
    reference: { label: tagLabel },
    listable: false, viewable: true, creatable: true, updatable: true, filterable: true,
    options: {
      server: true,
      pagination: true,
      sourceUrl: tagsUrl,
      value: recordValue,
      label: tagLabel
    }
  },
  {
    key: 'contactId', type: 'singleSelect', label: 'Contact',
    reference: { label: contactLabel },
    listable: true, viewable: true, creatable: true, updatable: false, filterable: true,
    options: {
      server: true,
      pagination: true,
      sourceUrl: contactsUrl,
      value: recordValue,
      label: contactLabel
    }
  },
]

const validations = {
  create: {
    unitCost: [
      (record) => { return greaterThanOrEqual(record, 'unitCost', 0) }
    ],
    effectiveEnd: [
      validateEffectiveEnd
    ]
  }
}

const filters = {
  initData: {
    effectiveStart: {
      startTime: null,
      endTime: null
    },
    effectiveEnd: {
      startTime: null,
      endTime: null
    }
  },
  layout: [
    { effectiveStart: 'md' },
    { effectiveEnd: 'md' },
    { includeTags: 'lg', excludeTags: 'lg' },
    { contactId: 'lg' }
  ]
}

function validateEffectiveEnd(record) {
  return notEarlierThan(record, 'effectiveEnd', 'effectiveStart')
}

function recordValue(record) {
  return record.id
}

function tagLabel(record) {
  return `${record.category}:${record.name}`
}

function contactLabel(record) {
  return record.name
}
</script>

<template>
  <DataPage
    data-type="Billing Configs"
    url-base="api/billing_configs"
    schemas-url-base="api/schemas/billing_configs"
    :fullscreen="true"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
  />
</template>
