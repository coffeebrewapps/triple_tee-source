<script setup>
/*** import:global ***/
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
/*** import:global ***/

/*** import:utils ***/
import { useDataAccess } from '@/utils/dataAccess'
const dataAccess = useDataAccess()
/*** import:utils ***/

/*** import:stores ***/
import { useBannerStore } from '@/stores/banner'
const banner = useBannerStore()
/*** import:stores ***/

/*** import:components ***/
import {
  TButton
} from 'coffeebrew-vue-components'

import TemplateEditor from '@/components/TemplateEditor.vue'
/*** import:components ***/

/*** section:props ***/
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})
/*** section:props ***/

/*** section:global ***/
const sampleData = ref({})

const currentRoute = Object.assign({}, router.currentRoute.value)
const templateId = computed(() => {
  return currentRoute.params.id
})
const templateType = computed(() => {
  return currentRoute.params.templateType
})
const currentTemplate = ref()

const heading = computed(() => {
  if (!currentTemplate.value) { return `` }

  if (templateType.value === 'invoice_templates') {
    return `Invoice Template: ${currentTemplate.value.name}`
  } else {
    return `Receipt Template: ${currentTemplate.value.name}`
  }
})
/*** section:global ***/

/*** section:action ***/
async function updateMarkup(updated) {
  const params = Object.assign(
    {},
    currentTemplate.value,
    {
      contentMarkup: updated
    }
  )

  await dataAccess
    .update(templateType.value, templateId.value, params)
    .then((result) => {
      currentTemplate.value = result
      showBanner(`Updated markup successfully!`)
    })
    .catch((error) => {
      showBanner(`Error updating markup!`)
    })
}

async function updateStyles(updated) {
  const params = Object.assign(
    {},
    currentTemplate.value,
    {
      contentStyles: updated
    }
  )

  await dataAccess
    .update(templateType.value, templateId.value, params)
    .then((result) => {
      currentTemplate.value = result
      showBanner(`Updated styles successfully!`)
    })
    .catch((error) => {
      showBanner(`Error updating styles !`)
    })
}

