<script setup>
import { onMounted, computed, ref } from 'vue'
import axios from 'axios'

import useConfig from '@/config'
import DataPage from '@/components/DataPage.vue'

import {
  TAlert
} from 'coffeebrew-vue-components'


const config = useConfig()

const errorAlert = ref(false)
const errorContent = ref('')

const tagsUrl = computed(() => {
  return `${config.baseUrl}/api/tags`
})

const tags = ref([])

const fieldsLayout = ref([
  { startTime: 'md', endTime: 'md' },
  { description: 'lg' },
  { content: 'lg' },
  { tags: 'lg' }
])

const dataFields = computed(() => {
  return [
    { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false },
    { key: 'startTime', type: 'date', label: 'Start Time', listable: true, viewable: true, creatable: true, updatable: true },
    { key: 'endTime', type: 'date', label: 'End Time', listable: true, viewable: true, creatable: true, updatable: true },
    { key: 'description', type: 'text', label: 'Description', listable: true, viewable: true, creatable: true, updatable: true },
    { key: 'content', type: 'text', label: 'Content', listable: true, viewable: true, creatable: true, updatable: true },
    { key: 'tags', type: 'multiSelect', label: 'Tags', listable: true, viewable: true, creatable: true, updatable: true, options: tags.value }
  ]
})

function formatTags(value) {
  return value.split(', ')
}

async function loadTags() {
  await axios
    .get(tagsUrl.value)
    .then((res) => {
      tags.value = res.data.data.map(record => {
        return {
          value: record.id,
          label: `${record.category}:${record.name}`
        }
      })
    })
    .catch((err) => {
      errorAlert.value = true
      errorContent.value = JSON.stringify(err)
    })
}

onMounted(async () => {
  await loadTags()
})
</script>

<template>
  <DataPage
    data-type="Work Logs"
    url-base="api/work_logs"
    schemas-url-base="api/schemas/work_logs"
    :form-dialog-full-screen="true"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
  >
    <template #view-col.tags="{ field, value, formattedValue }">
      <div class="data-label">Tags</div>
      <div class="data-value tags">
        <div
          class="tag"
          v-for="tag in formatTags(formattedValue)"
        >
          {{ tag }}
        </div>
      </div>
    </template>
  </DataPage>

  <TAlert
    title="Error"
    :content="errorContent"
    :width="400"
    :height="250"
    v-model="errorAlert"
  />
</template>

<style scoped>
.data-value.tags {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
</style>
