<script setup>
import { computed } from 'vue'
import useConfig from '@/config'
import { useValidations } from '@/utils/validations'
import DataPage from '@/components/DataPage.vue'

const config = useConfig()

const {
  greaterThanOrEqual,
  notEarlierThan
} = useValidations()

const contactsUrl = `${config.baseUrl}/api/contacts`
const currenciesUrl = `${config.baseUrl}/api/currencies`
const invoiceConfigsUrl = `${config.baseUrl}/api/invoice_configs`

const props = defineProps({
  contactId: {
    type: String,
    default: null
  }
})

const fieldsLayout = [
  { invoiceNumber: 'lg' },
  { invoiceDate: 'md', dueDate: 'md', totalAmount: 'md' },
  { customFields: 'lg' },
  { invoiceConfigId: 'lg' },
  { currencyId: 'lg' },
  { contactId: 'lg' },
  { voided: 'sm' }
]

const dataFields = computed(() => {
  return [
    { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false, sortable: true },
    { key: 'invoiceNumber', type: 'text', label: 'Invoice Number', listable: true, viewable: true, creatable: true, updatable: false, filterable: true, sortable: true },
    { key: 'invoiceDate', type: 'date', label: 'Invoice Date', listable: true, viewable: true, creatable: true, updatable: true, sortable: true },
    { key: 'dueDate', type: 'date', label: 'Due Date', listable: true, viewable: true, creatable: true, updatable: true },
    { key: 'totalAmount', type: 'number', label: 'Total Amount', listable: true, viewable: true, creatable: true, updatable: true },
    { key: 'customFields', type: 'object', label: 'Custom Fields', listable: true, viewable: true, creatable: true, updatable: true },
    {
      key: 'invoiceConfigId', type: 'singleSelect', label: 'Invoice Config',
      reference: { label: invoiceConfigLabel },
      listable: false, viewable: true, creatable: true, updatable: true,
      options: {
        server: true,
        pagination: true,
        sourceUrl: invoiceConfigsUrl,
        value: recordValue,
        label: invoiceConfigLabel
      }
    },
    {
      key: 'currencyId', type: 'singleSelect', label: 'Currency',
      reference: { label: currencyLabel },
      listable: false, viewable: true, creatable: true, updatable: true,
      options: {
        server: true,
        pagination: true,
        sourceUrl: currenciesUrl,
        value: recordValue,
        label: currencyLabel
      }
    },
    {
      key: 'contactId', type: 'singleSelect', label: 'Contact',
      reference: { label: contactLabel }, defaultValue: () => { return props.contactId },
      listable: true, viewable: true, creatable: true, updatable: false, filterable: true,
      options: {
        server: true,
        pagination: true,
        sourceUrl: contactsUrl,
        value: recordValue,
        label: contactLabel
      }
    }
  ]
})

function recordValue(record) {
  return record.id
}

function invoiceConfigLabel(record) {
  return `Every ${record.invoiceCycleDurationValue} ${record.invoiceCycleDurationUnit}, due in ${record.dueDateCycleValue} ${record.dueDateCycleUnit}`
}

function currencyLabel(record) {
  return `${record.code} (${record.symbol})`
}

function contactLabel(record) {
  return record.name
}

const validations = {
  create: {
    dueDate: [
      validateDueDate
    ],
    totalAmount: [
      (record) => { return greaterThanOrEqual(record, 'totalAmount', 0) }
    ]
  },
  update: {
    dueDate: [
      validateDueDate
    ],
    totalAmount: [
      (record) => { return greaterThanOrEqual(record, 'totalAmount', 0) }
    ]
  }
}

const filters = computed(() => {
  const initData = {}

  if (props.contactId) {
    initData.contactId = [{ value: props.contactId }]
  }

  initData.invoiceNumber = null

  return {
    initData,
    layout: [
      { contactId: 'lg', invoiceNumber: 'lg' }
    ]
  }
})

function validateDueDate(record) {
  return notEarlierThan(record, 'dueDate', 'invoiceDate')
}
</script>

<template>
  <DataPage
    data-type="Invoices"
    url-base="api/invoices"
    schemas-url-base="api/schemas/invoices"
    :fullscreen="true"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
  />
</template>
