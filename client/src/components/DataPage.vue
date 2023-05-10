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

import FormDialog from './FormDialog.vue'

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
  fieldsLayout: {
    type: Array,
    default: []
  },
  formDialogFullScreen: {
    type: Boolean,
    default: false
  },
  createDialogTitle: {
    type: Function,
    default: function(dataType) {
      return `Create ${dataType}`
    }
  },
  viewDialogTitle: {
    type: Function,
    default: function(dataType, row) {
      return `View ${dataType} ${row.id}`
    }
  },
  updateDialogTitle: {
    type: Function,
    default: function(dataType, row) {
      if (!row) { return `` }
      return `Update ${dataType} ${row.id}`
    }
  },
  deleteDialogTitle: {
    type: Function,
    default: function(dataType, row) {
      if (!row) { return `` }
      return `Delete ${dataType} ${row.id}`
    }
  },
  deleteDialogPrimaryText: {
    type: Function,
    default: function(dataType, row) {
      if (!row) { return `` }
      return `Are you sure you want to delete ${dataType} ${row.id}?`
    }
  },
  deleteDialogSecondaryText: {
    type: Function,
    default: function(dataType, row) {
      if (!row) { return `` }
      return JSON.stringify(row, false, 2)
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

const inputOptionsData = ref({})

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
  return data.value || []
})

const include = computed(() => {
  return props.dataFields.filter(h => h.reference)
})

const includeKeys = computed(() => {
  return include.value.map(h => h.key)
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

const viewableKeys = computed(() => {
  return Object.keys(viewableFields.value)
})

const creatableFields = computed(() => {
  return props.dataFields.filter(h => h.creatable).reduce((o, h) => {
    o[h.key] = h
    return o
  }, {})
})

const creatableKeys = computed(() => {
  return Object.keys(creatableFields.value)
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
      let enums = {}
      if (!!schemas.value[field].enums) {
        enums = schemas.value[field].enums
      }
      const options = Object.keys(enums).map((e) => {
        return { value: e, label: enums[e] }
      })
      const combined = Object.assign({}, schemas.value[field], { options: options }, prop)
      o[field] = combined
      return o
    }, {})
  } else {
    return props.dataFields.reduce((o, field) => {
      const prop = props.dataFields.find(f => f.key === field)
      o[field] = prop
      return o
    }, {})
  }
})

function inputType(field) {
  return combinedSchemas.value[field].type
}

function inputLabel(field) {
  return combinedSchemas.value[field].label
}

function inputValue(field, record) {
  const referenceField = includeKeys.value.find(v => v === field)
  if (referenceField) {
    const includes = record.includes || {}
    const rawValue = [record[field]].flat().filter(v => !!v)

    return rawValue.map((value) => {
      const foreignValue = includes[field][value]
      return combinedSchemas.value[field].reference.label(foreignValue)
    })
  } else {
    return record[field]
  }
}

function formatTag(record, tag) {
  const includes = (record.includes || {}).tags
  if (includes[tag]) {
    const value = includes[tag] || {}
    return `${value.category}:${value.name}`
  } else {
    return tag
  }
}

function tagStyle(record, tag) {
  const includes = (record.includes || {}).tags
  if (includes[tag]) {
    const color = includes[tag].textColor
    const background = includes[tag].backgroundColor
    const styles = []
    if (color) {
      styles.push(`color: ${color} !important;`)
    }
    if (background) {
      styles.push(`background-color: ${background} !important;`)
    }

    return styles.join('')
  } else {
    return ``
  }
}

function inputOptions(field) {
  if (selectableField(field)) {
    return inputOptionsData.value[field] || formatInputOptionsData(field, 0, 5, { data: [], total: 0 })
  } else {
    return {}
  }
}

function inputableField(field) {
  return inputType(field) === 'text' || inputType(field) === 'number'
}

function selectableField(field) {
  return inputType(field) === 'select' || inputType(field) === 'multiSelect' || inputType(field) === 'enum'
}

async function openCreateDialog(id) {
  newRow.value = creatableKeys.value.reduce((o, key) => {
    o[key] = formatRowField(key, {})
    return o
  }, {})
  createDialog.value = true
}

async function createDataAndCloseDialog(params) {
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
            errorContent.value = JSON.stringify(error)
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
            errorContent.value = JSON.stringify(error)
          })
}

async function updateDataAndCloseDialog(params) {
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

  updatableKeys.value.forEach((key) => {
    currentRowForUpdate.value[key] = formatRowField(key, record)
  })
}

