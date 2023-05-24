<script setup>
/*** import:global ***/
import { ref, computed, onMounted } from 'vue'
/*** import:global ***/

/*** import:config ***/
import useConfig from '@/config'
const config = useConfig()
/*** import:config ***/

/*** import:utils ***/
import { useWorkLogUtils } from './utils'
const {
  tagsUrl,
  worklogsUrl,
  dataFields,
  recordValue,
  tagLabel
} = useWorkLogUtils()

const invoiceConfigsUrl = `${config.baseUrl}/api/invoice_configs`
const templatesUrl = `${config.baseUrl}/api/invoice_templates`
const contactsUrl = `${config.baseUrl}/api/invoice_contacts`
const billingConfigsUrl = `${config.baseUrl}/api/billing_configs`

function configLabel(record) {
  return `Every ${record.invoiceCycleDurationValue} ${record.invoiceCycleDurationUnit}, due in ${record.dueDateCycleValue} ${record.dueDateCycleUnit}`
}

const filtersDataFields = computed(() => {
  const fields = []

  fields.push(Object.assign({}, dataFields.find(f => f.key === 'tags')))
  fields.push(Object.assign({}, dataFields.find(f => f.key === 'startTime'), { type: 'datetimerange' }))
  fields.push(Object.assign({}, dataFields.find(f => f.key === 'endTime'), { type: 'datetimerange' }))

  fields.push({
    key: 'invoiceConfigId', type: 'singleSelect', label: 'Invoice Config',
    updatable: true,
    reference: { label: configLabel },
    options: {
      server: true,
      pagination: true,
      sourceUrl: invoiceConfigsUrl,
      value: recordValue,
      label: configLabel
    }
  })

  return fields
})

import { useInputHelper } from '@/utils/input'

const {
  formatFilters
} = useInputHelper(filtersDataFields.value)

import { useDataAccess } from '@/utils/dataAccess'
const dataAccess = useDataAccess()
/*** import:utils ***/

/*** import:stores ***/
import { useBannerStore } from '@/stores/banner'
const banner = useBannerStore()

import { useEventsStore } from '@/stores/events'
const events = useEventsStore()
/*** import:stores ***/

/*** import:components ***/
import Form from '@/components/Form.vue'
import TemplateEditor from '@/components/TemplateEditor.vue'
/*** import:components ***/

/*** section:props ***/
const props = defineProps({
})
/*** section:props ***/

/*** section:global ***/
const filtersData = ref({
  tags: [],
  invoiceConfigId: [],
  startTime: {
    startTime: null,
    endTime: null
  },
  endTime: {
    startTime: null,
    endTime: null
  }
})

const filtersLayout = computed(() => {
  return [
    { invoiceConfigId: 'lg', tags: 'lg' },
    { startTime: 'md' },
    { endTime: 'md' }
  ]
})

const filterableKeys = computed(() => {
  return filtersDataFields.value.map(f => f.key)
})

const filtersErrorMessages = ref({})

const filtersConfirmButton = computed(() => {
  return {
    type: 'text',
    value: 'Filter',
    icon: 'fa-solid fa-check'
  }
})

const filtersCancelButton = computed(() => {
  return {
    type: 'text',
    value: 'Cancel',
    icon: 'fa-solid fa-xmark'
  }
})
/*** section:global ***/

/*** section:banner ***/
function showBanner(message) {
  banner.show(message)
  setTimeout(hideBanner, 5000)
}

function hideBanner() {
  banner.hide()
}
/*** section:banner ***/

/*** section:events ***/
/*** section:events ***/

/*** section:styles ***/
/*** section:styles ***/

/*** section:actions ***/
const currentBillingConfig = ref()
const currentContact = ref()
const currentInvoiceConfig = ref()
const currentSequence = ref()
const currentTemplate = ref()
const templateData = ref()
const filteredWorklogs = ref({})

async function submitFilters() {
  const params = formatFilters(filtersData.value)
  dataAccess
    .create(`${worklogsUrl}/preview_invoice`, params)
    .then((result) => {
      templateData.value = result
      currentBillingConfig.value = result.billingConfigs
      currentContact.value = result.billingContact
      currentInvoiceConfig.value = result.invoiceConfig
      currentSequence.value = result.invoiceNumberSequence
      currentTemplate.value = result.invoiceTemplate
      filteredWorklogs.value = result.workLogs
    })
    .catch((error) => {
      console.error(error)
      showBanner(`Error previewing invoice!`)
    })
}

function resetFilters() {
  filtersData.value = {
    tags: [],
    invoiceConfigId: [],
    startTime: {
      startTime: null,
      endTime: null
    },
    endTime: {
      startTime: null,
      endTime: null
    }
  }
}
/*** section:actions ***/

onMounted(() => {
  resetFilters()
})
</script>

<template>
  <div class="view-template">
    <Form
      v-model="filtersData"
      :fields-layout="filtersLayout"
      :data-fields="filterableKeys"
      :schemas="filtersDataFields"
      :error-messages="filtersErrorMessages"
      :confirm-button="filtersConfirmButton"
      :cancel-button="filtersCancelButton"
      @submit="submitFilters"
      @cancel="resetFilters"
    />

    <TemplateEditor
      v-if="currentTemplate"
      :templates-url="templatesUrl"
      :id="currentTemplate.id"
      :content-markup="currentTemplate.contentMarkup"
      :content-styles="currentTemplate.contentStyles"
      :data="templateData"
      :disabled="true"
    />
  </div>
</template>

<style scoped>
</style>
