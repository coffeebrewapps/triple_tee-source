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

const divisionsUrl = computed(() => {
  return `${config.baseUrl}/api/divisions`
})

const divisions = ref([])

const dataFields = computed(() => {
  return [
    { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, updatable: false },
    { key: 'name', type: 'text', label: 'Name', listable: true, viewable: true, updatable: true },
    { key: 'email', type: 'text', label: 'Email', listable: true, viewable: true, updatable: true },
    { key: 'division', type: 'select', label: 'Division', listable: false, viewable: true, updatable: true, options: divisions.value },
    { key: 'joinDate', type: 'date', label: 'Join Date', listable: false, viewable: true, updatable: true },
    { key: 'phone', type: 'text', label: 'Phone', listable: false, viewable: true, updatable: true }
  ]
})

function viewDialogTitle(dataType, row) {
  if (row) {
    return `${dataType} ${row.id}`
  } else {
    return ``
  }
}

function updateDialogTitle(dataType, row)  {
  if (row) {
    return `${dataType} ${row.id}`
  } else {
    return ``
  }
}

function deleteDialogTitle(dataType, row) {
  if (row) {
    return `${dataType} ${row.id}`
  } else {
    return ``
  }
}

function divisionValue(value) {
  if (divisions.value.length > 0) {
    return divisions.value.find(d => d.value === value).label
  } else {
    return ''
  }
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
    :data-fields="dataFields"
    :view-dialog-title="viewDialogTitle"
    :update-dialog-title="updateDialogTitle"
    :delete-dialog-title="deleteDialogTitle"
  />

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
