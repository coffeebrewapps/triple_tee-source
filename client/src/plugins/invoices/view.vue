<script setup>
import { computed } from 'vue'
import { useValidations } from '@/utils/validations'
import DataPage from '@/components/DataPage.vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const props = defineProps({
  contactId: {
    type: String,
    default: null
  }
})

import { useInvoiceUtils } from './utils'
const {
  fieldsLayout,
  generateDataFields,
  validations,
  generateFilters
} = useInvoiceUtils()

const dataFields = computed(() => {
  return generateDataFields(props.contactId)
})

const filters = computed(() => {
  return generateFilters(props.contactId)
})

const actions = {
  view: {
    click: async function(row, index) {
      await openViewPage(row)
    }
  },
  create: {
    click: async function() {
      await openCreatePage()
    }
  }
}

async function openViewPage(row) {
  router.push({ name: 'View Invoice', params: { id: row.id }, query: { contactId: row.contactId } })
}

async function openCreatePage() {
  router.push({ name: 'Create Invoice' })
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
    :actions="actions"
  />
</template>
