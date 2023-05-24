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
import { useBannerStore } from '@/stores/banner'
const banner = useBannerStore()
/*** import:stores ***/

/*** import:components ***/
import TabContainer from '@/components/TabContainer.vue'
import InvoiceConfig from '@/plugins/invoice_configs/view.vue'
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
    return `Contact`
  }
})

async function loadContact() {
  const params = { include: includeKeys.value }

  await dataAccess
    .view(`${contactsUrl}/${contactId.value}`, params)
    .then((result) => {
      currentContact.value = result
      showBanner(`Loaded contact successfully!`);
    })
    .catch((error) => {
      console.log(error)
      showBanner(`Error loading contact!`);
    })
}

async function loadInvoiceConfig() {
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
  { label: 'Invoice Configs', onchange: loadInvoiceConfig }
]

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

    <TabContainer
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
                  {{ inputValue(field, currentContact, includeKeys) }}
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
        <InvoiceConfig
          :billing-contact-id="contactId"
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
