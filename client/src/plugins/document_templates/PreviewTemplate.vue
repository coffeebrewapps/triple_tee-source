<script setup>
/** import:global **/
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
/** import:global **/

/** import:utils **/
import { useDataAccess } from '@/utils/dataAccess';
import { useTemplateUtils } from './utils';
/** import:utils **/

/** import:stores **/
import { useBannerStore } from '@/stores/banner';
/** import:stores **/

/** import:components **/
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
const { flashMessage } = useBannerStore();
const { initSampleData } = useTemplateUtils();
/** section:utils **/

/** section:global **/
const currentRoute = Object.assign({}, router.currentRoute.value);

const templateId = computed(() => {
  return currentRoute.params.id;
});

const templateType = computed(() => {
  return currentRoute.params.templateType;
});

const sampleData = ref({});
const currentTemplate = ref();

const heading = computed(() => {
  if (!currentTemplate.value) { return ``; }

  if (templateType.value === 'invoice_templates') {
    return `Invoice Template: ${currentTemplate.value.name}`;
  } else {
    return `Receipt Template: ${currentTemplate.value.name}`;
  }
});
/** section:global **/

/** section:action **/
async function updateMarkup(updated) {
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
      flashMessage(`Error updating styles !`);
    });
}

function updateData(updated) {
  sampleData.value[templateType.value] = updated;
}
/** section:action **/

async function loadTemplate() {
  await dataAccess
    .view(templateType.value, templateId.value, {})
    .then((result) => {
      currentTemplate.value = result;
    })
    .catch((error) => {
      flashMessage(`Error loading template!`);
      console.log(error);
    });
}

onMounted(async() => {
  sampleData.value = initSampleData(templateType.value);

  await loadTemplate();
});
</script>

<template>
  <div class="page-container">
    <h2 class="heading">
      {{ heading }}
    </h2>

    <TemplateEditor
      v-if="currentTemplate"
      :id="currentTemplate.id"
      :template-type="templateType"
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
