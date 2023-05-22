<script setup>
/*** import:global ***/
import { ref, computed, onMounted } from 'vue'
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

import { useEventsStore } from '@/stores/events'
const events = useEventsStore()
/*** import:stores ***/

/*** section:global ***/
const templatesUrl = `${config.baseUrl}/api/invoice_templates`
const latestTemplate = ref()
/*** section:global ***/

/*** section:editor ***/
const markupEditor = ref('markupEditor')
const stylesEditor = ref('stylesEditor')

const markupEditable = ref(false)
const stylesEditable = ref(false)

const latestTemplateMarkup = ref()
const latestTemplateStyles = ref()

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

async function toggleMarkupEditor() {
  if (markupEditable.value) {
    await updateMarkup()
  }

  markupEditable.value = !markupEditable.value
}

async function toggleStylesEditor() {
  if (stylesEditable.value) {
    await updateStyles()
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

async function updateMarkup() {
  latestTemplateMarkup.value = markupEditor.value.innerText

  const params = Object.assign(
    {},
    latestTemplate.value,
    {
      contentMarkup: latestTemplateMarkup.value
    }
  )

  await dataAccess
    .update(`${templatesUrl}/${latestTemplate.value.id}`, params)
    .then((result) => {
      showBanner(`Updated markup successfully!`)
    })
    .catch((error) => {
      showBanner(`Error updating markup !`)
    })
}

async function updateStyles() {
  latestTemplateStyles.value = stylesEditor.value.innerText

  const params = Object.assign(
    {},
    latestTemplate.value,
    {
      contentStyles: latestTemplateStyles.value
    }
  )

  await dataAccess
    .update(`${templatesUrl}/${latestTemplate.value.id}`, params)
    .then((result) => {
      showBanner(`Updated styles successfully!`)
    })
    .catch((error) => {
      showBanner(`Error updating styles !`)
    })
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

/*** section:events ***/
events.registerListener(
  'loadLatestTemplate',
  {
    id: 'PreviewTemplate',
    invoke: (payload) => {
      loadLatest()
    }
  }
)
/*** section:events ***/

async function loadLatest() {
  const params = {
    limit: 1,
    sort: {
      field: 'createdAt',
      order: 'desc'
    }
  }

  await dataAccess
    .list(templatesUrl, params)
    .then((result) => {
      latestTemplate.value = result.data[0]
      if (latestTemplate.value) {
        latestTemplateMarkup.value = latestTemplate.value.contentMarkup
        latestTemplateStyles.value = latestTemplate.value.contentStyles
      }
    })
    .catch((error) => {
      console.log(error)
    })
}

onMounted(async () => {
  await loadLatest()
})
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
          {{ latestTemplateMarkup }}
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
          {{ latestTemplateStyles }}
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
        v-if="latestTemplate"
        v-html="latestTemplateMarkup"
        class="template-container"
      >
      </div>
      <component
        v-if="latestTemplate"
        is="style"
        scoped
      >
        {{ latestTemplateStyles }}
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
