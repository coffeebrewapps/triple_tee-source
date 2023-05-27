<script setup>
/*** import:global ***/
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
/*** import:global ***/

/*** import:utils ***/
import { useValidations } from '@/utils/validations'
const { isEmpty, notEmpty } = useValidations()

import { useDataAccess } from '@/utils/dataAccess'
const dataAccess = useDataAccess()

import { useInvoiceUtils } from './utils'
import { useInputHelper } from '@/utils/input'
/*** import:utils ***/

/*** import:stores ***/
import { useBannerStore } from '@/stores/banner'
const banner = useBannerStore()
/*** import:stores ***/

/*** import:components ***/
import {
  TButton,
  TInput,
  TSelect,
  TTable
} from 'coffeebrew-vue-components'

import WorkflowContainer from '@/components/WorkflowContainer.vue'
import Form from '@/components/Form.vue'
import TemplateEditor from '@/components/TemplateEditor.vue'
/*** import:components ***/

/*** section:global ***/
const currentRoute = Object.assign({}, router.currentRoute.value)
const contactId = computed(() => {
  return currentRoute.query.contactId
})

const {
  worklogsUrl,
  invoicesUrl,
  invoiceLinesUrl,
  contactsUrl,
  invoiceConfigsUrl,
  templatesUrl,
  tagsUrl,
  generateDataFields,
  recordValue,
  tagLabel,
  contactLabel,
  currencyLabel,
  invoiceConfigLabel
} = useInvoiceUtils()
/*** section:global ***/

/*** section:filters ***/
function configLabel(record) {
  return `Every ${record.invoiceCycleDurationValue} ${record.invoiceCycleDurationUnit}, due in ${record.dueDateCycleValue} ${record.dueDateCycleUnit}`
}

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

if (notEmpty(contactId.value)) {
  filtersData.value.invoiceConfigId = [{ value: contactId.value }]
}

const filtersDataFields = computed(() => {
  return [
    {
      key: 'contactId', type: 'singleSelect', label: 'Contact',
      reference: { label: contactLabel },
      listable: false, viewable: true, creatable: true, updatable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'contacts',
        sourceUrl: contactsUrl,
        value: recordValue,
        label: contactLabel
      }
    },
    {
      key: 'invoiceConfigId', type: 'singleSelect', label: 'Invoice Config',
      reference: { label: invoiceConfigLabel },
      listable: false, viewable: true, creatable: true, updatable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'invoice_configs',
        sourceUrl: invoiceConfigsUrl,
        value: recordValue,
        label: invoiceConfigLabel
      }
    },
    {
      key: 'tags', type: 'multiSelect', label: 'Tags',
      reference: { label: tagLabel },
      listable: true, viewable: true, creatable: true, updatable: true, filterable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'tags',
        sourceUrl: tagsUrl,
        value: recordValue,
        label: tagLabel
      }
    },
    { key: 'startTime', type: 'datetimerange', label: 'Start Time', defaultValue: () => { return new Date() }, listable: true, viewable: true, creatable: true, updatable: true, filterable: true, sortable: true },
    { key: 'endTime', type: 'datetimerange', label: 'End Time', listable: true, viewable: true, creatable: true, updatable: true, filterable: true, sortable: true }
  ]
})

const filtersInputHelper = useInputHelper(filtersDataFields.value)

