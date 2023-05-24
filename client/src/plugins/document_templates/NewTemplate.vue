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

import { useErrors } from '@/utils/errors'
const errorsMap = useErrors()
/*** import:utils ***/

/*** import:stores ***/
import { useBannerStore } from '@/stores/banner'
const banner = useBannerStore()
/*** import:stores ***/

/*** import:components ***/
import {
  TButton,
  TAlert,
  TInput
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
  if (!currentTemplate.value) { return }

  return currentTemplate.value.id
})

const templateName = computed({
  get: () => {
    return currentTemplate.value.name
  },
  set: (val) => {
    currentTemplate.value.name = val
  }
})

const templateType = computed(() => {
  return currentRoute.params.templateType
})

const heading = computed(() => {
  if (templateType.value === 'invoice_templates') {
    return `Create Invoice Template`
  } else {
    return `Create Receipt Template`
  }
})

const templatesUrl = computed(() => {
  return `${config.baseUrl}/api/${templateType.value}`
})

const currentTemplate = ref({
  name: null,
  contentMarkup: null,
  contentStyles: null
})

const warningMessageDialog = ref(false)
const formErrors = ref({})
/*** section:global ***/

/*** section:validation ***/
function formatErrorsForDisplay(error) {
  return Object.entries(error).reduce((errors, [field, fieldErrors]) => {
    errors[field] = fieldErrors.map((errorName) => {
      return {
        name: errorName,
        params: {}
      }
    })
    return errors
  }, {})
}

function fieldErrorMessage(field) {
  if (!formErrors.value[field]) { return `` }

  return formErrors.value[field].map((error) => {
    return errorsMap[error.name](error.params)
  }).join(', ')
}

const editorErrorMessages = computed(() => {
  const messages = {}

  if (formErrors.value.contentMarkup) {
    messages.contentMarkup = fieldErrorMessage('contentMarkup')
  }

  if (formErrors.value.contentStyles) {
    messages.contentStyles = fieldErrorMessage('contentStyles')
  }

  return messages
})
/*** section:validation ***/

/*** section:action ***/
async function updateMarkup(updated) {
  if (!templateId.value) {
    currentTemplate.value.contentMarkup = updated
    return
  }

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
  if (!templateId.value) {
    currentTemplate.value.contentStyles = updated
    return
  }

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

function toggleWarningMessage() {
  warningMessageDialog.value = !warningMessageDialog.value
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

async function createTemplate() {
  const params = {
    name: currentTemplate.value.name,
    contentMarkup: currentTemplate.value.contentMarkup,
    contentStyles: currentTemplate.value.contentStyles
  }

  await dataAccess
    .create(`${templatesUrl.value}`, params)
    .then((result) => {
      currentTemplate.value = result
      showBanner(`Template created successfully!`)
    })
    .catch((error) => {
      showBanner(`Error creating template!`)
      formErrors.value = formatErrorsForDisplay(error)
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
})
</script>

<template>
  <div class="page-container">
    <h2 class="heading">
      {{ heading }}
      <i
        v-if="!templateId"
        class="fa-solid fa-circle-exclamation"
        @click="toggleWarningMessage"
      ></i>
    </h2>

    <div class="name">
      <TInput
        v-model="templateName"
        label="Template Name"
        size="lg"
        :error-message="fieldErrorMessage('name')"
      />
    </div>

    <TemplateEditor
      v-if="currentTemplate"
      :templates-url="templatesUrl"
      :id="currentTemplate.id"
      :content-markup="currentTemplate.contentMarkup"
      :content-styles="currentTemplate.contentStyles"
      :data="sampleData"
      :disabled="disabled"
      :enable-generate="false"
      :error-messages="editorErrorMessages"
      @content-markup-change="updateMarkup"
      @content-styles-change="updateStyles"
      @data-change="updateData"
    />

    <div
      v-if="!templateId"
      class="actions"
    >
      <TButton
        value="Create Template"
        icon="fa-solid fa-check"
        @click="createTemplate"
      />
    </div>

    <TAlert
      v-model="warningMessageDialog"
      title="Reminder"
      content="You have not saved your template. Make sure to click on Create Template to submit the changes."
      :width="600"
      :height="250"
    />
  </div>
</template>

<style scoped>
.page-container {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.heading {
  font-weight: 900;
}

.heading .fa-circle-exclamation {
  padding-left: 1rem;
  font-size: 1rem;
  color: var(--color-error);
}

.heading .fa-circle-exclamation:hover {
  cursor: pointer;
  color: var(--color-error-hover);
}

.actions {
  display: flex;
  justify-content: center;
}
</style>
