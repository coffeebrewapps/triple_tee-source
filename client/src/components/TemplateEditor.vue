<script setup>
/** import:global **/
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
/** import:global **/

/** import:utils **/
import { useDataAccess } from '@/utils/dataAccess';
import { useValidations } from '@/utils/validations';
import { Liquid } from 'liquidjs';
/** import:utils **/

/** import:components **/
import {
  TButton,
  TDialog,
  TProgressBar
} from 'coffeebrew-vue-components';

import TabContainer from './TabContainer.vue';
/** import:components **/

/** section:props **/
const props = defineProps({
  id: {
    type: String,
    default: null,
  },
  contentMarkup: {
    type: String,
    default: '',
  },
  contentStyles: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default() {
      return {};
    },
  },
  errorMessages: {
    type: Object,
    default() {
      return {};
    },
  },
  enableGenerate: {
    type: Boolean,
    default: true,
  },
  templateType: {
    type: String,
    default: null,
  },
});
/** section:props **/

/** section:emit **/
const emit = defineEmits(['contentMarkupChange', 'contentStylesChange', 'dataChange']);
/** section:emit **/

/** section:utils **/
const router = useRouter();
const dataAccess = useDataAccess();
const { notEmpty } = useValidations();
const liquidEngine = new Liquid();
/** section:utils **/

/** section:global **/
const styleComponentName = ref('style');
const template = computed(() => {
  return {
    contentMarkup: props.contentMarkup,
    contentStyles: props.contentStyles,
  };
});
/** section:global **/

/** section:tabs **/
const selectedTab = ref(0);
const editorTabs = [
  { label: 'Markup' },
  { label: 'Styles' },
  { label: 'Data' },
];

function triggerTabEvent(i) {
  selectedTab.value = i;
}
/** section:tabs **/

/** section:editor **/
const markupEditor = ref('markupEditor');
const stylesEditor = ref('stylesEditor');
const sampleDataEditor = ref('sampleDataEditor');

const markupEditable = ref(false);
const stylesEditable = ref(false);
const sampleDataEditable = ref(false);

const markupEditorStyleClass = computed(() => {
  const classNames = [];

  classNames.push(`editor`);

  if (markupEditable.value) {
    classNames.push(`editable`);
  }

  if (props.disabled) {
    classNames.push(`disabled`);
  }

  return classNames.join(' ');
});

const stylesEditorStyleClass = computed(() => {
  const classNames = [];

  classNames.push(`editor`);

  if (stylesEditable.value) {
    classNames.push(`editable`);
  }

  if (props.disabled) {
    classNames.push(`disabled`);
  }

  return classNames.join(' ');
});

const sampleDataEditorStyleClass = computed(() => {
  const classNames = [];

  classNames.push(`editor`);

  if (sampleDataEditable.value) {
    classNames.push(`editable`);
  }

  if (props.disabled) {
    classNames.push(`disabled`);
  }

  return classNames.join(' ');
});

function toggleMarkupEditor() {
  markupEditable.value = true;
}

async function confirmMarkupEdit() {
  previewError.value = false;

  await renderPreview()
    .then((result) => {
      updateMarkup();
    })
    .catch((error) => {
      previewError.value = true;
      parsedMarkup.value = `Markup error`;
      console.log(error);
    })
    .finally(() => {
      markupEditable.value = false;
    });
}

function toggleStylesEditor() {
  stylesEditable.value = true;
}

function confirmStylesEdit() {
  updateStyles();
  stylesEditable.value = false;
}

function toggleSampleDataEditor() {
  sampleDataEditable.value = true;
}

async function confirmSampleDataEdit() {
  previewError.value = false;

  await renderPreview()
    .then((result) => {
      updateData();
    })
    .catch((error) => {
      previewError.value = true;
      parsedMarkup.value = `Sample data error`;
      console.log(error);
    })
    .finally(() => {
      sampleDataEditable.value = false;
    });
}

function cancelMarkupEdit() {
  markupEditable.value = !markupEditable.value;
}

function cancelStylesEdit() {
  stylesEditable.value = !stylesEditable.value;
}

function cancelSampleDataEdit() {
  sampleDataEditable.value = !sampleDataEditable.value;
}

function updateMarkup() {
  emit('contentMarkupChange', markupEditor.value.innerText);
}

function updateStyles() {
  emit('contentStylesChange', stylesEditor.value.innerText);
}

function updateData() {
  const sampleDataEditorContent = sampleDataEditor.value.innerText;

  if (notEmpty(sampleDataEditorContent)) {
    emit('dataChange', JSON.parse(sampleDataEditorContent));
  }
}

/** section:editor **/

/** section:preview **/
const samplePdfData = computed(() => {
  return props.data;
});

const previewContentStyles = computed(() => {
  if (previewError.value) {
    return `preview-content error`;
  } else {
    return `preview-content`;
  }
});

const parsedMarkup = ref();
const previewError = ref(false);