const filtersLayout = computed(() => {
  return [
    { contactId: 'lg', invoiceConfigId: 'lg' },
    { tags: 'lg' },
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

function resetInvoiceData() {
  updatedInvoice.value = null
  updatedInvoiceLines.value = []
  invoiceTemplate.value = null
}

async function formatInvoice(invoice) {
  const promises = invoiceKeys.value.map((key) => {
    return invoiceHelper.formatDataForShow(key, invoice)
  })

  Promise
    .all(promises)
    .then((results) => {
      updatedInvoice.value = {}
      invoiceKeys.value.forEach((key, i) => {
        updatedInvoice.value[key] = results[i]
      })
      updatedInvoice.value.totalAmount = invoiceTotalAmount.value
    })
    .catch((error) => {
      showBanner(`Error generating invoice!`)
      console.error(error)
    })
}

async function updateInvoiceData(result) {
  await formatInvoice(Object.assign({}, result.invoice))

  updatedInvoiceLines.value = result.invoiceLines.map((line) => {
    return formatInvoiceLine(line)
  })

  invoiceConfig.value = Object.assign({}, result.invoiceConfig)
  invoiceNumberSequence.value = Object.assign({}, result.invoiceNumberSequence)
  billingContact.value = Object.assign({}, result.billingContact)
  currency.value = Object.assign({}, result.currency)
  invoiceTemplate.value = Object.assign({}, result.invoiceTemplate)
}

async function submitFilters() {
  resetInvoiceData()
  invoiceLinesLoading.value = true

  const params = filtersInputHelper.formatFilters(filtersData.value)
  dataAccess
    .create('invoices', params, { path: 'preview_invoice' })
    .then((result) => {
      updateInvoiceData(result)
      invoiceLinesLoading.value = false
    })
    .catch((error) => {
      console.error(error)
      showBanner(`Error previewing invoice!`)
    })
}

function resetFilters() {
  resetInvoiceData()

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
/*** section:filters ***/

/*** section:invoiceLines ***/
const invoiceLineHeaders = [
  { key: 'description', type: 'text', label: 'Description', listable: true, creatable: true, updatable: true },
  { key: 'unitValue', type: 'number', label: 'Unit Value', listable: true, creatable: true, updatable: true },
  { key: 'unitCost', type: 'number', label: 'Unit Cost', listable: true, creatable: true, updatable: true },
  { key: 'unit', type: 'enum', label: 'Unit', listable: true, creatable: true, updatable: true },
  { key: 'subtotal', type: 'number', label: 'Subtotal', listable: true, creatable: true, updatable: true }
]

const invoiceLineHelper = useInputHelper(invoiceLineHeaders)

const updatedInvoiceLines = ref([])

const invoiceLineTableActions = [
  {
    name: 'Create',
    icon: 'fa-solid fa-circle-plus fa-xl',
    click: async function(data) {
      await addInvoiceLine()
    }
  }
]

const invoiceLineRowActions = [
  {
    name: 'Calculate',
    icon: 'fa-solid fa-calculator',
    click: async function(row, index) {
      await calculateSubtotal(row)
    }
  },
  {
    name: 'Delete',
    icon: 'fa-solid fa-trash-can',
    click: async function(row, index) {
      await removeInvoiceLine(index)
    }
  }
]

const invoiceLinesLoading = ref(false)

const invoiceLineUnitOptions = computed(() => {
  return [
    { value: 'hour', label: 'Hour' },
    { value: 'minute', label: 'Minute' },
    { value: 'count', label: 'Count' },
    { value: 'fixed', label: 'Fixed' }
  ]
})

function addInvoiceLine() {
  invoiceLinesLoading.value = true
  updatedInvoiceLines.value.push({
    description: null,
    unitCost: null,
    unit: null,
    unitValue: null,
    subtotal: null
  })
  invoiceLinesLoading.value = false
}

function removeInvoiceLine(index) {
  invoiceLinesLoading.value = true
  updatedInvoiceLines.value.splice(index, 1)
  invoiceLinesLoading.value = false
}

function formatInvoiceLine(line) {
  const formattedLine = {}
  formattedLine.description = line.description
  formattedLine.unit = line.unit
  formattedLine.unitCost = formatNumber(line.unitCost)
  formattedLine.unitValue = formatNumber(line.unitValue)

  if (isEmpty(line.subtotal)) {
    calculateSubtotal(formattedLine)
  } else {
    formattedLine.subtotal = formatNumber(line.subtotal)
  }

  return formattedLine
}

function formatNumber(value) {
  return (value || 0).toFixed(2)
}

function calculateSubtotal(line) {
  const unitCost = line.unitCost
  const unitValue = line.unitValue

  if (notEmpty(unitCost) && notEmpty(unitValue)) {
    line.subtotal = formatNumber(parseFloat(unitCost) * parseFloat(unitValue))
  } else {
    line.subtotal = formatNumber(0)
  }

  updatedInvoice.value.totalAmount = invoiceTotalAmount.value
}

const invoiceLineErrorMessages = ref([])

function invoiceLineErrorMessage(index, field) {
  if (invoiceLineErrorMessages[index]) {
    return invoiceLineErrorMessage[index][field]
  } else {
    return ``
  }
}
/*** section:invoiceLines ***/

/*** section:invoice ***/
const updatedInvoice = ref()

const invoiceFieldsLayout = [
  { invoiceNumber: 'lg', contactId: 'lg' },
  { invoiceDate: 'md', dueDate: 'md', totalAmount: 'md' },
  { customFields: 'md' },
  { invoiceConfigId: 'lg' },
  { currencyId: 'lg' }
]

const invoiceFieldKeys = computed(() => {
  return invoiceFieldsLayout.reduce((keys, fields) => {
    Object.keys(fields).forEach((key) => {
      keys.push(key)
    })
    return keys
  }, [])
})

const invoiceDataFields = computed(() => {
  return generateDataFields(contactId.value)
})

const invoiceKeys = computed(() => {
  return invoiceDataFields.value.map(f => f.key)
})

const invoiceHelper = useInputHelper(invoiceDataFields.value)

const invoiceNumber = computed(() => {
  const parts = []

  if (notEmpty(invoiceNumberSequence.value.prefix)) {
    parts.push(invoiceNumberSequence.value.prefix)
  }

  parts.push(invoiceNumberSequence.value.currentSequence)

  if (notEmpty(invoiceNumberSequence.value.suffix)) {
    parts.push(invoiceNumberSequence.value.suffix)
  }

  return parts.join('-')
})

const invoiceTotalAmount = computed(() => {
  const total = updatedInvoiceLines.value.reduce((sum, line) => {
    if (notEmpty(line.subtotal)) {
      return sum + parseFloat(line.subtotal)
    } else {
      return sum
    }
  }, 0)
  return formatNumber(total)
})

const invoiceErrorMessages = ref({})
const invoiceConfirmButton = {
  type: 'text',
  value: 'Generate Invoice',
  icon: 'fa-solid fa-check'
}

const invoiceCancelButton = {
  type: 'text',
  value: 'Cancel',
  icon: 'fa-solid fa-xmark'
}
/*** section:invoice ***/

/*** section:template ***/
const invoiceTemplate = ref()
const invoiceConfig = ref()
const invoiceNumberSequence = ref()
const billingContact = ref()
const currency = ref()

const templateData = computed(() => {
  return {
    invoice: updatedInvoice.value,
    invoiceLines: updatedInvoiceLines.value,
    invoiceConfig: invoiceConfig.value,
    invoiceNumberSequence: invoiceNumberSequence.value,
    billingContact: billingContact.value,
    currency: currency.value
  }
})
/*** section:template ***/

/*** section:action ***/
async function formatInvoiceLines() {
  return new Promise((resolve, reject) => {
    const promises = updatedInvoiceLines.value.map((line) => {
      return invoiceLineHelper.formatDataForSave(line)
    })

    Promise.all(promises)
      .then((results) => {
        resolve(results)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

async function createInvoice() {
  await formatInvoiceLines()
    .then((results) => {
      const params = Object.assign(
        {},
        {
          invoice: invoiceHelper.formatDataForSave(updatedInvoice.value),
          invoiceNumberSequence: invoiceNumberSequence.value,
          invoiceLines: results
        }
      )

      dataAccess
        .create('invoices', params, { path: 'generate_with_lines' })
        .then((result) => {
          updatedInvoice.value.id = result.id
          updatedInvoiceLines.value = result.invoiceLines
          showBanner(`Invoice created successfully!`)
        })
        .catch((error) => {
          showBanner(`Error creating invoice!`)
          console.error(error)
        })
    })
    .catch((error) => {
      showBanner(`Error formatting invoice for save!`)
      console.error(error)
    })
}

function resetInvoice() {
}
/*** section:action ***/

/*** section:banner ***/
function showBanner(message) {
  banner.show(message)
  setTimeout(hideBanner, 5000)
}

function hideBanner() {
  banner.hide()
}
/*** section:banner ***/

/*** section:steps ***/
const steps = computed(() => {
  return [
    { title: 'Filter Work Logs' },
    { title: 'Fill Invoice and Lines' },
    { title: 'Preview Invoice' }
  ]
})

async function prevStep(currentStep) {
  if (currentStep === 0) { // filter
  } else if (currentStep === 1) { // fill invoice
  }
}

async function nextStep(currentStep) {
  if (currentStep === 1) { // fill invoice
    await submitFilters()
  } else if (currentStep === 2) { // preview invoice
    await createInvoice()
  }
}

async function submit() {
  await createInvoice()
}
/*** section:steps ***/

onMounted(() => {
  resetFilters()
})
</script>

<template>
  <div class="page-container">
    <h3 class="heading">Create Invoice</h3>

    <WorkflowContainer
      :steps="steps"
      @prev-step="prevStep"
      @next-step="nextStep"
      @submit="submit"
    >
      <template #step-0>
        <Form
          v-model="filtersData"
          :fields-layout="filtersLayout"
          :data-fields="filterableKeys"
          :schemas="filtersDataFields"
          :error-messages="filtersErrorMessages"
          :submittable="false"
        />
      </template> <!-- step-0:filter worklogs -->

      <template #step-1>
        <Form
          v-if="updatedInvoice"
          v-model="updatedInvoice"
          :fields-layout="invoiceFieldsLayout"
          :data-fields="invoiceFieldKeys"
          :schemas="invoiceDataFields"
          :error-messages="invoiceErrorMessages"
          :submittable="false"
        />

        <TTable
          v-if="updatedInvoice"
          name="Invoice Lines"
          :headers="invoiceLineHeaders"
          :data="updatedInvoiceLines"
          :table-actions="invoiceLineTableActions"
          :actions="invoiceLineRowActions"
          :loading="invoiceLinesLoading"
          :pagination="{ offset: 0, limit: updatedInvoiceLines.length, client: true }"
        >
          <template #data-col.description="{ headers, row, i }">
            <div class="data-col">
              <TInput
                v-model="row.description"
                type="text"
                label=""
                size="lg"
                :error-message="invoiceLineErrorMessage(i, 'description')"
              />
            </div>
          </template>

          <template #data-col.unitCost="{ headers, row, i }">
            <div class="data-col">
              <TInput
                v-model="row.unitCost"
                type="number"
                label=""
                size="sm"
                :error-message="invoiceLineErrorMessage(i, 'unitCost')"
              />
            </div>
          </template>

          <template #data-col.unit="{ headers, row, i }">
            <div class="data-col">
              <TSelect
                v-model="row.unit"
                type="text"
                label=""
                size="md"
                :options="invoiceLineUnitOptions"
                :error-message="invoiceLineErrorMessage(i, 'unit')"
              />
            </div>
          </template>

          <template #data-col.unitValue="{ headers, row, i }">
            <div class="data-col">
              <TInput
                v-model="row.unitValue"
                type="number"
                label=""
                size="sm"
                :error-message="invoiceLineErrorMessage(i, 'unitValue')"
              />
            </div>
          </template>

          <template #data-col.subtotal="{ headers, row, i }">
            <div class="data-col">
              <TInput
                v-model="row.subtotal"
                type="number"
                label=""
                size="sm"
                :error-message="invoiceLineErrorMessage(i, 'subtotal')"
              />
            </div>
          </template>

          <template #pagination="{ total }">
            Total Lines: {{ total }}
          </template>
        </TTable>
      </template> <!-- step-1:invoice and lines -->

      <template #step-2>
        <TemplateEditor
          v-if="invoiceTemplate"
          :templates-url="templatesUrl"
          :id="invoiceTemplate.id"
          :content-markup="invoiceTemplate.contentMarkup"
          :content-styles="invoiceTemplate.contentStyles"
          :data="templateData"
          :disabled="true"
          template-type="invoice_templates"
        />
      </template> <!-- step-2:preview invoice -->
    </WorkflowContainer>
  </div>
</template>

<style scoped>
.page-container .heading {
  margin: 1rem 0;
  font-weight: 900;
}

.data-col {
  padding: 1rem 0;
}

.actions {
  margin-top: 1rem;
  padding-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}
</style>