function updateData(updated) {
  sampleData.value[templateType.value] = updated
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

async function loadTemplate() {
  await dataAccess
    .view(templateType.value, templateId.value, {})
    .then((result) => {
      currentTemplate.value = result
    })
    .catch((error) => {
      showBanner(`Error loading template!`)
      console.log(error)
    })
}

onMounted(async () => {
  sampleData.value = {
    invoice_templates: {
      invoice: {
        invoiceNumber: 2,
        invoiceDate: '2023-05-26T14:06:15.686Z',
        dueDate: '2023-06-25T14:06:15.686Z',
        totalAmount: 574.98
      },
      invoiceLines: [
        {
          id: '1',
          description: 'Requirements gathering',
          unit: 'hour',
          unitCost: 100,
          unitValue: 2.06,
          subtotal: 205.93,
          invoiceId: '1',
          createdAt: '2023-05-26T14:07:10.051Z',
          updatedAt: '2023-05-26T14:07:10.051Z'
        },
        {
          id: '2',
          description: 'Implementation',
          unit: 'hour',
          unitCost: 85,
          unitValue: 4.17,
          subtotal: 354.05,
          invoiceId: '1',
          createdAt: '2023-05-26T14:07:10.055Z',
          updatedAt: '2023-05-26T14:07:10.055Z'
        },
        {
          id: '3',
          description: 'GST',
          unit: 'fixed',
          unitCost: 15,
          unitValue: 1,
          subtotal: 15,
          invoiceId: '1',
          createdAt: '2023-05-26T14:07:10.057Z',
          updatedAt: '2023-05-26T14:07:10.057Z'
        }
      ],
      invoiceConfig: {
        id: '1',
        invoiceCycleDurationValue: 1,
        invoiceCycleDurationUnit: 'month',
        dueDateCycleValue: 30,
        dueDateCycleUnit: 'day',
        paymentTerms: 'Payment due to account 395-17573-542',
        tags: [
          '1'
        ],
        customFields: {},
        invoiceNumberSequenceId: '1',
        billingContactId: '1',
        invoiceTemplateId: '1',
        currencyId: '1',
        createdAt: '2023-05-26T06:32:33.830Z',
        updatedAt: '2023-05-26T06:32:33.830Z'
      },
      invoiceNumberSequence: {
        id: '1',
        name: 'Company ABC Invoice Sequence',
        startingNumber: 1,
        lastUsedNumber: 1,
        incrementStep: 1,
        prefix: 'INV',
        suffix: 'ABC',
        createdAt: '2023-05-26T06:30:04.445Z',
        updatedAt: '2023-05-26T06:30:04.445Z'
      },
      billingContact: {
        id: '1',
        name: 'Company ABC',
        accountNumber: null,
        addressLine1: null,
        addressLine2: null,
        addressLine3: null,
        city: null,
        state: null,
        country: 'Singapore',
        postcode: null,
        contactNumber1: null,
        contactNumber2: null,
        contactNumber3: null,
        contactPerson1: null,
        contactPerson2: null,
        contactPerson3: null,
        contactEmail1: null,
        contactEmail2: null,
        contactEmail3: null,
        url1: null,
        url2: null,
        url3: null,
        logo: null,
        customFields: null,
        createdAt: '2023-05-26T06:30:24.570Z',
        updatedAt: '2023-05-26T06:30:24.570Z'
      },
      currency: {
        id: '1',
        code: 'USD',
        symbol: '$',
        exchangeRate: 1,
        effectiveStart: '2012-12-31T16:00:00.000Z',
        effectiveEnd: null,
        createdAt: '2023-05-26T06:29:49.052Z',
        updatedAt: '2023-05-26T06:29:49.052Z'
      }
    },

    receipt_templates: {
      receipt: {
        id: '1',
        receiptNumber: 1,
        receiptDate: '2023-05-30T05:12:34.709Z',
        billableAmount: 559.98,
        paidAmount: 0,
        paymentAmount: 186.66,
        remainingAmount: 373.32
      },
      invoice: {
        id: '1',
        invoiceNumber: 2,
        invoiceDate: '2023-05-26T14:52:33.327Z',
        dueDate: '2023-06-25T14:52:33.327Z',
        totalAmount: 559.98,
        customFields: {},
        voided: false,
        invoiceConfigId: '1',
        currencyId: '1',
        contactId: '1',
        createdAt: '2023-05-26T14:52:42.186Z',
        updatedAt: '2023-05-26T14:52:42.186Z'
      },
      currency: {
        id: '1',
        code: 'USD',
        symbol: '$',
        exchangeRate: 1,
        effectiveStart: '2012-12-31T16:00:00.000Z',
        effectiveEnd: null,
        createdAt: '2023-05-26T06:29:49.052Z',
        updatedAt: '2023-05-26T06:29:49.052Z'
      },
      transaction: {
        id: '1',
        type: 'income',
        transactionDate: '2023-05-30T05:12:34.709Z',
        description: 'Income from Receipt 1',
        amount: 186.66,
        homeCurrencyAmount: 186.66,
        tags: [],
        currencyId: '1',
        associatedTransactionId: null,
        createdAt: '2023-05-30T05:12:37.363Z',
        updatedAt: '2023-05-30T05:12:37.363Z'
      },
      billingContact: {
        id: '1',
        name: 'Company ABC',
        accountNumber: '247-246473-782',
        addressLine1: '123 City Street',
        addressLine2: '#25-873',
        addressLine3: 'Northern Building',
        city: 'Singapore',
        state: null,
        country: 'Singapore',
        postcode: '635723',
        contactNumber1: null,
        contactNumber2: null,
        contactNumber3: null,
        contactPerson1: null,
        contactPerson2: null,
        contactPerson3: null,
        contactEmail1: null,
        contactEmail2: null,
        contactEmail3: null,
        url1: null,
        url2: null,
        url3: null,
        logo: null,
        customFields: null,
        createdAt: '2023-05-26T06:30:24.570Z',
        updatedAt: '2023-05-27T13:03:15.547Z'
      },
      receiptConfig: {
        id: '1',
        customFields: {},
        receiptNumberSequenceId: '2',
        billingContactId: '1',
        receiptTemplateId: '1',
        createdAt: '2023-05-30T03:49:56.187Z',
        updatedAt: '2023-05-30T03:51:03.739Z',
        description: 'Company ABC Receipt Config'
      },
      receiptNumberSequence: {
        id: '2',
        name: 'Company ABC Receipt Sequence',
        startingNumber: 0,
        lastUsedNumber: 0,
        incrementStep: 1,
        prefix: 'REC',
        suffix: 'ABC',
        createdAt: '2023-05-30T03:47:57.707Z',
        updatedAt: '2023-05-30T03:47:57.707Z'
      },
      invoiceNumberSequence: {
        id: '1',
        name: 'Company ABC Invoice Sequence',
        startingNumber: 1,
        lastUsedNumber: 1,
        incrementStep: 1,
        prefix: 'INV',
        suffix: 'ABC',
        createdAt: '2023-05-26T06:30:04.445Z',
        updatedAt: '2023-05-26T06:30:04.445Z'
      }
    }
  }

  await loadTemplate()
})
</script>

<template>
  <div class="page-container">
    <h2 class="heading">{{ heading }}</h2>

    <TemplateEditor
      v-if="currentTemplate"
      :template-type="templateType"
      :id="currentTemplate.id"
      :content-markup="currentTemplate.contentMarkup"
      :content-styles="currentTemplate.contentStyles"
      :data="sampleData[templateType]"
      :disabled="disabled"
      @content-markup-change="updateMarkup"
      @content-styles-change="updateStyles"
      @data-change="updateData"
    />
  </div>
</template>

<style scoped>
.page-container {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-container .heading {
  font-weight: 900;
}

.preview-panel {
  width: 100%;
}

.preview-panel iframe {
  width: 100%;
  height: 100vh;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}
</style>
