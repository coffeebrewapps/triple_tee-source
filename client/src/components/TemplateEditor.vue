<script setup>
/*** import:global ***/
import { ref, computed, onMounted } from 'vue'
/*** import:global ***/

/*** import:utils ***/
import { useDataAccess } from '@/utils/dataAccess'
const dataAccess = useDataAccess()

import { Liquid } from 'liquidjs'
const liquidEngine = new Liquid();
/*** import:utils ***/

/*** import:components ***/
import {
  TButton,
  TDialog,
  TProgressBar
} from 'coffeebrew-vue-components'

import TabContainer from './TabContainer.vue'
/*** import:components ***/

/*** section:props ***/
const props = defineProps({
  templatesUrl: {
    type: String,
    default: null
  },
  id: {
    type: String,
    default: null
  },
  contentMarkup: {
    type: String,
    default: ''
  },
  contentStyles: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
/*** section:props ***/

/*** section:emit ***/
const emit = defineEmits(['contentMarkupChange', 'contentStylesChange'])
/*** section:emit ***/

/*** section:global ***/
const template = computed(() => {
  return {
    contentMarkup: props.contentMarkup,
    contentStyles: props.contentStyles
  }
})

const editorTabs = [
  { label: 'Markup' },
  { label: 'Styles' },
  { label: 'Data' }
]
/*** section:global ***/

/*** section:editor ***/
const markupEditor = ref('markupEditor')
const stylesEditor = ref('stylesEditor')
const sampleDataEditor = ref('sampleDataEditor')

const markupEditable = ref(false)
const stylesEditable = ref(false)
const sampleDataEditable = ref(false)

const markupEditorStyleClass = computed(() => {
  const classNames = []

  classNames.push(`editor`)

  if (markupEditable.value) {
    classNames.push(`editable`)
  }

  if (props.disabled) {
    classNames.push(`disabled`)
  }

  return classNames.join(' ')
})

const stylesEditorStyleClass = computed(() => {
  const classNames = []

  classNames.push(`editor`)

  if (stylesEditable.value) {
    classNames.push(`editable`)
  }

  if (props.disabled) {
    classNames.push(`disabled`)
  }

  return classNames.join(' ')
})

const sampleDataEditorStyleClass = computed(() => {
  const classNames = []

  classNames.push(`editor`)

  if (sampleDataEditable.value) {
    classNames.push(`editable`)
  }

  if (props.disabled) {
    classNames.push(`disabled`)
  }

  return classNames.join(' ')
})

function toggleMarkupEditor() {
  markupEditable.value = true
}

async function confirmMarkupEdit() {
  previewError.value = false

  await renderPreview()
    .then((result) => {
      updateMarkup()
    })
    .catch((error) => {
      previewError.value = true
      parsedMarkup.value = `Markup error`
      console.log(error)
    })
    .finally(() => {
      markupEditable.value = false
    })
}

function toggleStylesEditor() {
  stylesEditable.value = true
}

function confirmStylesEdit() {
  updateStyles()
  stylesEditable.value = false
}

function toggleSampleDataEditor() {
  sampleDataEditable.value = true
}

async function confirmSampleDataEdit() {
  samplePdfData.value = JSON.parse(sampleDataEditor.value.innerText)
  previewError.value = false

  await renderPreview()
    .then((result) => {
      updateMarkup()
    })
    .catch((error) => {
      previewError.value = true
      parsedMarkup.value = `Sample data error`
      console.log(error)
    })
    .finally(() => {
      sampleDataEditable.value = false
    })
}

function cancelMarkupEdit() {
  markupEditable.value = !markupEditable.value
}

function cancelStylesEdit() {
  stylesEditable.value = !stylesEditable.value
}

function cancelSampleDataEdit() {
  sampleDataEditable.value = !sampleDataEditable.value
}

function updateMarkup() {
  emit('contentMarkupChange', markupEditor.value.innerText)
}

function updateStyles() {
  emit('contentStylesChange', stylesEditor.value.innerText)
}
/*** section:editor ***/

/*** section:preview ***/
const samplePdfData = ref()

const previewContentStyles = computed(() => {
  if (previewError.value) {
    return `preview-content error`
  } else {
    return `preview-content`
  }
})

const parsedMarkup = ref()
const previewError = ref(false)

async function renderPreview() {
  return new Promise((resolve, reject) => {
    parsedMarkup.value = null
    liquidEngine
      .parseAndRender(markupEditor.value.innerText, samplePdfData.value)
      .then((result) => {
        parsedMarkup.value = result
        resolve(result)
      })
      .catch((error) => {
        reject(error)
      })
  })
}
/*** section:preview ***/

/*** section:generate ***/
const previewPdfDialog = ref(false)
const templatePdfData = ref()
const downloadLink = ref()
const downloadFile = ref()
const downloadAnchor = ref('downloadAnchor')

async function generateTemplate() {
  templatePdfData.value = null
  previewPdfDialog.value = true

  await dataAccess
    .downloadStream(`${props.templatesUrl}/${props.id}/pdf`, samplePdfData.value)
    .then((result) => {
      const blob = new Blob([result.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      downloadLink.value = url
      downloadFile.value = `invoice_templates_${props.id}.pdf`
      templatePdfData.value = url
    })
    .catch((error) => {
      console.log(error)
    })
}

function downloadPdf() {
  downloadAnchor.value.click()
  closePreviewDialog()
}

function closePreviewDialog() {
  previewPdfDialog.value = false
}
/*** section:generate ***/

onMounted(async () => {
  samplePdfData.value = {
    selfContact: 'Coffee Brew Apps',
    billingContact: 'Company ABC',
    invoiceLines: [
      { description: 'Requirements gathering', unitCost: 85, unit: 4, subtotal: 340 }
    ]
  }

  await renderPreview()
})
</script>

<template>
  <div class="preview-template">
    <div class="template-editor">
      <TabContainer
        :tabs="editorTabs"
      >
        <template #tab-0>
          <div
            :class="markupEditorStyleClass"
          >
            <div
              class="editor-button cancel"
              @click="cancelMarkupEdit"
            >
              <i class="fa-solid fa-xmark"></i>
            </div>

            <div
              ref="markupEditor"
              class="editor-content"
              :contenteditable="markupEditable"
            >
              {{ template.contentMarkup }}
            </div>

            <div
              class="editor-button edit"
              @click="toggleMarkupEditor"
            >
              <i class="fa-solid fa-pencil"></i>
            </div>

            <div
              class="editor-button confirm"
              @click="confirmMarkupEdit"
            >
              <i class="fa-solid fa-check"></i>
            </div>
          </div>
        </template>

        <template #tab-1>
          <div
            :class="stylesEditorStyleClass"
          >
            <div
              class="editor-button cancel"
              @click="cancelStylesEdit"
            >
              <i class="fa-solid fa-xmark"></i>
            </div>

            <div
              ref="stylesEditor"
              class="editor-content"
              :contenteditable="stylesEditable"
            >
              {{ template.contentStyles }}
            </div>

            <div
              class="editor-button edit"
              @click="toggleStylesEditor"
            >
              <i class="fa-solid fa-pencil"></i>
            </div>

            <div
              class="editor-button confirm"
              @click="confirmStylesEdit"
            >
              <i class="fa-solid fa-check"></i>
            </div>
          </div>
        </template>

        <template #tab-2>
          <div
            :class="sampleDataEditorStyleClass"
          >
            <div
              class="editor-button cancel"
              @click="cancelSampleDataEdit"
            >
              <i class="fa-solid fa-xmark"></i>
            </div>

            <div
              ref="sampleDataEditor"
              class="editor-content"
              :contenteditable="sampleDataEditable"
            >
              {{ samplePdfData }}
            </div>

            <div
              class="editor-button edit"
              @click="toggleSampleDataEditor"
            >
              <i class="fa-solid fa-pencil"></i>
            </div>

            <div
              class="editor-button confirm"
              @click="confirmSampleDataEdit"
            >
              <i class="fa-solid fa-check"></i>
            </div>
          </div>
        </template>
      </TabContainer>
    </div>

    <div class="preview-container">
      <h3 class="heading">Preview</h3>

      <div
        :class="previewContentStyles"
        v-html="parsedMarkup"
      >
      </div>

      <component
        v-if="contentStyles"
        is="style"
        v-html="contentStyles"
      >
      </component>

      <div class="buttons">
        <TButton
          value="Generate"
          icon="fa-solid fa-file-export"
          @click="generateTemplate"
        />
      </div>
    </div>

    <TDialog
      v-model="previewPdfDialog"
      title="Generate Template"
      :fullscreen="true"
    >
      <template #body>
        <TProgressBar
          v-if="!templatePdfData"
        />

        <iframe
          v-if="templatePdfData"
          class="preview-panel"
          :src="templatePdfData"
        >
        </iframe>
      </template>

      <template #actions>
        <TButton
          value="Download"
          icon="fa-solid fa-file-arrow-down"
          @click="downloadPdf"
        />

        <TButton
          value="Cancel"
          icon="fa-solid fa-xmark"
          @click="closePreviewDialog"
        />

        <a class="hidden" ref="downloadAnchor" rel="noreferrer" :download="downloadFile" :href="downloadLink"></a>
      </template>
    </TDialog>
  </div>
</template>

<style scoped>
.preview-template {
  display: flex;
  flex-direction: row;
  gap: 2rem;
}

.template-editor {
  width: 40%;
}

.editor {
  padding: 1rem;
  width: 100%;
  height: 60vh;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-background-mute);
  white-space: pre-wrap;
}

.editor.editable {
  background-color: var(--color-background);
}

.editor-content {
  width: 100%;
  height: 100%;
  outline: none;
  overflow-y: auto;
}

.editor-button {
  position: absolute;
  top: -1rem;
  right: -1rem;
  display: grid;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: var(--color-border);
}

.editor.disabled .editor-button {
  display: none !important;
}

.editor-button.cancel {
  left: -1rem;
}

.editor-button:hover {
  cursor: pointer;
  background-color: var(--color-border-hover);
}

.editor.editable .editor-button.confirm {
  display: grid;
}

.editor .editor-button.confirm {
  display: none;
}

.editor.editable .editor-button.edit {
  display: none;
}

.editor .editor-button.edit {
  display: grid;
}

.editor.editable .editor-button.cancel {
  display: grid;
}

.editor .editor-button.cancel {
  display: none;
}

.preview-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 60%;
  height: 100vh;
  margin-top: 1rem;
}

.preview-container .heading {
  font-weight: 900;
}

.preview-container .buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.preview-content {
  padding: 1rem;
  width: 100%;
  height: 100%;
  border: 1px solid var(--color-border);
  background-color: white;
  border-radius: 4px;
}

.preview-content.error {
  color: var(--color-error);
}

.preview-panel {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
