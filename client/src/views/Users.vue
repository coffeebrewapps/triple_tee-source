<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

import {
  TTable,
  TAlert,
  TConfirmDialog,
  TDialog,
  TInput,
  TButton
} from 'coffeebrew-vue-components'

const headers = ref([
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' }
])

const actions = ref([
  {
    name: 'View',
    icon: 'fa-solid fa-magnifying-glass',
    click: async function(row, index) {
      await openViewDialog(row.id)
    }
  },
  {
    name: 'Edit',
    icon: 'fa-solid fa-pen-to-square',
    click: async function(row, index) {
      await openEditDialog(row.id)
    }
  },
  {
    name: 'Delete',
    icon: 'fa-solid fa-trash-can',
    click: async function(row, index) {
      await openRemoveDialog(row.id)
    }
  }
])

const users = ref([])
const totalData = ref(0)

const offset = ref(0)
const limit = ref(5)
const dataLoading = ref(false)
const errorAlert = ref(false)
const errorContent = ref('')

const viewDialog = ref(false)
const currentRow = ref()

const editDialog = ref(false)
const currentRowForEdit = ref({
  name: null,
  email: null,
  division: null
})

const removeDialog = ref(false)
const currentRowForRemove = ref({
  name: null,
  email: null,
  division: null
})

const computedViewDialogTitle = computed(() => {
  if (currentRow.value) {
    return `User ${currentRow.value.id}`
  } else {
    return ``
  }
})

const computedEditDialogTitle = computed(() => {
  if (currentRowForEdit.value) {
    return `User ${currentRowForEdit.value.id}`
  } else {
    return ``
  }
})

const computedRemoveDialogTitle = computed(() => {
  if (currentRowForRemove.value) {
    return `User ${currentRowForRemove.value.id}`
  } else {
    return ``
  }
})

const computedRemoveDialogPrimaryText = computed(() => {
  if (currentRowForRemove.value) {
    return `Are you sure you want to remove User ${currentRowForRemove.value.id}?`
  } else {
    return ``
  }
})

const computedRemoveDialogSecondaryText = computed(() => {
  if (currentRowForRemove.value) {
    return `${JSON.stringify(currentRowForRemove.value)}`
  } else {
    return ``
  }
})

const env = import.meta.env
const url = ref('url')

if (env.MODE === 'development') {
  url.value = `http://localhost:${env.VITE_SERVER_PORT}/api/users`
} else {
  url.value = `/api/users`
}

async function openViewDialog(id) {
  await viewData(id)
          .then((result) => {
            currentRow.value = result.record
            viewDialog.value = true
          })
          .catch((error) => {
            currentRow.value = null
            errorAlert.value = true
            errorContent.value = JSON.stringify(result.error)
          })
}

async function openEditDialog(id) {
  await viewData(id)
          .then((result) => {
            currentRowForEdit.value = result.record
            editDialog.value = true
          })
          .catch((error) => {
            resetCurrentRowForEdit()
            errorAlert.value = true
            errorContent.value = JSON.stringify(result.error)
          })
}

async function editDataAndCloseDialog() {
  const params = currentRowForEdit.value
  const id = params.id

  await editData(id, params)
          .then((result) => {
            loadData()
          })
          .catch((error) => {
            errorAlert.value = true
            errorContent.value = JSON.stringify(error)
          })
          .finally(() => {
            closeEditDialog()
          })
}

function closeEditDialog() {
  editDialog.value = false
  resetCurrentRowForEdit()
}

function resetCurrentRowForEdit() {
  currentRowForEdit.value = {
    name: null,
    email: null,
    division: null
  }
}

async function openRemoveDialog(id) {
  await viewData(id)
          .then((result) => {
            currentRowForRemove.value = result.record
            removeDialog.value = true
          })
          .catch((error) => {
            resetCurrentRowForRemove()
            errorAlert.value = true
            errorContent.value = JSON.stringify(result.error)
          })
}

async function removeDataAndCloseDialog() {
  const params = currentRowForRemove.value
  const id = params.id

  await removeData(id, params)
          .then((result) => {
            loadData()
          })
          .catch((error) => {
            errorAlert.value = true
            errorContent.value = JSON.stringify(error)
          })
          .finally(() => {
            closeRemoveDialog()
          })
}

function closeRemoveDialog() {
  removeDialog.value = false
  resetCurrentRowForRemove()
}

function resetCurrentRowForRemove() {
  currentRowForRemove.value = {
    name: null,
    email: null,
    division: null
  }
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
      errorContent.value = JSON.stringify(err)
    })
}

async function viewData(id) {
  return new Promise((resolve, reject) => {
    axios
      .get(`${url.value}/${id}`)
      .then((res) => {
        resolve({ success: true, record: res.data.record })
      })
      .catch((err) => {
        reject({ success: false, error: err })
      })
  })
}

async function editData(id, params) {
  return new Promise((resolve, reject) => {
    axios
      .put(`${url.value}/${id}`, params)
      .then((res) => {
        if (res.data.record) {
          resolve({ success: true, record: res.data.record })
        } else {
          reject({ success: false, error: `Edit failure` })
        }
      })
      .catch((err) => {
        reject({ success: false, error: err })
      })
  })
}

async function removeData(id, params) {
  return new Promise((resolve, reject) => {
    axios
      .delete(`${url.value}/${id}`)
      .then((res) => {
        if (res.data.success) {
          resolve({ success: true })
        } else {
          reject({ success: false, error: `Remove failure` })
        }
      })
      .catch((err) => {
        reject({ success: false, error: err })
      })
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
    :actions="actions"
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

  <TDialog
    v-model="viewDialog"
    :title="computedViewDialogTitle"
  >
    <template #body>
      <div class="data-row">
        <div
          class="data-col"
          v-for="col in currentRow"
        >
          {{ col }}
        </div>
      </div>
    </template>
  </TDialog>

  <TDialog
    v-model="editDialog"
    :title="computedEditDialogTitle"
  >
    <template #body>
      <div class="data-row">
        <TInput v-model="currentRowForEdit.name" type="text" label="Name"/>
        <TInput v-model="currentRowForEdit.email" type="text" label="Email"/>
        <TInput v-model="currentRowForEdit.division" type="text" label="Division"/>
      </div>
    </template>

    <template #actions>
      <TButton class="confirm-button" button-type="text" value="Confirm" icon="fa-solid fa-check" @click="editDataAndCloseDialog()"/>
      <TButton button-type="text" value="Cancel" icon="fa-solid fa-xmark" @click="closeEditDialog()"/>
    </template>
  </TDialog>

  <TConfirmDialog
    v-model="removeDialog"
    :title="computedRemoveDialogTitle"
    :primary-text="computedRemoveDialogPrimaryText"
    :secondary-text="computedRemoveDialogSecondaryText"
    :width="500"
    :height="300"
    @confirm="removeDataAndCloseDialog"
    @cancel="closeRemoveDialog"
  >
  </TConfirmDialog>
</template>
