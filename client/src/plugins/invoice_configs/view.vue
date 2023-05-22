<script setup>
import useConfig from '@/config'
import { useValidations } from '@/utils/validations'
import DataPage from '@/components/DataPage.vue'

const config = useConfig()

const { greaterThan } = useValidations()

const tagsUrl = `${config.baseUrl}/api/tags`
const sequencesUrl = `${config.baseUrl}/api/sequences`

const fieldsLayout = [
  { invoiceCycleDurationValue: 'md', invoiceCycleDurationUnit: 'md' },
  { dueDateCycleValue: 'md', dueDateCycleUnit: 'md' },
  { paymentTerms: 'lg' },
  { tags: 'lg' },
  { customFields: 'lg' },
  { invoiceNumberSequenceId: 'lg' }
]

const dataFields = [
  { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false, sortable: true },
  { key: 'invoiceCycleDurationValue', type: 'number', label: 'Invoice Cycle Duration Value', listable: true, viewable: true, creatable: true, updatable: false },
  { key: 'invoiceCycleDurationUnit', type: 'enum', label: 'Invoice Cycle Duration Unit', listable: true, viewable: true, creatable: true, updatable: false },
  { key: 'dueDateCycleValue', type: 'number', label: 'Due Date Cycle Value', listable: true, viewable: true, creatable: true, updatable: false },
  { key: 'dueDateCycleUnit', type: 'enum', label: 'Due Date Cycle Unit', listable: true, viewable: true, creatable: true, updatable: false },
  { key: 'paymentTerms', type: 'text', label: 'Payment Terms', listable: false, viewable: true, creatable: true, updatable: true },
  {
    key: 'tags', type: 'multiSelect', label: 'Tags',
    reference: { label: tagLabel },
    listable: true, viewable: true, creatable: true, updatable: true, filterable: true,
    options: {
      server: true,
      pagination: true,
      sourceUrl: tagsUrl,
      value: recordValue,
      label: tagLabel
    }
  },
  { key: 'customFields', type: 'text', label: 'Custom Fields', listable: false, viewable: true, creatable: true, updatable: true },
  {
    key: 'invoiceNumberSequenceId', type: 'singleSelect', label: 'Sequence Number',
    reference: { label: sequenceNumberLabel },
    listable: true, viewable: true, creatable: true, updatable: false,
    options: {
      server: true,
      pagination: true,
      sourceUrl: sequencesUrl,
      value: recordValue,
      label: sequenceNumberLabel
    }
  },
]

const validations = {
  create: {
    invoiceCycleDurationValue: [
      (record) => { return greaterThan(record, 'invoiceCycleDurationValue', 0) }
    ],
    dueDateCycleValue: [
      (record) => { return greaterThan(record, 'dueDateCycleValue', 0) }
    ]
  }
}

const filters = {
  initData: {},
  layout: [
    { tags: 'md' }
  ]
}

function recordValue(record) {
  return record.id
}

function tagLabel(record) {
  return `${record.category}:${record.name}`
}

function sequenceNumberLabel(record) {
  return record.name
}
</script>

<template>
  <DataPage
    data-type="Invoice Configs"
    url-base="api/invoice_configs"
    schemas-url-base="api/schemas/invoice_configs"
    :fullscreen="true"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
  />
</template>
