<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'

import { TTable, TAlert } from 'coffeebrew-vue-components'

const headers = ref([
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' }
])

const users = ref([])
const totalData = ref(0)

const offset = ref(0)
const limit = ref(5)
const dataLoading = ref(false)
const errorAlert = ref(false)
const errorContent = ref('')

const env = import.meta.env
const url = ref('url')

if (env.MODE === 'development') {
  url.value = `http://localhost:${env.VITE_SERVER_PORT}/api/users`
} else {
  url.value = `/api/users`
}

async function updateOffsetAndReload(updated) {
  offset.value = updated
  await loadData()
}

async function loadData() {
  await axios
    .get(url.value, { params: { offset: offset.value, limit: limit.value } })
    .then((res) => {
      users.value = res.data.data
      totalData.value = res.data.total
      dataLoading.value = false
    })
    .catch((err) => {
      dataLoading.value = false
      errorAlert.value = true
      errorContent.value = err
    })
}

onMounted(async () => {
  await loadData()
})
</script>

<template>
  <h2>Users</h2>

  <TTable
    name="Users"
    :headers="headers"
    :data="users"
    :loading="dataLoading"
    :pagination="{ limit: limit, client: false }"
    :total-data="totalData"
    @offset-change="updateOffsetAndReload"
  />

  <TAlert
    title="Error"
    :content="errorContent"
    :width="400"
    :height="250"
    v-model="errorAlert"
  />
</template>
