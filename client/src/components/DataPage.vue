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

const props = defineProps({
  dataType: {
    type: String,
    default: ''
  },
  updatableSchema: {
    type: Array,
    default: []
  },
  urlBase: {
    type: String,
    default: ''
  },
  headers: {
    type: Array,
    default: []
  },
  viewDialogTitle: {
    type: Function,
    default: function(row) {
      return `View ${row.id}`
    }
  },
  updateDialogTitle: {
    type: Function,
    default: function(row) {
      if (!row) { return `` }
      return `Update ${row.id}`
    }
  },
  deleteDialogTitle: {
    type: Function,
    default: function(row) {
      if (!row) { return `` }
      return `Delete ${row.id}`
    }
  },
  deleteDialogPrimaryText: {
    type: Function,
    default: function(row) {
      if (!row) { return `` }
      return `Are you sure you want to delete ${row.id}?`
    }
  },
  deleteDialogSecondaryText: {
    type: Function,
    default: function(row) {
      if (!row) { return `` }
      return JSON.stringify(row)
    }
  }
})

const actions = ref([
  {
    name: 'View',
    icon: 'fa-solid fa-magnifying-glass',
    click: async function(row, index) {
      await openViewDialog(row.id)
    }
  },
  {
    name: 'Update',
    icon: 'fa-solid fa-pen-to-square',
    click: async function(row, index) {
      await openUpdateDialog(row.id)
    }
  },
  {
    name: 'Delete',
    icon: 'fa-solid fa-trash-can',
    click: async function(row, index) {
      await openDeleteDialog(row.id)
    }
  }
])

const updatableKeys = computed(() => {
  return props.updatableSchema.map(h => h.key)
})

const data = ref([])
const totalData = ref(0)

const offset = ref(0)
const limit = ref(5)

const dataLoading = ref(false)
const errorAlert = ref(false)
const errorContent = ref('')

const viewDialog = ref(false)
const currentRow = ref()

const updateDialog = ref(false)
const currentRowForUpdate = ref()

const deleteDialog = ref(false)
const currentRowForDelete = ref()

const env = import.meta.env
const url = ref('url')

if (env.MODE === 'development') {
  url.value = `http://localhost:${env.VITE_SERVER_PORT}/${props.urlBase}`
} else {
  url.value = props.urlBase
}

function inputType(field) {
  return props.updatableSchema.find(h => h.key === field).type
}

function inputLabel(field) {
  return props.updatableSchema.find(h => h.key === field).label
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

async function openUpdateDialog(id) {
  await viewData(id)
          .then((result) => {
            currentRowForUpdate.value = result.record
            updateDialog.value = true
          })
          .catch((error) => {
            resetCurrentRowForUpdate()
            errorAlert.value = true
            errorContent.value = JSON.stringify(result.error)
          })
}

async function updateDataAndCloseDialog() {
  const params = currentRowForUpdate.value
  const id = params.id

  await updateData(id, params)
          .then((result) => {
            loadData()
          })
          .catch((error) => {
            errorAlert.value = true
            errorContent.value = JSON.stringify(error)
          })
          .finally(() => {
            closeUpdateDialog()
          })
}

function closeUpdateDialog() {
  updateDialog.value = false
  resetCurrentRowForUpdate()
}

function resetCurrentRowForUpdate() {
  currentRowForUpdate.value = null
}

async function openDeleteDialog(id) {
  await viewData(id)
          .then((result) => {
            currentRowForDelete.value = result.record
            deleteDialog.value = true
          })
          .catch((error) => {
            resetCurrentRowForDelete()
            errorAlert.value = true
            errorContent.value = JSON.stringify(result.error)
          })
}

async function deleteDataAndCloseDialog() {
  const params = currentRowForDelete.value
  const id = params.id

  await deleteData(id, params)
          .then((result) => {
            loadData()
          })
          .catch((error) => {
            errorAlert.value = true
            errorContent.value = JSON.stringify(error)
          })
          .finally(() => {
            closeDeleteDialog()
          })
}

function closeDeleteDialog() {
  deleteDialog.value = false
  resetCurrentRowForDelete()
}

function resetCurrentRowForDelete() {
  currentRowForDelete.value = null
}

async function updateOffsetAndReload(updated) {
  offset.value = updated
  await loadData()
}

async function loadData() {
  await axios
    .get(url.value, { params: { offset: offset.value, limit: limit.value } })
    .then((res) => {
      data.value = res.data.data
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

async function updateData(id, params) {
  return new Promise((resolve, reject) => {
    axios
      .put(`${url.value}/${id}`, params)
      .then((res) => {
        if (res.data.record) {
          resolve({ success: true, record: res.data.record })
        } else {
          reject({ success: false, error: `Update failure` })
        }
      })
      .catch((err) => {
        reject({ success: false, error: err })
      })
  })
}

async function deleteData(id, params) {
  return new Promise((resolve, reject) => {
    axios
      .delete(`${url.value}/${id}`)
      .then((res) => {
        if (res.data.success) {
          resolve({ success: true })
        } else {
          reject({ success: false, error: `Delete failure` })
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
  <h2>{{ dataType }}</h2>

  <TTable
    :name="dataType"
    :headers="headers"
    :data="data"
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
    :title="viewDialogTitle(currentRow)"
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
    v-if="currentRowForUpdate"
    v-model="updateDialog"
    :title="updateDialogTitle(currentRowForUpdate)"
  >
    <template #body>
      <div class="data-row">
        <TInput
          v-for="field in updatableKeys"
          v-model="currentRowForUpdate[field]"
          :type="inputType(field)"
          :label="inputLabel(field)"
        />
      </div>
    </template>

    <template #actions>
      <TButton class="confirm-button" button-type="text" value="Confirm" icon="fa-solid fa-check" @click="updateDataAndCloseDialog()"/>
      <TButton button-type="text" value="Cancel" icon="fa-solid fa-xmark" @click="closeUpdateDialog()"/>
    </template>
  </TDialog>

  <TConfirmDialog
    v-if="currentRowForDelete"
    v-model="deleteDialog"
    :title="deleteDialogTitle(currentRowForDelete)"
    :primary-text="deleteDialogPrimaryText(currentRowForDelete)"
    :secondary-text="deleteDialogSecondaryText(currentRowForDelete)"
    :width="500"
    :height="300"
    @confirm="deleteDataAndCloseDialog"
    @cancel="closeDeleteDialog"
  >
  </TConfirmDialog>
</template>
