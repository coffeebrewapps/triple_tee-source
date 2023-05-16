<script setup>
import { ref, computed, watch, onMounted } from 'vue'

import useConfig from '../config'
import { useInputHelper } from '../utils/input'
import { useFormatter } from '../utils/formatter'
import { useErrors } from '../utils/errors'
import { useDataAccess } from '../utils/dataAccess'

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
import ViewDialog from './ViewDialog.vue'

import { useBannerStore } from '../stores/banner'

const banner = useBannerStore()

function showBanner(message) {
  banner.show(message)
  setTimeout(hideBanner, 5000)
}

function hideBanner() {
  banner.hide()
}

const config = useConfig()

const {
  schemasMap,
  multiSelectableFields,
  singleSelectableFields,
  inputType,
  inputLabel,
  multiSelectableField,
  singleSelectableField,
  selectableField,
  formatInputOptionsData,
  fetchOptions,
  initOptionsData
} = useInputHelper(props.dataFields)

const {
  formatDate,
  formatTimestamp,
  formatTag,
  tagStyle
} = useFormatter()

const errorsMap = useErrors()

const dataAccess = useDataAccess()

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
      height: lines <= 100 ? 200 : lines
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
const createErrors = ref({})

watch(createDialog, (newVal, oldVal) => {
  if (!newVal) { createErrors.value = {} }
})

const viewDialog = ref(false)
const currentRow = ref()

const updateDialog = ref(false)
const currentRowForUpdate = ref()
const updateErrors = ref({})

watch(updateDialog, (newVal, oldVal) => {
  if (!newVal) { updateErrors.value = {} }
})

const deleteDialog = ref(false)
const currentRowForDelete = ref()
const deleteErrors = ref({})

watch(deleteDialog, (newVal, oldVal) => {
  if (!newVal) { deleteErrors.value = {} }
})

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

function inputValue(field, record) {
  const referenceField = includeKeys.value.find(v => v === field)
  const fieldValue = record[field]
  if (!fieldValue) { return }

  if (referenceField) {
    const includes = record.includes || {}
    const rawValue = [fieldValue].flat().filter(v => !!v)

    const mapped = rawValue.map((value) => {
      const foreignValue = includes[field][value]
      return schemasMap.value[field].reference.label(foreignValue)
    })

    if (multiSelectableField(field)) {
      return mapped
    } else {
      return mapped[0]
    }
  } else if (inputType(field) === 'enum' || inputType(field) === 'select') {
    const found = combinedDataFields.value.find(f => f.key === field)
    const options = found.options
    return options.find(o => o.value === fieldValue).label
  } else if (inputType(field) === 'datetime') {
    return formatTimestamp(fieldValue)
  } else if (inputType(field) === 'date') {
    return formatDate(fieldValue)
  } else {
    return fieldValue
  }
}

function inputOptions(field) {
  if (selectableField(field)) {
    return inputOptionsData.value[field] || formatInputOptionsData(field, 0, 5, { data: [], total: 0 })
  } else {
    return {}
  }
}

async function loadData() {
  const params = {
    include: includeKeys.value,
    offset: offset.value,
    limit: limit.value
  }

  await dataAccess
    .list(url.value, params)
    .then((result) => {
      data.value = result.data
      totalData.value = result.total
      dataLoading.value = false
    })
    .catch((error) => {
      dataLoading.value = false
      errorAlert.value = true
      errorContent.value = JSON.stringify(error, false, 4)
    })
}

async function viewData(id, resolve, reject) {
  const params = { include: includeKeys.value }

  await dataAccess
    .view(`${url.value}/${id}`, params)
    .then((result) => {
      resolve(result)
    })
    .catch((error) => {
      reject(error)
    })
}

async function openCreateDialog(id) {
  newRow.value = creatableKeys.value.reduce((o, key) => {
    o[key] = formatDataForShow(key, {})
    return o
  }, {})
  createDialog.value = true
}

