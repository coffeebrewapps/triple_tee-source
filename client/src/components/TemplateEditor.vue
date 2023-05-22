<script setup>
/*** import:global ***/
import { ref, computed } from 'vue'
/*** import:global ***/

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

function toggleMarkupEditor() {
  if (markupEditable.value) {
    updateMarkup()
  }

  markupEditable.value = !markupEditable.value
}

function toggleStylesEditor() {
  if (stylesEditable.value) {
    updateStyles()
  }

  stylesEditable.value = !stylesEditable.value
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
          class="editor-button"
          @click="toggleMarkupEditor"
        >
          <i class="fa-solid fa-pencil"></i>
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
          class="editor-button"
          @click="toggleStylesEditor"
        >
          <i class="fa-solid fa-pencil"></i>
          <i class="fa-solid fa-check"></i>
        </div>
      </div>
    </div>

    <div class="preview-panel">
      <div
        v-if="template"
        v-html="template.contentMarkup"
        class="template-container"
      >
      </div>
      <component
        v-if="template"
        is="style"
        scoped
      >
        {{ template.contentStyles }}
      </component>
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
  white-space: pre-wrap;
}

.editor.editable {
  background-color: white;
  color: black;
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

.editor.editable .editor-button {
  color: rgba(255, 255, 255, 0.8);
}

.editor-button.cancel {
  left: -1rem;
}

.editor-button:hover {
  cursor: pointer;
  background-color: var(--color-border-hover);
}

.editor.editable .editor-button .fa-check {
  display: inline-block;
}

.editor .editor-button .fa-check {
  display: none;
}

.editor.editable .editor-button .fa-pencil {
  display: none;
}

.editor .editor-button .fa-pencil {
  display: inline-block;
}

.editor.editable .editor-button.cancel {
  display: grid;
}

.editor .editor-button.cancel {
  display: none;
}

.preview-panel {
}
</style>
