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
  if (templateType.value === 'invoice_templates') {
    return `Invoice Template ${templateId.value}`
  } else {
    return `Receipt Template ${templateId.value}`
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
  const params = {
    limit: 1,
    sort: {
      field: 'createdAt',
      order: 'desc'
    }
  }

  await dataAccess
    .view(`${templatesUrl.value}/${templateId.value}`, params)
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
    selfContact: 'Coffee Brew Apps',
    billingContact: 'Company ABC',
    invoiceLines: [
      { description: 'Requirements gathering', unitCost: 85, unit: 4, subtotal: 340 }
    ]
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
