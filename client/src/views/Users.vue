<script setup>
import { onMounted, computed, ref } from 'vue'
import axios from 'axios'

import useConfig from '../config'
import DataPage from '../components/DataPage.vue'

import {
  TAlert,
  TSelect,
  TDatePicker
} from 'coffeebrew-vue-components'

const config = useConfig()

const errorAlert = ref(false)
const errorContent = ref('')

const divisionsUrl = computed(() => {
  return `${config.baseUrl}/api/divisions`
})

const divisions = ref([])

const headers = ref([
  { key: 'id', type: 'number', label: 'ID' },
  { key: 'name', type: 'text', label: 'Name' },
  { key: 'email', type: 'text', label: 'Email' }
])

const updatableFields = ref({
  name: 'Name',
  email: 'Email',
  division: 'Division',
  joinDate: 'Join Date',
  phone: 'Phone'
})

function viewDialogTitle(row) {
  if (row) {
    return `User ${row.id}`
  } else {
    return ``
  }
}

function updateDialogTitle(row)  {
  if (row) {
    return `User ${row.id}`
  } else {
    return ``
  }
}

function deleteDialogTitle(row) {
  if (row) {
    return `User ${row.id}`
  } else {
    return ``
  }
}

function divisionValue(value) {
  return divisions.value.find(d => d.value === value).label
}

async function loadDivisions() {
  await axios
    .get(divisionsUrl.value)
    .then((res) => {
      divisions.value = res.data.data.map(record => {
        return {
          value: record.id,
          label: record.name
        }
      })
    })
    .catch((err) => {
      errorAlert.value = true
      errorContent.value = JSON.stringify(err)
    })
}

onMounted(async () => {
  await loadDivisions()
})
</script>

<template>
  <DataPage
    data-type="User"
    url-base="api/users"
    schemas-url-base="api/schemas/users"
    :headers="headers"
    :updatable-fields="updatableFields"
    :view-dialog-title="viewDialogTitle"
    :update-dialog-title="updateDialogTitle"
    :delete-dialog-title="deleteDialogTitle"
  >

    <template #view-col.division="{ key, value }">
      {{ key }} : {{ divisionValue(value) }}
    </template>

    <template #update-col.division="{ row, field, type, label }">
      <TSelect v-model="row[field]" :label="label" :name="field" :id="field" :options="divisions"/>
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
#division,
#joinDate {
  margin: 0 auto;
}
</style>
