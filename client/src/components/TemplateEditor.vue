<script setup>
/*** import:global ***/
import { ref, computed } from 'vue'
/*** import:global ***/

/*** import:utils ***/
import html2pdf from 'html2pdf.js'
/*** import:utils ***/

/*** import:components ***/
import {
  TButton
} from 'coffeebrew-vue-components'
/*** import:components ***/

/*** section:props ***/
const props = defineProps({
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

const pdfViewer = ref('pdfViewer')
const pdfWorker = ref()
const templatePdf = ref()

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

function previewTemplate() {
  if (!template.value) { return }

  const scale = 4
  const width = 874
  const height = 1240
  pdfViewer.value.width = width * scale
  pdfViewer.value.height = height * scale
  pdfViewer.value.style.width =  `${width}px`
  pdfViewer.value.style.height = `${height}px`

  const context = pdfViewer.value.getContext('2d')
  context.scale(scale, scale)

  const opt = {
    filename:     'myfile.pdf',
    image:        { type: 'jpeg', quality: 1 },
    html2canvas:  { scale: 1, canvas: pdfViewer.value },
    jsPDF:        { unit: 'px', format: 'a4', orientation: 'portrait', hotfixes: ['px_scaling'] }
  }

  pdfWorker.value = html2pdf().set(opt).from(combinedMarkup.value).toCanvas()
}

function downloadPdf() {
  if (!pdfWorker.value) { return }

  pdfWorker.value.save()
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

      <div
        class="editor"
      >
        {{ combinedMarkup }}
      </div>
    </div>

    <div>
      <div class="buttons">
        <TButton
          value="Preview"
          icon="fa-solid fa-eye"
          @click="previewTemplate"
        />

        <TButton
          value="Download"
          icon="fa-solid fa-eye"
          @click="downloadPdf"
        />
      </div>

      <canvas
        class="preview-panel"
        ref="pdfViewer"
      >
      </canvas>
    </div>
  </div>
</template>

<style scoped>
.preview-template {
  margin: 1rem auto;
  display: grid;
  grid-template-columns: 2fr 4fr;
  gap: 2rem;
}

.template-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  padding: 1rem;
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.template-editor {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.editor {
  padding: 1rem;
  width: 100%;
  height: auto;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-background-mute);
  white-space: pre-wrap;
}

.editor.editable {
  background-color: var(--color-background);
}

.editor-content {
  outline: none;
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

.buttons {
  display: flex;
  gap: 1rem;
}

.preview-panel {
  width: 874px;
  height: 1240px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}
</style>
