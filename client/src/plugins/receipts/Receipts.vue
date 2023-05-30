<script setup>
import { computed } from 'vue'
import DataPage from '@/components/DataPage.vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const props = defineProps({
  invoiceId: {
    type: String,
    default: null
  },
  contactId: {
    type: String,
    default: null
  }
})

import { useReceiptUtils } from './utils'
const {
  fieldsLayout,
  generateDataFields,
  validations,
  generateFilters
} = useReceiptUtils()

const dataFields = computed(() => {
  return generateDataFields(props.invoiceId, props.contactId)
})

const filters = computed(() => {
  return generateFilters(props.invoiceId, props.contactId)
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
  router.push({ name: 'View Receipt', params: { id: row.id }, query: { invoiceId: row.invoiceId, contactId: row.contactId } })
}

async function openCreatePage() {
  router.push({ name: 'Create Receipt' })
}
</script>

<template>
  <DataPage
    model-class="income_receipts"
    data-type="Receipts"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
    :actions="actions"
  />
</template>