function formatRowField(field, record) {
  if (inputType(field) === 'date' && !!record[field]) {
    return new Date(record[field])
  } else if (inputType(field) === 'multiSelect') {
    return [record[field]].flat().filter(v => !!v)
  } else {
    return record[field]
  }
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
    .get(url.value, { params: { include: includeKeys.value, offset: offset.value, limit: limit.value } })
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
      .get(`${url.value}/${id}`, { params: { include: includeKeys.value } })
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

async function fetchOptions(field, offset) {
  const options = combinedSchemas.value[field].options
  if (options.server) {
    const limit = combinedSchemas.value[field].limit || 5
    return new Promise((resolve, reject) => {
      axios
        .get(options.sourceUrl, { params: { offset, limit } })
        .then((result) => {
          const data = result.data.data
          const total = result.data.total
          const dataFromServer = {
            total,
            data: data.map((row) => {
              return {
                value: options.value(row),
                label: options.label(row)
              }
            })
          }
          resolve(formatInputOptionsData(field, offset, limit, dataFromServer))
        })
    })
  } else {
    return new Promise((resolve, reject) => {
      resolve(Object.assign(
        {},
        {
          data: options,
          total: options.length,
          loading: false,
          pagination: { limit: 5, client: true },
          offsetChange: (offset) => {}
        }
      ))
    })
  }
}

function formatInputOptionsData(field, offset, limit, dataFromServer) {
  return Object.assign(
    {},
    {
      loading: false,
      pagination: { limit: limit, client: false },
      offsetChange: (offset) => { optionsOffsetChange(field, offset) }
    },
    dataFromServer
  )
}

async function optionsOffsetChange(field, newOffset) {
  const limit = combinedSchemas.value[field].limit || 5
  await fetchOptions(field, newOffset)
    .then((result) => {
      inputOptionsData.value[field] = formatInputOptionsData(field, newOffset, limit, result)
    })
}

async function initOptionsData() {
  const fields = Object.keys(combinedSchemas.value).filter(f => selectableField(f))

  await Promise.all(fields.map((field) => {
    const offset = combinedSchemas.value[field].offset || 0
    return fetchOptions(field, offset)
  }))
  .then((values) => {
    values.forEach((value, i) => {
      const field = fields[i]
      inputOptionsData.value[field] = value
    })
  })
  .catch((error) => {
    errorAlert.value = true
    errorContent.value = JSON.stringify(error)
  })
}

onMounted(async () => {
  await loadSchemas()
  await loadData()
  await initOptionsData()
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
  >
    <template #data-content="{ headers, row, i }">
      <td
        v-for="header in headers"
        class="col"
      >
        <slot
          :name="`data-col.${header.key}`"
          v-bind="{ header, row, i }"
        >
          <div
            v-if="header.key !== 'tags'"
          >
            {{ row[header.key] }}
          </div>

          <!-- hardcode format for tags because it is standard through the app --->
          <div
            v-if="header.key === 'tags'"
            v-for="tag in row.tags"
            class="tag"
            :style="tagStyle(row, tag)"
          >
            {{ formatTag(row, tag) }}
          </div>
        </slot>
      </td>
    </template>
  </TTable>

  <TAlert
    v-if="errorContent.length > 0"
    title="Error"
    class="error-alert"
    :content="errorAlertFitContent"
    :width="errorAlertSize.width"
    :height="errorAlertSize.height"
    v-model="errorAlert"
  />

  <FormDialog
    v-if="newRow"
    v-model="createDialog"
    :schemas="combinedSchemas"
    :fields-layout="fieldsLayout"
    :data-fields="creatableKeys"
    :data="newRow"
    :dialog-title="createDialogTitle(dataType)"
    :full-screen="formDialogFullScreen"
    @submit="createDataAndCloseDialog"
  />

  <FormDialog
    v-if="currentRowForUpdate"
    v-model="updateDialog"
    :schemas="combinedSchemas"
    :fields-layout="fieldsLayout"
    :data-fields="updatableKeys"
    :data="currentRowForUpdate"
    :dialog-title="updateDialogTitle(dataType, currentRowForUpdate)"
    :full-screen="formDialogFullScreen"
    @submit="updateDataAndCloseDialog"
  />

  <TDialog
    v-if="currentRow"
    v-model="viewDialog"
    :title="viewDialogTitle(dataType, currentRow)"
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
            v-for="field in viewableKeys"
          >
            <slot
              :name="`view-col.${field}`"
              v-bind="{ field, value: currentRow[field], formattedValue: inputValue(field, currentRow) }"
            >
              <div class="data-label">{{ inputLabel(field) }}</div>
              <div
                v-if="field !== 'tags'"
                class="data-value"
              >
                {{ inputValue(field, currentRow) }}
              </div>

              <!-- hardcode format for tags because it is standard through the app --->
              <div class="data-value">
                <div
                  v-if="field === 'tags'"
                  v-for="tag in currentRow.tags"
                  class="tag"
                  :style="tagStyle(currentRow, tag)"
                >
                  {{ formatTag(currentRow, tag) }}
                </div>
              </div>
            </slot>
          </div>
        </slot>
      </div>
    </template>
  </TDialog>

  <TConfirmDialog
    v-if="currentRowForDelete"
    v-model="deleteDialog"
    :title="deleteDialogTitle(dataType, currentRowForDelete)"
    :primary-text="deleteDialogPrimaryText(dataType, currentRowForDelete)"
    :secondary-text="deleteDialogSecondaryText(dataType, currentRowForDelete)"
    :width="500"
    :height="350"
    @confirm="deleteDataAndCloseDialog"
    @cancel="closeDeleteDialog"
    class="delete-dialog"
  />

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
  overflow-y: scroll;
}

.view-dialog .data-col {
  display: grid;
  grid-template-columns: 1fr 3fr;
  padding: 1rem;
}

.view-dialog .data-label {
  font-weight: 600;
}

.delete-dialog .container .body {
  overflow: scroll !important;
}

td.col {
  text-align: left;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
}
</style>
