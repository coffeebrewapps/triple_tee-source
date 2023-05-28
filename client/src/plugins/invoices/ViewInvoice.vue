<script setup>
/*** import:global ***/
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
/*** import:global ***/

/*** import:utils ***/
import { useInputHelper } from '@/utils/input'

import { useDataAccess } from '@/utils/dataAccess'
const dataAccess = useDataAccess()
/*** import:utils ***/

/*** import:stores ***/
import { useEventsStore } from '@/stores/events'
const events = useEventsStore()

import { useBannerStore } from '@/stores/banner'
const banner = useBannerStore()
/*** import:stores ***/

/*** import:components ***/
import {
  TProgressBar
} from 'coffeebrew-vue-components'

import TabContainer from '@/components/TabContainer.vue'
import InvoiceLines from '@/plugins/invoice_lines/InvoiceLines.vue'
import TemplateEditor from '@/components/TemplateEditor.vue'
/*** import:components ***/

/*** section:global ***/
const currentRoute = Object.assign({}, router.currentRoute.value)

const invoiceId = computed(() => {
  return currentRoute.params.id
})

const contactId = computed(() => {
  return currentRoute.query.contactId
})

import { useInvoiceUtils } from './utils'
const {
  invoicesUrl,
  invoiceLinesUrl,
  invoiceConfigsUrl,
  templatesUrl,
  fieldsLayout,
  generateDataFields
} = useInvoiceUtils()

const dataFields = computed(() => {
  return generateDataFields(contactId.value)
})

const {
  inputLabel,
  inputValue,
  includeKeys
} = useInputHelper(dataFields.value)

const currentInvoice = ref()
const invoiceLines = ref()
const invoiceConfig = ref()
const invoiceTemplate = ref()
const templateData = ref()

const heading = computed(() => {
  if (currentInvoice.value) {
    return `Invoice: ${currentInvoice.value.invoiceNumber}`
  } else {
    return `Loading Invoice...`
  }
})

async function loadInvoice() {
  currentInvoice.value = null
  const params = { include: includeKeys.value }

  await dataAccess
    .view('invoices', invoiceId.value, params)
    .then((result) => {
      currentInvoice.value = result
      showBanner(`Loaded invoice successfully!`);
    })
    .catch((error) => {
      console.error(error)
      showBanner(`Error loading invoice!`);
    })
}

async function loadTemplateData() {
  invoiceLines.value = null
  invoiceConfig.value = null
  invoiceTemplate.value = null

  dataAccess
    .view('invoices', currentInvoice.value.id, {}, { path: 'template_data' })
    .then((result) => {
      invoiceLines.value = result.invoiceLines
      invoiceConfig.value = result.invoiceConfig
      invoiceTemplate.value = invoiceConfig.value.includes.invoiceTemplateId[invoiceConfig.value.invoiceTemplateId]
      const invoiceNumberSequence = invoiceConfig.value.includes.invoiceNumberSequenceId[invoiceConfig.value.invoiceNumberSequenceId]
      const billingContact = invoiceConfig.value.includes.billingContactId[invoiceConfig.value.billingContactId]
      const currency = invoiceConfig.value.includes.currencyId[invoiceConfig.value.currencyId]

      templateData.value = {
        invoice: currentInvoice.value,
        invoiceLines: invoiceLines.value,
        invoiceConfig: invoiceConfig.value,
        invoiceNumberSequence,
        billingContact,
        currency
      }
      showBanner(`Loaded template data successfully!`);
    })
    .catch((error) => {
      console.error(error)
      showBanner(`Error loading template data!`);
    })
}
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

/*** section:tabs ***/
const tabs = [
  { label: 'Details', onchange: loadInvoice },
  { label: 'Invoice Lines', onchange: loadInvoiceLines },
  { label: 'View Invoice PDF', onchange: loadTemplateData }
]

async function loadInvoiceLines() {
  events.emitEvent('loadData', { dataType: 'Invoice Lines' })
}

function triggerTabEvent(i) {
  tabs[i].onchange()
}
/*** section:tabs ***/

onMounted(async () => {
  await loadInvoice()
})
</script>

<template>
  <div class="page-container">
    <h2 class="heading">{{ heading }}</h2>

    <TProgressBar
      v-if="!currentInvoice"
    />

    <TabContainer
      v-if="currentInvoice"
      :tabs="tabs"
      @tab-change="triggerTabEvent"
    >

      <template #tab-0>
        <div
          class="details-container"
        >
          <div
            v-for="row in fieldsLayout"
            class="data-row"
          >
            <div
              v-for="field in Object.keys(row)"
              class="data-field"
            >
              <div
                class="field-label"
              >
                {{ inputLabel(field) }}
              </div> <!-- field-label -->

              <div
                class="field-value"
              >
                <span
                  v-if="currentInvoice && currentInvoice[field]"
                >
                  {{ inputValue(field, currentInvoice, includeKeys, dataFields) }}
                </span>

                <span
                  v-if="!currentInvoice || !currentInvoice[field]"
                >
                --- no value ---
                </span>
              </div> <!-- field-value -->
            </div> <!-- data-field -->

          </div> <!-- data-row -->
        </div> <!-- details-container -->
      </template> <!-- template-0 -->

      <template #tab-1>
        <InvoiceLines
          :invoice-id="invoiceId"
        />
      </template> <!-- template-1 -->

      <template #tab-2>
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
      </template> <!-- template-2 -->
    </TabContainer>
  </div> <!-- page-container -->
</template>

<style scoped>
.page-container {
  margin-top: 1rem;
}

.page-container .heading {
  font-weight: 900;
}

.details-container {
  display: flex;
  flex-direction: column;
}

.data-row {
  display: flex;
}

.data-field {
  display: flex;
  align-items: center;
}

.data-field .field-label {
  padding: 0.5rem 1rem;
  font-weight: 600;
}

.data-field .field-value {
  padding: 0.5rem 1rem;
}
</style>
