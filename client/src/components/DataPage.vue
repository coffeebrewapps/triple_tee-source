<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

import useConfig from '../config'

import {
  TTable,
  TAlert,
  TConfirmDialog,
  TDialog,
  TDatePicker,
  TInput,
  TSelect,
  TButton
} from 'coffeebrew-vue-components'

const config = useConfig()

const props = defineProps({
  dataType: {
    type: String,
    default: ''
  },
  urlBase: {
    type: String,
    default: ''
  },
  schemasUrlBase: {
    type: String,
    default: ''
  },
  dataFields: {
    type: Array,
    default: []
  },
  createDialogTitle: {
    type: Function,
    default: function(dataType) {
      return `Create ${dataType}`
    }
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

const tableActions = ref([
  {
    name: 'Create',
    icon: 'fa-solid fa-circle-plus fa-xl',
    click: async function(data) {
      await openCreateDialog()
    }
  },
  {
    name: 'Export',
    icon: 'fa-solid fa-file-export',
    click: async function(data) {
      await openDownloadDialog()
    }
  }
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

const schemas = ref({})

const data = ref([])
const totalData = ref(0)

const offset = ref(0)
const limit = ref(5)

const dataLoading = ref(false)
const errorAlert = ref(false)
const errorContent = ref('')

const errorAlertFitContent = computed(() => {
  if (!!errorContent.value && errorContent.value.length > 0) {
    return (errorContent.value.match(/.{1,100}/g) ?? []).join('\n')
  } else {
    return ``
  }
})

const errorAlertSize = computed(() => {
  if (!!errorContent.value && errorContent.value.length > 100) {
    const lines = Math.ceil(errorContent.value.length / 100) * 50
    return {
      width: 800,
      height: lines
    }
  } else {
    return {
      width: 400,
      height: 200
    }
  }
})

const listedHeaders = computed(() => {
  return props.dataFields.filter(h => h.listable)
})

const listedData = computed(() => {
  if (!data.value) { return [] }

  return data.value.map(d => {
    return Object.keys(d).reduce((v, k) => {
      const type = inputType(k)
      if (type === 'select') {
        const options = inputOptions(k)
        const option = options.find(o => o.value === d[k])
        if (!!option) {
          return Object.assign(v, { [k]: option.label })
        } else {
          return Object.assign(v, { [k]: d[k] })
        }
      } else {
        return Object.assign(v, { [k]: d[k] })
      }
    }, {})
  })
})

const createDialog = ref(false)
const newRow = ref()

const viewDialog = ref(false)
const currentRow = ref()

const updateDialog = ref(false)
const currentRowForUpdate = ref()

const deleteDialog = ref(false)
const currentRowForDelete = ref()

const downloadDialog = ref(false)
const downloadLink = ref()
const downloadFile = ref()
const downloadAnchor = ref('downloadAnchor')

const url = computed(() => {
  return `${config.baseUrl}/${props.urlBase}`
})

const schemasUrl = computed(() => {
  return `${config.baseUrl}/${props.schemasUrlBase}`
})

const viewableFields = computed(() => {
  return props.dataFields.filter(h => h.viewable).reduce((o, h) => {
    o[h.key] = h
    return o
  }, {})
})

const updatableFields = computed(() => {
  return props.dataFields.filter(h => h.updatable).reduce((o, h) => {
    o[h.key] = h
    return o
  }, {})
})

const updatableKeys = computed(() => {
  return Object.keys(updatableFields.value)
})

const combinedSchemas = computed(() => {
  if (!!schemas.value) {
    return Object.keys(schemas.value).reduce((o, field) => {
      const prop = props.dataFields.find(f => f.key === field)
      const combined = Object.assign({}, schemas.value[field], prop)
      o[field] = combined
      return o
    }, {})
  } else if (!!updatableFields.value) {
    return updatableFields.value
  } else {
    return {}
  }
})

function inputType(field) {
  return combinedSchemas.value[field].type
}

function inputLabel(field) {
  if (!!viewableFields.value[field]) {
    return viewableFields.value[field].label
  } else {
    return ''
  }
}

function inputValue(field, value) {
  const header = props.dataFields.find(h => h.key === field)
  if (header.type === 'select') {
    return header.options.find(o => o.value === value).label
  } else if (header.type === 'enum') {
    return schemas.value[field].enums[value]
  } else {
    return value
  }
}

function inputOptions(field) {
  if(inputType(field) === 'select') {
    return updatableFields.value[field].options
  } else if (inputType(field) === 'enum') {
    const enums = schemas.value[field].enums
    return Object.keys(enums).map((key) => {
      return { value: key, label: enums[key] }
    })
  } else {
    return []
  }
}

function selectableField(field) {
  return inputType(field) === 'select' || inputType(field) === 'enum'
}

async function openCreateDialog(id) {
  newRow.value = {}
  Object.keys(schemas.value).forEach(k => {
    newRow.value[k] = null
  })
  createDialog.value = true
}

async function createDataAndCloseDialog() {
  const params = newRow.value

  await createData(params)
          .then((result) => {
            loadData()
            openViewDialog(result.record.id)
          })
          .catch((error) => {
            errorAlert.value = true
            errorContent.value = JSON.stringify(error)
          })
          .finally(() => {
            closeCreateDialog()
          })
}

function closeCreateDialog() {
  createDialog.value = false
  resetNewRow()
}

function resetNewRow() {
  newRow.value = null
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
            formatCurrentRowForUpdate(result.record)
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
            openViewDialog(id)
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

function formatCurrentRowForUpdate(record) {
  currentRowForUpdate.value = {}

  Object.keys(record).forEach((key) => {
    if (inputType(key) === 'date' && !!record[key]) {
      currentRowForUpdate.value[key] = new Date(record[key])
    } else {
      currentRowForUpdate.value[key] = record[key]
    }
  })
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

async function openDownloadDialog() {
  await downloadData()
          .then((result) => {
            const url = window.URL.createObjectURL(new Blob([result.data]))
            downloadLink.value = url
            downloadFile.value = result.filename
            downloadDialog.value = true
          })
          .catch((error) => {
            errorAlert.value = true
            errorContent.value = JSON.stringify(result.error)
          })
}

function downloadDataAsFile() {
  downloadAnchor.value.click()
  closeDownloadDialog()
}

function closeDownloadDialog() {
  downloadDialog.value = false
  downloadLink.value = null
  downloadFile.value = null
}

async function updateOffsetAndReload(updated) {
  offset.value = updated
  await loadData()
}

async function loadSchemas() {
  await axios
    .get(schemasUrl.value)
    .then((res) => {
      schemas.value = res.data.fields
    })
    .catch((err) => {
      errorAlert.value = true
      errorContent.value = JSON.stringify(err)
    })
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

async function createData(params) {
  return new Promise((resolve, reject) => {
    axios
      .post(`${url.value}`, params)
      .then((res) => {
        if (res.data.record) {
          resolve({ success: true, record: res.data.record })
        } else {
          reject({ success: false, error: `Create failure` })
        }
      })
      .catch((err) => {
        reject({ success: false, error: err })
      })
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

async function downloadData() {
  return new Promise((resolve, reject) => {
    axios
      .get(`${url.value}/download`)
      .then((res) => {
        resolve({ success: true, filename: res.data.filename, data: res.data.data })
      })
      .catch((err) => {
        reject({ success: false, error: err })
      })
  })
}

onMounted(async () => {
  await loadSchemas()
  await loadData()
})
</script>

<template>
  <h2>{{ dataType }}</h2>

  <TTable
    :name="dataType"
    :headers="listedHeaders"
    :data="listedData"
    :table-actions="tableActions"
    :actions="actions"
    :loading="dataLoading"
    :pagination="{ limit: limit, client: false }"
    :total-data="totalData"
    @offset-change="updateOffsetAndReload"
  />

  <TAlert
    v-if="errorContent.length > 0"
    title="Error"
    class="error-alert"
    :content="errorAlertFitContent"
    :width="errorAlertSize.width"
    :height="errorAlertSize.height"
    v-model="errorAlert"
  />

  <TDialog
    v-if="newRow"
    v-model="createDialog"
    :title="createDialogTitle(dataType)"
  >
    <template #body>
      <div class="data-row">

        <slot
          v-for="field in updatableKeys"
          :name="`create-col.${field}`"
          v-bind="{ field: field, type: inputType(field), label: inputLabel(field) }"
        >
          <TInput
            v-if="inputType(field) === 'text'"
            v-model="newRow[field]"
            :type="inputType(field)"
            :label="inputLabel(field)"
          />

          <TDatePicker
            v-if="inputType(field) === 'date'"
            v-model="newRow[field]"
            :label="inputLabel(field)"
          />

          <TSelect
            v-if="selectableField(field)"
            v-model="newRow[field]"
            :label="inputLabel(field)"
            :name="field"
            :id="field"
            :options="inputOptions(field)"
          />
        </slot>
      </div>
    </template>

    <template #actions>
      <TButton class="confirm-button" button-type="text" value="Confirm" icon="fa-solid fa-check" @click="createDataAndCloseDialog()"/>
      <TButton button-type="text" value="Cancel" icon="fa-solid fa-xmark" @click="closeCreateDialog()"/>
    </template>
  </TDialog>

  <TDialog
    v-if="currentRow"
    v-model="viewDialog"
    :title="viewDialogTitle(currentRow)"
    class="view-dialog"
  >
    <template #body>
      <div class="data-row">
        <slot
          name="view-content"
          v-bind="{ row: currentRow }"
        >
          <div
            class="data-col"
            v-for="field in Object.keys(currentRow)"
          >
            <slot
              :name="`view-col.${field}`"
              v-bind="{ field, value: currentRow[field] }"
            >
              <div class="data-label">{{ inputLabel(field) }}</div>
              <div class="data-value">
                {{ inputValue(field, currentRow[field]) }}
              </div>
            </slot>
          </div>
        </slot>
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
        <slot
          v-for="field in updatableKeys"
          :name="`update-col.${field}`"
          v-bind="{ row: currentRowForUpdate, field: field, type: inputType(field), label: inputLabel(field) }"
        >

          <TInput
            v-if="inputType(field) === 'text'"
            v-model="currentRowForUpdate[field]"
            :type="inputType(field)"
            :label="inputLabel(field)"
          />

          <TDatePicker
            v-if="inputType(field) === 'date'"
            v-model="currentRowForUpdate[field]"
            :label="inputLabel(field)"
          />

          <TSelect
            v-if="selectableField(field)"
            v-model="currentRowForUpdate[field]"
            :label="inputLabel(field)"
            :name="field"
            :id="field"
            :options="inputOptions(field)"
          />
        </slot>
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

  <TDialog
    v-if="downloadLink"
    v-model="downloadDialog"
    title="Download export file"
    :width="400"
    :height="250"
  >
    <template #body>
      {{ downloadFile }}
    </template>

    <template #actions>
      <a class="hidden" ref="downloadAnchor" rel="noreferrer" :download="downloadFile" :href="downloadLink"></a>
      <TButton button-type="text" value="Download" icon="fa-solid fa-file-arrow-down" @click="downloadDataAsFile()"/>
      <TButton button-type="text" value="Cancel" icon="fa-solid fa-xmark" @click="closeDownloadDialog()"/>
    </template>
  </TDialog>
</template>

<style scoped>
a.hidden {
  display: none;
}

.input-control {
  margin: 0 auto;
}

.view-dialog .data-row {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.view-dialog .data-col {
  display: grid;
  grid-template-columns: 1fr 3fr;
  padding: 1rem;
}

.view-dialog .data-label {
  font-weight: 600;
}
</style>
