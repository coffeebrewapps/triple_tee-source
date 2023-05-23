<script setup>
/*** import:global ***/
import { ref, computed } from 'vue'
/*** import:global ***/

/*** import:utils ***/
import { useDataAccess } from '@/utils/dataAccess'
const dataAccess = useDataAccess()
/*** import:utils ***/

/*** import:components ***/
import {
  TButton,
  TDialog,
  TProgressBar
} from 'coffeebrew-vue-components'
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
/*** section:global ***/

/*** section:editor ***/
const markupEditor = ref('markupEditor')
const stylesEditor = ref('stylesEditor')

const markupEditable = ref(false)
const stylesEditable = ref(false)

const markupEditorStyleClass = computed(() => {
  if (markupEditable.value) {
    return `editor editable`
  } else {
    return `editor`
  }
})

const stylesEditorStyleClass = computed(() => {
  if (stylesEditable.value) {
    return `editor editable`
  } else {
    return `editor`
  }
})

const combinedMarkup = computed(() => {
  if (!template.value) { return `` }

  const content = []

  content.push(`<html>`)
  content.push(`<head>`)

  content.push(`<style>`)
  content.push(template.value.contentStyles)
  content.push(`</style>`)

  content.push(`</head>`)

  content.push(`<body>`)
  content.push(template.value.contentMarkup)
  content.push(`</body>`)

  content.push(`</html>`)

  return content.join('')
})

const previewPdfDialog = ref(false)
const pdfWorker = ref()
const templatePdfData = ref()
const downloadLink = ref()
const downloadFile = ref()
const downloadAnchor = ref('downloadAnchor')

function toggleMarkupEditor() {
  markupEditable.value = true
}

function confirmMarkupEdit() {
  updateMarkup()
  markupEditable.value = false
}

function toggleStylesEditor() {
  stylesEditable.value = true
}

function confirmStylesEdit() {
  updateStyles()
  stylesEditable.value = false
}
/*** section:editor ***/

/*** section:action ***/
function cancelMarkupEdit() {
  markupEditable.value = !markupEditable.value
}

function cancelStylesEdit() {
  stylesEditable.value = !stylesEditable.value
}

function updateMarkup() {
  emit('contentMarkupChange', markupEditor.value.innerText)
}

function updateStyles() {
  emit('contentStylesChange', stylesEditor.value.innerText)
}

async function generateTemplate() {
  templatePdfData.value = null
  previewPdfDialog.value = true

  await dataAccess
    .downloadStream(`${props.templatesUrl}/${props.id}/pdf`)
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
/*** section:action ***/
</script>

<template>
  <div class="preview-template">
    <div class="template-editor">
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
    </div>

    <div class="preview-container">
      <div
        v-if="contentMarkup"
        v-html="contentMarkup"
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
  margin: 1rem auto;
  display: flex;
  flex-direction: row;
  gap: 2rem;
}

.template-editor {
  display: flex;
  flex-direction: column;
  gap: 2rem;
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
}

.preview-container .buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.preview-panel {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
