<script setup>
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'

import useConfig from '../config'

import {
  TAlert,
  TDialog,
  TDatePicker,
  TInput,
  TSelect,
  TSelectTable,
  TButton
} from 'coffeebrew-vue-components'

const config = useConfig()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  fieldsLayout: {
    type: Array,
    default: []
  },
  dataFields: {
    type: Array,
    default: []
  },
  data: {
    type: Object,
    default: {}
  },
  schemas: {
    type: Object,
    default: {}
  },
  dialogTitle: {
    type: String,
    default: ``
  },
  fullScreen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const errorAlert = ref(false)
const errorContent = ref('')

const dialog = computed({
  get: () => {
    return props.modelValue
  },
  set: (val) => {
    emit('update:modelValue', val)
  }
})

const dialogClass = computed(() => {
  const fieldsLength = Object.keys(props.dataFields).length
  if (fieldsLength > 4) {
    return `split-col`
  } else {
    return `single-col`
  }
})

const dialogSize = computed(() => {
  if (props.fullScreen) {
    return {
      width: window.screen.width - 100,
      height: window.screen.height - 150
    }
  } else {
    return {
      width: 800,
      height: 600
    }
  }
})

const inputOptionsData = ref(initInputOptions())

function inputType(field) {
  return props.schemas[field].type
}

function inputLabel(field) {
  return props.schemas[field].label
}

async function fetchOptions(field, offset) {
  const options = props.schemas[field].options
  if (options.server) {
    const limit = props.schemas[field].limit || 5
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
  const limit = props.schemas[field].limit || 5
  await fetchOptions(field, newOffset)
    .then((result) => {
      inputOptionsData.value[field] = formatInputOptionsData(field, newOffset, limit, result)
    })
}

function inputableField(field) {
  return inputType(field) === 'text' || inputType(field) === 'number'
}

function selectableField(field) {
  return inputType(field) === 'select' || inputType(field) === 'multiSelect' || inputType(field) === 'enum'
}

function submitDataAndCloseDialog() {
  emit('submit', props.data)
  closeDialog()
}

function closeDialog() {
  dialog.value = false
  emit('update:modelValue', false)
}

async function initOptionsData() {
  const fields = Object.keys(props.schemas).filter(f => selectableField(f))

  await Promise.all(fields.map((field) => {
    const offset = props.schemas[field].offset || 0
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

function initInputOptions() {
  const fields = Object.keys(props.schemas).filter(f => selectableField(f))

  return fields.reduce((o, field) => {
    o[field] = formatInputOptionsData(field, 0, 5, { data: [], total: 0 })
    return o
  }, {})
}

onMounted(async () => {
  await initOptionsData()
})
</script>

<template>
  <TDialog
    v-model="dialog"
    :title="dialogTitle"
    :class="dialogClass"
    :width="dialogSize.width"
    :height="dialogSize.height"
  >
    <template #body>
      <div
        v-for="row in fieldsLayout"
        class="data-row"
      >

        <slot
          v-for="field in Object.keys(row)"
          :name="`form-col.${field}`"
          v-bind="{ field: field, type: inputType(field), label: inputLabel(field) }"
        >
          <TInput
            v-if="inputableField(field)"
            v-model="data[field]"
            :type="inputType(field)"
            :label="inputLabel(field)"
            :size="row[field]"
          />

          <TDatePicker
            v-if="inputType(field) === 'date'"
            v-model="data[field]"
            :label="inputLabel(field)"
          />

          <TSelect
            v-if="inputType(field) === 'select' || inputType(field) === 'enum'"
            v-model="data[field]"
            :label="inputLabel(field)"
            :name="field"
            :id="field"
            :options="inputOptionsData[field].data"
            :size="row[field]"
          />

          <div class="select-table">
            <TSelectTable
              v-if="inputType(field) === 'multiSelect'"
              v-model="data[field]"
              :label="inputLabel(field)"
              :name="field"
              :options="inputOptionsData[field].data"
              :options-length="inputOptionsData[field].total"
              :options-loading="inputOptionsData[field].loading"
              :pagination="inputOptionsData[field].pagination"
              :size="row[field]"
              @offset-change="inputOptionsData[field].offsetChange"
            />
          </div>
        </slot>

      </div>
    </template>

    <template #actions>
      <TButton class="confirm-button" button-type="text" value="Confirm" icon="fa-solid fa-check" @click="submitDataAndCloseDialog()"/>
      <TButton button-type="text" value="Cancel" icon="fa-solid fa-xmark" @click="closeDialog()"/>
    </template>
  </TDialog>

  <TAlert
    title="Error"
    :content="errorContent"
    :width="400"
    :height="250"
    v-model="errorAlert"
  />
</template>

<style scoped>
.data-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: left;
  align-items: flex-start;
  text-align: left;
}

.input-control {
  margin: 0.5rem !important;
}
</style>
