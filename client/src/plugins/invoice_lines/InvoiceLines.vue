<script setup>
import { computed } from 'vue'
import useConfig from '@/config'
import { useValidations } from '@/utils/validations'
import DataPage from '@/components/DataPage.vue'

const config = useConfig()

const {
  greaterThanOrEqual
} = useValidations()

const invoicesUrl = `${config.baseUrl}/api/invoices`

const props = defineProps({
  invoiceId: {
    type: String,
    default: null
  }
})

const fieldsLayout = [
  { description: 'lg' },
  { unit: 'md', unitCost: 'md', subtotal: 'md' },
  { invoiceId: 'lg' }
]

const dataFields = computed(() => {
  return [
    { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false, sortable: true },
    { key: 'description', type: 'text', label: 'Description', listable: true, viewable: true, creatable: true, updatable: true, filterable: true },
    { key: 'unit', type: 'enum', label: 'Unit', listable: false, viewable: true, creatable: true, updatable: true },
    { key: 'unitCost', type: 'number', label: 'Unit Cost', listable: false, viewable: true, creatable: true, updatable: true },
    { key: 'subtotal', type: 'number', label: 'Subtotal', listable: true, viewable: true, creatable: true, updatable: true },
    {
      key: 'invoiceId', type: 'singleSelect', label: 'Invoice',
      reference: { label: invoiceLabel },
      listable: false, viewable: true, creatable: true, updatable: false, filterable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'invoices',
        sourceUrl: invoicesUrl,
        value: recordValue,
        label: invoiceLabel
      }
    },
  ]
})

function recordValue(record) {
  return record.id
}

function invoiceLabel(record) {
  return record.invoiceNumber
}

const validations = {
  create: {
    unitCost: [
      (record) => { return greaterThanOrEqual(record, 'unitCost', 0) }
    ],
    subtotal: [
      (record) => { return greaterThanOrEqual(record, 'subtotal', 0) }
    ]
  },
  update: {
    unitCost: [
      (record) => { return greaterThanOrEqual(record, 'unitCost', 0) }
    ],
    subtotal: [
      (record) => { return greaterThanOrEqual(record, 'subtotal', 0) }
    ]
  }
}

const filters = computed(() => {
  const initData = {}

  if (props.invoiceId) {
    initData.invoiceId = [{ value: props.invoiceId }]
  }

  initData.description = null

  return {
    initData,
    layout: [
      { invoiceId: 'lg', description: 'lg' }
    ]
  }
})
</script>

<template>
  <DataPage
    model-class="invoice_lines"
    data-type="Invoice Lines"
    url-base="api/invoice_lines"
    schemas-url-base="api/schemas/invoice_lines"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
  />
</template>