async function renderPreview() {
  return new Promise((resolve, reject) => {
    parsedMarkup.value = null;
    const sampleDataEditorContent = sampleDataEditor.value.innerText;

    if (notEmpty(sampleDataEditorContent)) {
      liquidEngine
        .parseAndRender(markupEditor.value.innerText, JSON.parse(sampleDataEditorContent))
        .then((result) => {
          parsedMarkup.value = result;
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    } else {
      resolve();
    }
  });
}
/** section:preview **/

/** section:generate **/
const previewPdfDialog = ref(false);
const templatePdfData = ref();
const downloadLink = ref();
const downloadFile = ref();

async function generateTemplate() {
  templatePdfData.value = null;
  previewPdfDialog.value = true;

  await dataAccess
    .downloadStream(props.templateType, props.id, samplePdfData.value, { path: 'pdf' })
    .then((result) => {
      const blob = new Blob([result.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      downloadLink.value = url;
      downloadFile.value = `${props.templateType}_${props.id}.pdf`;
      templatePdfData.value = url;
      viewPdf();
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      closePreviewDialog();
    });
}

function viewPdf() {
  const currentRoute = Object.assign({}, router.currentRoute.value);
  const viewPdfRoute = {
    path: '/document_templates/:templateType/:id/pdf',
    name: 'View Pdf',
    component: () => import('@/components/PdfViewer.vue'),
    props: {
      templatePdfData: templatePdfData.value,
      downloadLink: downloadLink.value,
      downloadFile: downloadFile.value,
    },
    meta: {
      parentRoute: { name: currentRoute.name },
      hidden: true,
    },
  };
  router.addRoute(viewPdfRoute);
  router.push({ name: 'View Pdf', params: { templateType: props.templateType, id: props.id } });
}

function closePreviewDialog() {
  previewPdfDialog.value = false;
}
/** section:generate **/

onMounted(async() => {
  await renderPreview();
});
</script>

<template>
  <div class="preview-template">
    <div class="template-editor">
      <TabContainer
        :selected-tab="selectedTab"
        :tabs="editorTabs"
        @tab-change="triggerTabEvent"
      >
        <template #tab-0>
          <div
            :class="markupEditorStyleClass"
          >
            <div
              class="editor-button cancel"
              @click="cancelMarkupEdit"
            >
              <i class="fa-solid fa-xmark" />
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
              <i class="fa-solid fa-pencil" />
            </div>

            <div
              class="editor-button confirm"
              @click="confirmMarkupEdit"
            >
              <i class="fa-solid fa-check" />
            </div>
          </div>

          <div
            v-if="errorMessages.contentMarkup"
            class="error-message"
          >
            {{ errorMessages.contentMarkup }}
          </div>
        </template> <!-- template-0 -->

        <template #tab-1>
          <div
            :class="stylesEditorStyleClass"
          >
            <div
              class="editor-button cancel"
              @click="cancelStylesEdit"
            >
              <i class="fa-solid fa-xmark" />
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
              <i class="fa-solid fa-pencil" />
            </div>

            <div
              class="editor-button confirm"
              @click="confirmStylesEdit"
            >
              <i class="fa-solid fa-check" />
            </div>
          </div>

          <div
            v-if="errorMessages.contentStyles"
            class="error-message"
          >
            {{ errorMessages.contentStyles }}
          </div>
        </template> <!-- template-1 -->

        <template #tab-2>
          <div
            :class="sampleDataEditorStyleClass"
          >
            <div
              class="editor-button cancel"
              @click="cancelSampleDataEdit"
            >
              <i class="fa-solid fa-xmark" />
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
              <i class="fa-solid fa-pencil" />
            </div>

            <div
              class="editor-button confirm"
              @click="confirmSampleDataEdit"
            >
              <i class="fa-solid fa-check" />
            </div>
          </div>
        </template> <!-- template-2 -->
      </TabContainer>
    </div> <!-- template-editor -->

    <div class="preview-container">
      <h3 class="heading">
        Preview
      </h3>

      <div
        :class="previewContentStyles"
        v-html="parsedMarkup"
      />

      <component
        :is="styleComponentName"
        v-if="contentStyles"
      >
        {{ contentStyles }}
      </component>

      <div class="buttons">
        <TButton
          v-if="enableGenerate"
          value="Generate"
          icon="fa-solid fa-file-export"
          @click="generateTemplate"
        />
      </div>
    </div> <!-- preview-container -->

    <TDialog
      v-model="previewPdfDialog"
      class="generate-dialog"
      title="Generating PDF"
      :width="400"
      :height="250"
    >
      <template #body>
        <TProgressBar
          v-if="!templatePdfData"
        />

        <div class="message">
          Generating PDF...
        </div>
      </template>
    </TDialog>
  </div> <!-- preview-template -->
</template>

<style scoped>
.heading {
  font-weight: 900;
}

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

.error-message {
  margin: 8px 0;
  font-size: 0.8rem;
  color: var(--color-error);
}

.preview-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 60%;
  height: 100vh;
  margin-top: 1rem;
}

.preview-container .buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.preview-content {
  padding: 1rem;
  width: 100%;
  border: 1px solid var(--color-border);
  background-color: white;
  border-radius: 4px;
}

.preview-content.error {
  color: var(--color-error);
}

.generate-dialog .message {
  margin: 1rem 0;
}
</style>
