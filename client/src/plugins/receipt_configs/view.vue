<script setup>
import { computed } from 'vue'
import useConfig from '@/config'
import { useValidations } from '@/utils/validations'
import DataPage from '@/components/DataPage.vue'

const config = useConfig()

const { greaterThan } = useValidations()

const sequencesUrl = `${config.baseUrl}/api/sequences`
const contactsUrl = `${config.baseUrl}/api/contacts`
const templatesUrl = `${config.baseUrl}/api/receipt_templates`

const props = defineProps({
  billingContactId: {
    type: String,
    default: null
  }
})

const fieldsLayout = [
  { customFields: 'lg' },
  { receiptNumberSequenceId: 'lg' },
  { billingContactId: 'lg' },
  { receiptTemplateId: 'lg' }
]

const dataFields = computed(() => {
  return [
    { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false, sortable: true },
    { key: 'customFields', type: 'object', label: 'Custom Fields (JSON)', listable: false, viewable: true, creatable: true, updatable: true },
    {
      key: 'receiptNumberSequenceId', type: 'singleSelect', label: 'Sequence Number',
      reference: { label: sequenceNumberLabel },
      listable: false, viewable: true, creatable: true, updatable: false,
      options: {
        server: true,
        pagination: true,
        sourceUrl: sequencesUrl,
        value: recordValue,
        label: sequenceNumberLabel
      }
    },
    {
      key: 'billingContactId', type: 'singleSelect', label: 'Contact',
      reference: { label: contactLabel }, defaultValue: () => { return props.billingContactId },
      listable: true, viewable: true, creatable: true, updatable: false, filterable: true,
      options: {
        server: true,
        pagination: true,
        sourceUrl: contactsUrl,
        value: recordValue,
        label: contactLabel
      }
    },
    {
      key: 'receiptTemplateId', type: 'singleSelect', label: 'Template',
      reference: { label: templateLabel },
      listable: false, viewable: true, creatable: true, updatable: true,
      options: {
        server: true,
        pagination: true,
        sourceUrl: templatesUrl,
        value: recordValue,
        label: templateLabel
      }
    }
  ]
})

const validations = {
}

const filters = computed(() => {
  const initData = {}

  if (props.billingContactId) {
    initData.billingContactId = [{ value: props.billingContactId }]
  }

  return {
    initData,
    layout: [
      { billingContactId: 'lg' }
    ]
  }
})

function recordValue(record) {
  return record.id
}

function sequenceNumberLabel(record) {
  return record.name
}

function contactLabel(record) {
  return record.name
}

function templateLabel(record) {
  return record.name
}
</script>

<template>
  <DataPage
    data-type="Receipt Configs"
    url-base="api/receipt_configs"
    schemas-url-base="api/schemas/receipt_configs"
    :fullscreen="true"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
  />
</template>
