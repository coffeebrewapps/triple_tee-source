<script setup>
/** import:global **/
import { ref, computed, watch, onMounted } from 'vue';
/** import:global **/

/** import:utils **/
import { useDataAccess } from '@/utils/dataAccess';
/** import:utils **/

/** import:stores **/
import { useBannerStore } from '@/stores/banner';
/** import:stores **/

/** import:components **/
import {
  TAlert,
  TTextarea,
  TSelect,
  TButton
} from 'coffeebrew-vue-components';
/** import:components **/

/** section:global **/
const dataAccess = useDataAccess();
const banner = useBannerStore();

const modelClass = ref();

watch(modelClass, async(newVal, oldVal) => {
  await fetchData();
});

const dataLoading = ref(true);
const dataLabel = computed(() => {
  const dataLength = Object.keys(rawData.value).length;
  return `Data (Total: ${dataLength})`;
});
const rawData = ref([]);
const dataForUpdate = ref('');

const errorContent = ref('');
const errorAlert = ref(false);

const schemas = [
  { value: 'indexes', label: 'Indexes' },
];

const modelSchemas = ref([]);

const selectOptions = computed(() => {
  return schemas.concat(modelSchemas.value);
});

async function fetchSchemas() {
  await dataAccess
    .schemas()
    .then((result) => {
      modelSchemas.value = result.map((schema) => {
        return { value: schema, label: schema };
      });
      showBanner(`Loaded model class options successfully!`);
    })
    .catch((error) => {
      errorAlert.value = true;
      errorContent.value = JSON.stringify(error, false, 4);
      showBanner(`Error loading model class options!`);
    });
}

async function fetchData() {
  rawData.value = [];

  if (!modelClass.value) { return; }

  dataLoading.value = true;
  await dataAccess
    .list(modelClass.value)
    .then((result) => {
      rawData.value = result.data;
      dataForUpdate.value = JSON.stringify(rawData.value, false, 4);
      showBanner(`Fetched ${modelClass.value} successfully!`);
    })
    .catch((error) => {
      errorAlert.value = true;
      errorContent.value = JSON.stringify(error, false, 4);
      showBanner(`Error fetching ${modelClass.value} data!`);
    })
    .finally(() => {
      dataLoading.value = false;
    });
}

function formatModelData(data) {
  return JSON.parse(data).reduce((o, record) => {
    const toUpdate = Object.assign({}, record);
    delete toUpdate.includes;
    o[record.id] = toUpdate;
    return o;
  }, {});
}

async function submitData() {
  dataLoading.value = true;
  if (modelClass.value === 'indexes') {
    await dataAccess
      .upload('indexes', JSON.parse(dataForUpdate.value))
      .then((result) => {
        rawData.value = result.data;
        dataForUpdate.value = JSON.stringify(rawData.value, false, 4);
        showBanner(`Updated indexes successfully!`);
      })
      .catch((error) => {
        errorAlert.value = true;
        errorContent.value = JSON.stringify(error, false, 4);
        showBanner(`Error updating indexes!`);
      })
      .finally(() => {
        dataLoading.value = false;
      });
  } else {
    await dataAccess
      .upload(modelClass.value, formatModelData(dataForUpdate.value))
      .then((result) => {
        showBanner(`Updated ${modelClass.value} data successfully!`);
        fetchData();
      })
      .catch((error) => {
        errorAlert.value = true;
        errorContent.value = JSON.stringify(error, false, 4);
        showBanner(`Error updating ${modelClass.value} data!`);
      })
      .finally(() => {
        dataLoading.value = false;
      });
  }
}
/** section:global **/

/** section:banner **/
function showBanner(message) {
  banner.show(message);
  setTimeout(hideBanner, 5000);
}

function hideBanner() {
  banner.hide();
}
/** section:banner **/

onMounted(async() => {
  await fetchSchemas();
});
</script>

<template>
  <div class="page-container">
    <h2 class="heading">
      Data Admin
    </h2>

    <TSelect
      v-model="modelClass"
      label="Model Class"
      name="model-class"
      :options="selectOptions"
      size="lg"
    />

    <TTextarea
      v-model="dataForUpdate"
      :label="dataLabel"
      :rows="30"
      :cols="150"
      :disabled="dataLoading"
    />

    <TAlert
      v-if="errorContent.length > 0"
      v-model="errorAlert"
      title="Error"
      class="error-alert"
      :content="errorContent"
      :width="800"
      :height="500"
    />

    <TButton
      button-type="text"
      value="Update"
      icon="fa-solid fa-check"
      @click="submitData"
    />
  </div>
</template>

<style scoped>
.page-container {
  margin: 1rem 0;
}

.heading {
  font-weight: 900;
}
</style>
