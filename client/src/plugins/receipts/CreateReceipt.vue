<script setup>
/*** import:global ***/
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
/*** import:global ***/

/*** import:utils ***/
import { useValidations } from '@/utils/validations'
const { isEmpty, notEmpty } = useValidations()

import { useDataAccess } from '@/utils/dataAccess'
const dataAccess = useDataAccess()

import { useReceiptUtils } from './utils'
import { useInputHelper } from '@/utils/input'

import { useFormatter } from '@/utils/formatter'
const {
  formatNumber
} = useFormatter()
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
const invoiceId = computed(() => {
  return currentRoute.query.invoiceId
})

const contactId = computed(() => {
  return currentRoute.query.contactId
})

const {
  fieldsLayout,
  generateDataFields,
  recordValue,
  receiptConfigLabel,
  invoiceLabel,
  currencyLabel,
  transactionLabel,
  contactLabel,
  validations
} = useReceiptUtils()
/*** section:global ***/

/*** section:filters ***/
const filtersData = ref({
  invoiceId: [],
  receiptConfigId: []
})

if (notEmpty(invoiceId.value)) {
  filtersData.value.invoiceId = [{ value: invoiceId.value }]
}

const filtersDataFields = computed(() => {
  return [
    {
      key: 'invoiceId', type: 'singleSelect', label: 'Invoice',
      reference: { label: invoiceLabel },
      listable: false, viewable: true, creatable: true, updatable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'invoices',
        value: recordValue,
        label: invoiceLabel
      }
    },
    {
      key: 'receiptConfigId', type: 'singleSelect', label: 'Receipt Config',
      reference: { label: receiptConfigLabel },
      listable: false, viewable: true, creatable: true, updatable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'receipt_configs',
        value: recordValue,
        label: receiptConfigLabel
      }
    }
  ]
})

const filtersInputHelper = useInputHelper(filtersDataFields.value)

