<script setup>
/*** import:global ***/
import { ref, computed, watch, onMounted } from 'vue'
/*** import:global ***/

/*** import:config ***/
import useConfig from '@/config'
const config = useConfig()
/*** import:config ***/

/*** import:utils ***/
import { useDataAccess } from '@/utils/dataAccess'
const dataAccess = useDataAccess()
/*** import:utils ***/

/*** import:components ***/
import {
  TAlert,
  TTextarea,
  TSelect,
  TButton
} from 'coffeebrew-vue-components'
/*** import:components ***/

/*** section:global ***/
const modelClass = ref()

watch(modelClass, async (newVal, oldVal) => {
  await fetchData()
})

const dataLoading = ref(true)
const dataLabel = computed(() => {
  const dataLength = Object.keys(rawData.value).length;
  return `Data (Total: ${dataLength})`
})
const rawData = ref([])
const dataForUpdate = ref('')

const errorContent = ref('')
const errorAlert = ref(false)

const schemas = [
  { value: 'indexes', label: 'Indexes' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'countries', label: 'Countries' },
  { value: 'currencies', label: 'Currencies' },
  { value: 'tags', label: 'Tags' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'work_logs', label: 'Work Logs' }
]

const indexesUrl = computed(() => {
  return `${config.baseUrl}/api/indexes`
})

const downloadUrl = computed(() => {
  return `${config.baseUrl}/api/schemas/${modelClass.value}/download`
})

const uploadUrl = computed(() => {
  return `${config.baseUrl}/api/schemas/${modelClass.value}/upload`
})

const dataFields = [
  { key: 'content', type: 'text', label: 'Content' }
]

async function fetchData() {
  rawData.value = []

  if (!modelClass.value) { return; }

  if (modelClass.value === 'indexes') {
    await dataAccess
      .download(indexesUrl.value)
      .then((result) => {
        rawData.value = result.data
        dataForUpdate.value = JSON.stringify(rawData.value, false, 4)
        dataLoading.value = false
      })
      .catch((error) => {
        errorAlert.value = true
        errorContent.value = JSON.stringify(error, false, 4)
      })
  } else {
    await dataAccess
      .download(downloadUrl.value)
      .then((result) => {
        rawData.value = result.data
        dataForUpdate.value = JSON.stringify(rawData.value, false, 4)
        dataLoading.value = false
      })
      .catch((error) => {
        errorAlert.value = true
        errorContent.value = JSON.stringify(error, false, 4)
      })
  }
}

async function submitData() {
  if (modelClass.value === 'indexes') {
    await dataAccess
      .update(indexesUrl.value, JSON.parse(dataForUpdate.value))
      .then((result) => {
        rawData.value = result.data
        dataForUpdate.value = JSON.stringify(rawData.value, false, 4)
        dataLoading.value = false
      })
      .catch((error) => {
        errorAlert.value = true
        errorContent.value = JSON.stringify(error, false, 4)
      })
  } else {
    await dataAccess
      .update(uploadUrl.value, JSON.parse(dataForUpdate.value))
      .then((result) => {
        rawData.value = result.data
        dataForUpdate.value = JSON.stringify(rawData.value, false, 4)
        dataLoading.value = false
      })
      .catch((error) => {
        errorAlert.value = true
        errorContent.value = JSON.stringify(error, false, 4)
      })
  }
}
/*** section:global ***/

onMounted(async () => {
})
</script>

<template>
  <div class="page-container">
    <h2 class="heading">Data Admin</h2>

    <TSelect
      v-model="modelClass"
      label="Model Class"
      name="model-class"
      :options="schemas"
      size="md"
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
      width="800"
      height="500"
    />

    <TButton button-type="text" value="Update" icon="fa-solid fa-check" @click="submitData"/>
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
