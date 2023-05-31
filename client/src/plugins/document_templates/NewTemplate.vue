<script setup>
/** import:global **/
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
/** import:global **/

/** import:utils **/
import { useDataAccess } from '@/utils/dataAccess';
import { useErrors } from '@/utils/errors';
import { useTemplateUtils } from './utils';
/** import:utils **/

/** import:stores **/
import { useBannerStore } from '@/stores/banner';
/** import:stores **/

/** import:components **/
import {
  TButton,
  TAlert,
  TInput
} from 'coffeebrew-vue-components';

import TemplateEditor from '@/components/TemplateEditor.vue';
/** import:components **/

/** section:props **/
defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});
/** section:props **/

/** section:utils **/
const router = useRouter();
const dataAccess = useDataAccess();
const errorsMap = useErrors();
const { flashMessage } = useBannerStore();
const { initSampleData } = useTemplateUtils();
/** section:utils **/

/** section:global **/
const sampleData = ref({});

const currentRoute = Object.assign({}, router.currentRoute.value);

const templateId = computed(() => {
  if (!currentTemplate.value) { return; }

  return currentTemplate.value.id;
});

const templateName = computed({
  get: () => {
    return currentTemplate.value.name;
  },
  set: (val) => {
    currentTemplate.value.name = val;
  },
});

const templateType = computed(() => {
  return currentRoute.params.templateType;
});

const heading = computed(() => {
  if (templateType.value === 'invoice_templates') {
    return `Create Invoice Template`;
  } else {
    return `Create Receipt Template`;
  }
});

const currentTemplate = ref({
  name: null,
  contentMarkup: null,
  contentStyles: null,
});

const warningMessageDialog = ref(false);
const formErrors = ref({});
/** section:global **/

/** section:validation **/
function formatErrorsForDisplay(error) {
  return Object.entries(error).reduce((errors, [field, fieldErrors]) => {
    errors[field] = fieldErrors.map((errorName) => {
      return {
        name: errorName,
        params: {},
      };
    });
    return errors;
  }, {});
}

function fieldErrorMessage(field) {
  if (!formErrors.value[field]) { return ``; }

  return formErrors.value[field].map((error) => {
    return errorsMap[error.name](error.params);
  }).join(', ');
}

const editorErrorMessages = computed(() => {
  const messages = {};

  if (formErrors.value.contentMarkup) {
    messages.contentMarkup = fieldErrorMessage('contentMarkup');
  }

  if (formErrors.value.contentStyles) {
    messages.contentStyles = fieldErrorMessage('contentStyles');
  }

  return messages;
});
/** section:validation **/

/** section:action **/
async function updateMarkup(updated) {
  if (!templateId.value) {
    currentTemplate.value.contentMarkup = updated;
    return;
  }

  const params = Object.assign(
    {},
    currentTemplate.value,
    {
      contentMarkup: updated,
    }
  );

  await dataAccess
    .update(templateType.value, templateId.value, params)
    .then((result) => {
      currentTemplate.value = result;
      flashMessage(`Updated markup successfully!`);
    })
    .catch((error) => {
      console.error(error);
      flashMessage(`Error updating markup!`);
    });
}

async function updateStyles(updated) {
  if (!templateId.value) {
    currentTemplate.value.contentStyles = updated;
    return;
  }

  const params = Object.assign(
    {},
    currentTemplate.value,
    {
      contentStyles: updated,
    }
  );

  await dataAccess
    .update(templateType.value, templateId.value, params)
    .then((result) => {
      currentTemplate.value = result;
      flashMessage(`Updated styles successfully!`);
    })
    .catch((error) => {
      console.error(error);
      flashMessage(`Error updating styles!`);
    });
}

function updateData(updated) {
  sampleData.value = updated;
}

function toggleWarningMessage() {
  warningMessageDialog.value = !warningMessageDialog.value;
}
/** section:action **/

async function createTemplate() {
  const params = {
    name: currentTemplate.value.name,
    contentMarkup: currentTemplate.value.contentMarkup,
    contentStyles: currentTemplate.value.contentStyles,
  };

  await dataAccess
    .create(templateType.value, params)
    .then((result) => {
      currentTemplate.value = result;
      flashMessage(`Template created successfully!`);
    })
    .catch((error) => {
      flashMessage(`Error creating template!`);
      formErrors.value = formatErrorsForDisplay(error);
      console.log(error);
    });
}

onMounted(async() => {
  sampleData.value = initSampleData(templateType.value);
});
</script>

<template>
  <div class="page-container">
    <h2 class="heading">
      {{ heading }}
      <i
        v-if="!templateId"
        class="fa-solid fa-circle-exclamation"
        @click="toggleWarningMessage"
      />
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
      :id="currentTemplate.id"
      :template-type="templateType"
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