const filtersLayout = computed(() => {
  return [
    { invoiceId: 'lg', receiptConfigId: 'lg' }
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

function resetReceiptData() {
  updatedReceipt.value = null
  receiptTemplate.value = null
}

async function formatReceipt(receipt) {
  const promises = receiptKeys.value.map((key) => {
    return receiptHelper.formatDataForShow(key, receipt)
  })

  Promise
    .all(promises)
    .then((results) => {
      updatedReceipt.value = {}
      receiptKeys.value.forEach((key, i) => {
        updatedReceipt.value[key] = results[i]
      })
    })
    .catch((error) => {
      showBanner(`Error generating receipt!`)
      console.error(error)
    })
}

async function updateReceiptData(result) {
  await formatReceipt(Object.assign({}, result.receipt))

  invoice.value = Object.assign({}, result.invoice)
  currency.value = Object.assign({}, result.currency)
  billingContact.value = Object.assign({}, result.billingContact)
  receiptConfig.value = Object.assign({}, result.receiptConfig)
  receiptNumberSequence.value = Object.assign({}, result.receiptNumberSequence)
  receiptTemplate.value = Object.assign({}, result.receiptTemplate)
  invoiceNumberSequence.value = Object.assign({}, result.invoiceNumberSequence)
}

async function submitFilters() {
  resetReceiptData()

  const params = filtersInputHelper.formatFilters(filtersData.value)
  dataAccess
    .create('income_receipts', params, { path: 'preview_receipt' })
    .then((result) => {
      updateReceiptData(result)
    })
    .catch((error) => {
      console.error(error)
      showBanner(`Error previewing receipt!`)
    })
}

function resetFilters() {
  resetReceiptData()

  filtersData.value = {
    invoiceId: [],
    receiptConfigId: []
  }
}
/*** section:filters ***/

/*** section:receipt ***/
const updatedReceipt = ref()
const originalPaymentAmount = ref(0)

const receiptFieldsLayout = fieldsLayout

const receiptDataFields = computed(() => {
  return generateDataFields(invoiceId.value, contactId.value)
})

const receiptFieldKeys = computed(() => {
  return creatableReceiptFields.value.map(f => f.key)
})

const notUpdatableAmountFields = [
  'billableAmount',
  'paidAmount',
  'remainingAmount'
]

const creatableReceiptFields = computed(() => {
  return receiptDataFields.value.filter((field) => {
    return !notUpdatableAmountFields.includes(field.key) && field.creatable
  })
})

const receiptKeys = computed(() => {
  return receiptDataFields.value.map(f => f.key)
})

const receiptHelper = useInputHelper(receiptDataFields.value)

const receiptNumber = computed(() => {
  const parts = []

  if (notEmpty(receiptNumberSequence.value.prefix)) {
    parts.push(receiptNumberSequence.value.prefix)
  }

  parts.push(receiptNumberSequence.value.currentSequence)

  if (notEmpty(receiptNumberSequence.value.suffix)) {
    parts.push(receiptNumberSequence.value.suffix)
  }

  return parts.join('-')
})

watch(updatedReceipt, (newVal, oldVal) => {
  if (isEmpty(newVal) || isEmpty(oldVal)) { return }

  receiptErrorMessages.value = {}
  if (originalPaymentAmount.value !== newVal.paymentAmount) {
    const remainingAmount = updatedReceipt.value.billableAmount - updatedReceipt.value.paidAmount - updatedReceipt.value.paymentAmount

    const errors = receiptHelper.validateParams(
      { remainingAmount: validations.create.remainingAmount },
      Object.assign({}, updatedReceipt.value, { paymentAmount: newVal.paymentAmount, remainingAmount }) 
    )

    if (Object.keys(errors).length > 0) {
      receiptErrorMessages.value = errors
    } else {
      updatedReceipt.value.remainingAmount = parseFloat(formatNumber(remainingAmount, 2))
    }
    originalPaymentAmount.value = newVal.paymentAmount
  }
}, { deep: true })

const receiptErrorMessages = ref({})
const receiptConfirmButton = {
  type: 'text',
  value: 'Generate Receipt',
  icon: 'fa-solid fa-check'
}

const receiptCancelButton = {
  type: 'text',
  value: 'Cancel',
  icon: 'fa-solid fa-xmark'
}
/*** section:receipt ***/

/*** section:template ***/
const invoice = ref()
const currency = ref()
const transaction = ref()
const billingContact = ref()
const receiptConfig = ref()
const receiptNumberSequence = ref()
const receiptTemplate = ref()
const invoiceNumberSequence = ref()

const templateData = computed(() => {
  return {
    receipt: updatedReceipt.value,
    invoice: invoice.value,
    currency: currency.value,
    transaction: transaction.value,
    billingContact: billingContact.value,
    receiptConfig: receiptConfig.value,
    receiptNumberSequence: receiptNumberSequence.value,
    invoiceNumberSequence: invoiceNumberSequence.value
  }
})
/*** section:template ***/

/*** section:action ***/
const showTemplateEditor = ref(false)
async function createReceipt() {
  showTemplateEditor.value = false
  const params = Object.assign(
    {},
    {
      receipt: receiptHelper.formatDataForSave(updatedReceipt.value),
      receiptNumberSequence: receiptNumberSequence.value
    }
  )

  await dataAccess
    .create('income_receipts', params, { path: 'generate_with_transaction' })
    .then((result) => {
      updatedReceipt.value.id = result.id
      transaction.value = result.transaction
      showTemplateEditor.value = true
      showBanner(`Receipt created successfully!`)
    })
    .catch((error) => {
      showBanner(`Error creating receipt!`)
      console.error(error)
    })
}

function resetReceipt() {
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
    { title: 'Select Invoice' },
    { title: 'Fill Receipt' },
    { title: 'Preview Receipt' }
  ]
})

async function prevStep(currentStep) {
  if (currentStep === 0) { // filter
  } else if (currentStep === 1) { // fill receipt
  }
}

async function nextStep(currentStep) {
  if (currentStep === 1) { // fill receipt
    await submitFilters()
  } else if (currentStep === 2) { // preview receipt
    await createReceipt()
  }
}

async function submit() {
  await createReceipt()
}
/*** section:steps ***/

onMounted(() => {
  resetFilters()
})
</script>

<template>
  <div class="page-container">
    <h3 class="heading">Create Receipt</h3>

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
      </template> <!-- step-0:select receipt -->

      <template #step-1>
        <Form
          v-if="updatedReceipt"
          v-model="updatedReceipt"
          :fields-layout="receiptFieldsLayout"
          :data-fields="receiptFieldKeys"
          :schemas="receiptDataFields"
          :error-messages="receiptErrorMessages"
          :submittable="false"
        />
      </template> <!-- step-1:receipt -->

      <template #step-2>
        <TemplateEditor
          v-if="showTemplateEditor"
          template-type="receipt_templates"
          :id="receiptTemplate.id"
          :content-markup="receiptTemplate.contentMarkup"
          :content-styles="receiptTemplate.contentStyles"
          :data="templateData"
          :disabled="true"
        />
      </template> <!-- step-2:preview receipt -->
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