async function createDataAndCloseDialog(rawParams) {
  const params = formatDataForSave(rawParams)

  await dataAccess
    .create(url.value, params)
    .then((result) => {
      showBanner(`Data created successfully!`)
      loadData()
      closeCreateDialog()
    })
    .catch((error) => {
      createErrors.value = error
      showBanner(`Error creating data!`)
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
  viewData(
    id,
    (record) => {
      currentRow.value = record
      viewDialog.value = true
    },
    (error) => {
      currentRow.value = null
      errorAlert.value = true
      errorContent.value = JSON.stringify(error, false, 4)
    }
  )
}

async function openUpdateDialog(id) {
  viewData(
    id,
    (record) => {
      formatCurrentRowForUpdate(record)
      updateDialog.value = true
    },
    (error) => {
      resetCurrentRowForUpdate()
      errorAlert.value = true
      errorContent.value = JSON.stringify(error, false, 4)
    }
  )
}

async function updateDataAndCloseDialog(rawParams) {
  const id = rawParams.id
  const params = formatDataForSave(rawParams)

  await dataAccess
    .update(`${url.value}/${id}`, params)
    .then((record) => {
      showBanner(`Data updated successfully!`)
      loadData()
      closeUpdateDialog()
    })
    .catch((error) => {
      updateErrors.value = error
      showBanner(`Error updating data!`)
    })
}

function closeUpdateDialog() {
  updateDialog.value = false
  resetCurrentRowForUpdate()
}

function formatCurrentRowForUpdate(record) {
  currentRowForUpdate.value = {}

  props.dataFields.forEach((field) => {
    const key = field.key
    currentRowForUpdate.value[key] = formatDataForShow(key, record)
  })
}

function formatDataForShow(field, record) {
  if ((inputType(field) === 'date' || inputType(field) === 'datetime') && !!record[field]) {
    return new Date(record[field])
  } else if (multiSelectableField(field) && !!record.includes) {
    const includes = record.includes[field]
    const fieldValue = record[field]
    if (!!includes && Object.keys(includes).length > 0) {
      return fieldValue.map((v) => {
        const include = includes[v]
        const options = schemasMap.value[field].options
        const value = options.value(include)
        const label = options.label(include)
        return { value, label }
      })
    } else {
      return record[field]
    }
  } else if (singleSelectableField(field) && !!record.includes) {
    const includes = record.includes[field]
    const fieldValue = record[field]
    if (!!fieldValue && !!includes && Object.keys(includes).length > 0) {
      const include = includes[fieldValue]
      const options = schemasMap.value[field].options
      const value = options.value(include)
      const label = options.label(include)
      return [{ value, label }]
    } else {
      return record[field]
    }
  } else {
    return record[field]
  }
}

function formatDataForSave(params) {
  const data = Object.assign({}, params)

  multiSelectableFields.value.forEach((field) => {
    const values = (data[field] || [])
    data[field] = values.map(v => v.value)
  })

  singleSelectableFields.value.forEach((field) => {
    const values = (data[field] || [])
    data[field] = (values[0] || {}).value
  })

  return data
}

function resetCurrentRowForUpdate() {
  currentRowForUpdate.value = null
}

async function openDeleteDialog(id) {
  viewData(
    id,
    (record) => {
      currentRowForDelete.value = record
      deleteDialog.value = true
    },
    (error) => {
      resetCurrentRowForDelete()
      errorAlert.value = true
      errorContent.value = JSON.stringify(error, false, 4)
    }
  )
}

async function deleteDataAndCloseDialog() {
  const params = currentRowForDelete.value
  const id = params.id

  await dataAccess
    .remove(`${url.value}/${id}`)
    .then((record) => {
      showBanner(`Data deleted successfully!`)
      loadData()
    })
    .catch((error) => {
      errorAlert.value = true
      errorContent.value = error.map(type => errorsMap[type]).join(', ')
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
  await dataAccess
    .download(`${url.value}/download`)
    .then((result) => {
      const url = window.URL.createObjectURL(new Blob([result.data]))
      downloadLink.value = url
      downloadFile.value = result.filename
      downloadDialog.value = true
    })
    .catch((error) => {
      errorAlert.value = true
      errorContent.value = JSON.stringify(result.error, false, 4)
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

const combinedDataFields = ref(props.dataFields)

async function loadSchemas() {
  await dataAccess
    .schemas(schemasUrl.value)
    .then((result) => {
      const fields = result.fields
      combinedDataFields.value = combinedDataFields.value.map((field) => {
        if (field.type === 'enum') {
          const enums = fields[field.key].enums
          const options = Object.keys(enums).map((e) => {
            return { value: e, label: enums[e] }
          })
          const combined = Object.assign({}, field, { options })
          return combined
        } else {
          return field
        }
      })
    })
    .catch((error) => {
      errorAlert.value = true
      errorContent.value = JSON.stringify(error, false, 4)
    })
}

async function optionsOffsetChange(field, newOffset) {
  const limit = schemasMap.value[field].limit || 5
  await fetchOptions(field, newOffset)
    .then((result) => {
      inputOptionsData.value[field] = formatInputOptionsData(field, newOffset, limit, result)
    })
}

onMounted(async () => {
  await loadSchemas()
  await loadData()
  await initOptionsData()
    .then((result) => {
      inputOptionsData.value = result
    })
    .catch((error) => {
      errorAlert.value = true
      errorContent.value = JSON.stringify(error, false, 4)
    })
})
</script>

<template>
  <div class="page-container">
    <h2 class="heading">{{ dataType }}</h2>

    <TTable
      name=""
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
              {{ inputValue(header.key, row) }}
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
      :schemas="combinedDataFields"
      :fields-layout="fieldsLayout"
      :data-fields="creatableKeys"
      :data="newRow"
      :dialog-title="createDialogTitle(dataType)"
      :full-screen="formDialogFullScreen"
      :error-messages="createErrors"
      @submit="createDataAndCloseDialog"
    />

    <FormDialog
      v-if="currentRowForUpdate"
      v-model="updateDialog"
      :schemas="combinedDataFields"
      :fields-layout="fieldsLayout"
      :data-fields="updatableKeys"
      :data="currentRowForUpdate"
      :dialog-title="updateDialogTitle(dataType, currentRowForUpdate)"
      :full-screen="formDialogFullScreen"
      :error-messages="updateErrors"
      @submit="updateDataAndCloseDialog"
    />

    <ViewDialog
      v-if="currentRow"
      v-model="viewDialog"
      :keys="viewableKeys"
      :include-keys="includeKeys"
      :data-fields="combinedDataFields"
      :record="currentRow"
      :title="viewDialogTitle(dataType, currentRow)"
      :input-label="inputLabel"
      :input-value="inputValue"
      class="view-dialog"
    />

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
  </div>
</template>

<style scoped>
.page-container {
  margin: 1rem 0;
}

.heading {
  font-weight: 900;
}

a.hidden {
  display: none;
}

.input-control {
  margin: 0 auto;
}

td.col {
  text-align: left;
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}
</style>
