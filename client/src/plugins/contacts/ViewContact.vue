<script setup>
/*** import:global ***/
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
/*** import:global ***/

/*** import:utils ***/
import { useContactUtils } from './utils'
const {
  contactsUrl,
  invoiceConfigsUrl,
  countriesUrl,
  fieldsLayout,
  dataFields,
  filters,
  validations,
  includeKeys,
  countryValue,
  countryLabel
} = useContactUtils()

import { useInputHelper } from '@/utils/input'
const {
  schemasMap,
  inputLabel,
  inputValue
} = useInputHelper(dataFields)

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
import InvoiceConfigs from '@/plugins/invoice_configs/InvoiceConfigs.vue'
import ReceiptConfigs from '@/plugins/receipt_configs/ReceiptConfigs.vue'
import BillingConfigs from '@/plugins/billing_configs/BillingConfigs.vue'
import Invoices from '@/plugins/invoices/Invoices.vue'
/*** import:components ***/

/*** section:global ***/
const currentRoute = Object.assign({}, router.currentRoute.value)

const contactId = computed(() => {
  return currentRoute.params.id
})

const currentContact = ref()

const heading = computed(() => {
  if (currentContact.value) {
    return `Contact: ${currentContact.value.name}`
  } else {
    return `Loading Contact...`
  }
})

async function loadContact() {
  currentContact.value = null
  const params = { include: includeKeys.value }

  await dataAccess
    .view(`contacts`, contactId.value, params)
    .then((result) => {
      currentContact.value = result
      showBanner(`Loaded contact successfully!`);
    })
    .catch((error) => {
      console.log(error)
      showBanner(`Error loading contact!`);
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
  { label: 'Details', onchange: loadContact },
  { label: 'Invoice Configs', onchange: loadInvoiceConfig },
  { label: 'Receipt Configs', onchange: loadReceiptConfig },
  { label: 'Billing Configs', onchange: loadBillingConfig },
  { label: 'Invoices', onchange: loadInvoices }
]

async function loadInvoiceConfig() {
  events.emitEvent('loadData', { dataType: 'Invoice Configs' })
}

async function loadReceiptConfig() {
  events.emitEvent('loadData', { dataType: 'Receipt Configs' })
}

async function loadBillingConfig() {
  events.emitEvent('loadData', { dataType: 'Billing Configs' })
}

async function loadInvoices() {
  events.emitEvent('loadData', { dataType: 'Invoices' })
}

function triggerTabEvent(i) {
  tabs[i].onchange()
}
/*** section:tabs ***/

onMounted(async () => {
  await loadContact()
})
</script>

<template>
  <div class="page-container">
    <h2 class="heading">{{ heading }}</h2>

    <TProgressBar
      v-if="!currentContact"
    />

    <TabContainer
      v-if="currentContact"
      :tabs="tabs"
      @tab-change="triggerTabEvent"
    >

      <template #tab-0>
        <div
          class="contact-container"
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
                  v-if="currentContact && currentContact[field]"
                >
                  {{ inputValue(field, currentContact, includeKeys, dataFields) }}
                </span>

                <span
                  v-if="!currentContact || !currentContact[field]"
                >
                --- no value ---
                </span>
              </div> <!-- field-value -->
            </div> <!-- data-field -->

          </div> <!-- data-row -->
        </div> <!-- contact-container -->
      </template> <!-- template-0 -->

      <template #tab-1>
        <InvoiceConfigs
          :billing-contact-id="contactId"
        />
      </template> <!-- template-1 -->

      <template #tab-2>
        <ReceiptConfigs
          :billing-contact-id="contactId"
        />
      </template> <!-- template-2 -->

      <template #tab-3>
        <BillingConfigs
          :contact-id="contactId"
        />
      </template> <!-- template-3 -->

      <template #tab-4>
        <Invoices
          :contact-id="contactId"
        />
      </template> <!-- template-4 -->
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

.contact-container {
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
