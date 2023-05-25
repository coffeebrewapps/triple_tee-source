<script setup>
/*** import:global ***/
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
/*** import:global ***/

/*** import:config ***/
import useConfig from '@/config'
const config = useConfig()
/*** import:config ***/

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
const templatesUrl = computed(() => {
  return `${config.baseUrl}/api/${templateType.value}`
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
    .update(`${templatesUrl.value}/${templateId.value}`, params)
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
    .update(`${templatesUrl.value}/${templateId.value}`, params)
    .then((result) => {
      currentTemplate.value = result
      showBanner(`Updated styles successfully!`)
    })
    .catch((error) => {
      showBanner(`Error updating styles !`)
    })
}

function updateData(updated) {
  sampleData.value = updated
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
    .view(`${templatesUrl.value}/${templateId.value}`, {})
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
    invoiceConfig: {
      id: "1",
      invoiceCycleDurationValue: 1,
      invoiceCycleDurationUnit: "month",
      dueDateCycleValue: 30,
      dueDateCycleUnit: "day",
      paymentTerms: null,
      tags: [
        "1"
      ],
      customFields: {},
      invoiceNumberSequenceId: "1",
      billingContactId: "1",
      invoiceTemplateId: "1",
      createdAt: "2023-05-24T12:33:34.246Z",
      updatedAt: "2023-05-24T12:33:34.246Z",
      invoiceDate: "2023-04-01",
      dueDate: "2023-04-30"
    },
    invoiceNumberSequence: {
      id: "1",
      name: "Company ABC Invoice Sequence",
      startingNumber: "1",
      lastUsedNumber: 1,
      incrementStep: "1",
      prefix: "inv",
      suffix: "abc",
      createdAt: "2023-05-24T12:31:12.948Z",
      updatedAt: "2023-05-24T12:31:12.948Z",
      currentSequence: 4
    },
    billingContact: {
      id: "1",
      name: "Company XYZ",
      accountNumber: null,
      addressLine1: "123 City Street",
      addressLine2: "Northern Building",
      addressLine3: null,
      city: "Singapore",
      state: null,
      country: "Singapore",
      postcode: "432662",
      contactNumber1: "+6563782346",
      contactNumber2: null,
      contactNumber3: null,
      contactPerson1: "Ms May",
      contactPerson2: null,
      contactPerson3: null,
      contactEmail1: "may@company-xyz.com",
      contactEmail2: null,
      contactEmail3: null,
      url1: "company-xyz.com",
      url2: null,
      url3: null,
      logo: null,
      customFields: null,
      createdAt: "2023-05-24T07:02:04.463Z",
      updatedAt: "2023-05-24T07:02:04.463Z"
    },
    invoiceLines: [
      {
        id: "1",
        effectiveStart: "2023-04-30T16:00:00.000Z",
        effectiveEnd: null,
        rateType: "duration",
        unit: "hour",
        unitCost: 85,
        includeTags: [
          "1"
        ],
        excludeTags: [],
        contactId: "1",
        createdAt: "2023-05-24T13:08:13.707Z",
        updatedAt: "2023-05-24T13:08:13.707Z",
        includes: {
          includeTags: {
            "1": {
              id: "1",
              category: "company",
              name: "company-abc",
              description: "Company ABC",
              textColor: null,
              backgroundColor: null,
              createdAt: "2023-05-24T08:05:06.789Z",
              updatedAt: "2023-05-24T08:05:06.789Z"
            }
          }
        },
        tags: [
          {
            id: "1",
            category: "company",
            name: "company-abc",
            description: "Company ABC",
            textColor: null,
            backgroundColor: null,
            createdAt: "2023-05-24T08:05:06.789Z",
            updatedAt: "2023-05-24T08:05:06.789Z"
          }
        ],
        subTotal: 30.207134722222225,
        totalDuration: 1279361,
        totalDurationInUnit: 0.3553780556
      }
    ],
    invoice: {
      totalAmount: 30.207134722222225
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
      :templates-url="templatesUrl"
      :id="currentTemplate.id"
      :content-markup="currentTemplate.contentMarkup"
      :content-styles="currentTemplate.contentStyles"
      :data="sampleData"
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
