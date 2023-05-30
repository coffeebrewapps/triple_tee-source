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

import { useValidations } from '@/utils/validations'
const { isEmpty, notEmpty } = useValidations()
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
import TemplateEditor from '@/components/TemplateEditor.vue'
/*** import:components ***/

/*** section:global ***/
const currentRoute = Object.assign({}, router.currentRoute.value)

const receiptId = computed(() => {
  return currentRoute.params.id
})

const invoiceId = computed(() => {
  return currentRoute.query.invoiceId
})

const contactId = computed(() => {
  return currentRoute.query.contactId
})

import { useReceiptUtils } from './utils'
const {
  fieldsLayout,
  generateDataFields
} = useReceiptUtils()

const dataFields = computed(() => {
  return generateDataFields(invoiceId.value, contactId.value)
})

const {
  inputLabel,
  inputValue,
  includeKeys
} = useInputHelper(dataFields.value)

const currentReceipt = ref()
const receiptTemplate = ref()
const templateData = ref()

const heading = computed(() => {
  if (currentReceipt.value) {
    return `Receipt: ${currentReceipt.value.receiptNumber}`
  } else {
    return `Loading Receipt...`
  }
})

async function loadReceipt() {
  currentReceipt.value = null
  const params = { include: includeKeys.value }

  await dataAccess
    .view('income_receipts', receiptId.value, params)
    .then((result) => {
      currentReceipt.value = result
      showBanner(`Loaded receipt successfully!`);
    })
    .catch((error) => {
      console.error(error)
      showBanner(`Error loading receipt!`);
    })
}

async function loadTemplateData() {
  receiptTemplate.value = null

  dataAccess
    .view('income_receipts', currentReceipt.value.id, {}, { path: 'template_data' })
    .then((result) => {
      receiptTemplate.value = result.receiptTemplate
      const country = result.country
      const billingContact = Object.assign({}, result.billingContact, { country: country.countryName })

      templateData.value = Object.assign(
        {},
        result,
        {
          billingContact
        }
      )
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
  { label: 'Details', onchange: loadReceipt },
  { label: 'View Receipt PDF', onchange: loadTemplateData }
]

function triggerTabEvent(i) {
  tabs[i].onchange()
}
/*** section:tabs ***/

onMounted(async () => {
  await loadReceipt()
})
</script>

<template>
  <div class="page-container">
    <h2 class="heading">{{ heading }}</h2>

    <TProgressBar
      v-if="!currentReceipt"
    />

    <TabContainer
      v-if="currentReceipt"
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
                  v-if="notEmpty(currentReceipt) && notEmpty(currentReceipt[field])"
                >
                  {{ inputValue(field, currentReceipt, includeKeys, dataFields) }}
                </span>

                <span
                  v-if="isEmpty(currentReceipt) || isEmpty(currentReceipt[field])"
                >
                --- no value ---
                </span>
              </div> <!-- field-value -->
            </div> <!-- data-field -->

          </div> <!-- data-row -->
        </div> <!-- details-container -->
      </template> <!-- template-0 -->

      <template #tab-1>
        <TemplateEditor
          v-if="receiptTemplate"
          template-type="receipt_templates"
          :id="receiptTemplate.id"
          :content-markup="receiptTemplate.contentMarkup"
          :content-styles="receiptTemplate.contentStyles"
          :data="templateData"
          :disabled="true"
        />
      </template> <!-- template-1 -->
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
