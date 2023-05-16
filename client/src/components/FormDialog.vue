<script setup>
/*** import:global ***/
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'
/*** import:global ***/

/*** import:config ***/
import useConfig from '../config'
const config = useConfig()
/*** import:config ***/

/*** import:utils ***/
import { useInputHelper } from '../utils/input'

const {
  schemasMap,
  serverOptionsFields,
  inputType,
  inputLabel,
  inputableField,
  multiInputableField,
  multiSelectableField,
  singleSelectableField,
  nullToggleableField,
  nullToggleableFields,
  formatInputOptionsData,
  fetchOptions,
  initOptionsData
} = useInputHelper(props.schemas)

import { useErrors } from '../utils/errors'
const errorsMap = useErrors()
/*** import:utils ***/

/*** import:components ***/
import {
  TAlert,
  TCheckbox,
  TDialog,
  TDatePicker,
  TDateTimePicker,
  TInput,
  TSelect,
  TSelectTable,
  TTextarea,
  TButton
} from 'coffeebrew-vue-components'
/*** import:components ***/

/*** section:props ***/
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
  },
  errorMessages: {
    type: Object,
    default() {
      return {}
    }
  }
})
/*** section:props ***/

/*** section:emit ***/
const emit = defineEmits(['update:modelValue', 'submit'])
/*** section:emit ***/

/*** section:error ***/
const errorAlert = ref(false)
const errorContent = ref('')
/*** section:error ***/

/*** section:dialog ***/
const dialog = computed({
  get: () => {
    return props.modelValue
  },
  set: (val) => {
    emit('update:modelValue', val)
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
/*** section:dialog ***/

/*** section:inputUtils ***/
function showField(field) {
  return !nullToggleableField(field) || fieldToggles.value[field]
}

function showInput(field) {
  return showField(field) && inputableField(field)
}

function showTextarea(field) {
  return showField(field) && multiInputableField(field)
}

function showDatePicker(field) {
  return showField(field) && inputType(field) === 'date'
}

function showDateTimePicker(field) {
  return showField(field) && inputType(field) === 'datetime'
}

function showSelect(field) {
  return showField(field) && (inputType(field) === 'enum' || inputType(field) === 'select')
}

function fieldUpdatable(field) {
  return props.dataFields.find(f => f === field)
}

const fieldToggles = ref(nullToggleableFields.value.reduce((o, f) => {
  o[f] = false
  return o
}, {}))

function fieldToggleLabel(field) {
  return `Has ${inputLabel(field)}`
}

function fieldErrorMessage(field) {
  if (!props.errorMessages) { return `` }
  if (!props.errorMessages[field]) { return `` }

  return props.errorMessages[field].map((error) => {
    return errorsMap[error]
  }).join(', ')
}
/*** section:inputUtils ***/

/*** section:selectTableUtils ***/
const inputOptionsData = ref({})

function inputOptions(field) {
  return inputOptionsData.value[field]
}

function showSingleSelect(field) {
  return showField(field) && singleSelectableField(field) && !!inputOptions(field)
}

function showMultiSelect(field) {
  return showField(field) && multiSelectableField(field) && !!inputOptions(field)
}

const fieldOffsetChange = computed(() => {
  return serverOptionsFields.value.reduce((o, k) => {
    o[k] = (offset) => { offsetChange(k, offset) }
    return o
  }, {})
})

async function offsetChange(field, newOffset) {
  const limit = schemasMap.value[field].limit || 5
  await fetchOptions(field, newOffset)
    .then((result) => {
      inputOptionsData.value[field] = formatInputOptionsData(field, newOffset, limit, result)
    })
}
/*** section:selectTableUtils ***/

/*** section:action ***/
function submitData() {
  const clonedData = Object.assign({}, props.data)

  Object.keys(fieldToggles.value).forEach((field) => {
    if (!fieldToggles.value[field]) {
      clonedData[field] = null
    }
  })

  emit('submit', clonedData)
}

function closeDialog() {
  dialog.value = false
  emit('update:modelValue', false)
}
/*** section:action ***/

/*** section:styles ***/
function dataFieldClass(field) {
  if (nullToggleableField(field)) {
    return `data-field toggleable`
  } else {
    return `data-field`
  }
}
/*** section:styles ***/

onMounted(async () => {
  await initOptionsData()
    .then((result) => {
      inputOptionsData.value = result
    })
    .catch((error) => {
      errorAlert.value = true
      errorContent.value = JSON.stringify(error)
    })
})
</script>

<template>
  <TDialog
    v-model="dialog"
    :title="dialogTitle"
    :width="dialogSize.width"
    :height="dialogSize.height"
    class="form-dialog"
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
          <div
            :class="dataFieldClass(field)"
          >
            <div
              class="field-input"
            >
              <TInput
                v-if="showInput(field)"
                v-model="data[field]"
                :type="inputType(field)"
                :label="inputLabel(field)"
                :size="row[field]"
                :disabled="!fieldUpdatable(field)"
                :error-message="fieldErrorMessage(field)"
              />

              <TTextarea
                v-if="showTextarea(field)"
                v-model="data[field]"
                :label="inputLabel(field)"
                :disabled="!fieldUpdatable(field)"
                :error-message="fieldErrorMessage(field)"
              />

              <TDatePicker
                v-if="showDatePicker(field)"
                v-model="data[field]"
                :label="inputLabel(field)"
                :disabled="!fieldUpdatable(field)"
                align-pickers="top"
                :error-message="fieldErrorMessage(field)"
              />

              <TDateTimePicker
                v-if="showDateTimePicker(field)"
                v-model="data[field]"
                :label="inputLabel(field)"
                :disabled="!fieldUpdatable(field)"
                :display-time="true"
                align-pickers="top"
                :error-message="fieldErrorMessage(field)"
              />

              <TSelect
                v-if="showSelect(field)"
                v-model="data[field]"
                :label="inputLabel(field)"
                :name="field"
                :id="field"
                :options="schemasMap[field].options"
                :size="row[field]"
                :disabled="!fieldUpdatable(field)"
                :error-message="fieldErrorMessage(field)"
              />

              <TSelectTable
                v-if="showSingleSelect(field)"
                v-model="data[field]"
                :label="inputLabel(field)"
                :name="inputLabel(field)"
                :multiple="false"
                :options="inputOptions(field).data"
                :options-length="inputOptions(field).total"
                :options-loading="inputOptions(field).loading"
                :pagination="inputOptions(field).pagination"
                :size="row[field]"
                :disabled="!fieldUpdatable(field)"
                @offset-change="fieldOffsetChange[field]"
              />

              <TSelectTable
                v-if="showMultiSelect(field)"
                v-model="data[field]"
                :label="inputLabel(field)"
                :name="inputLabel(field)"
                :options="inputOptions(field).data"
                :options-length="inputOptions(field).total"
                :options-loading="inputOptions(field).loading"
                :pagination="inputOptions(field).pagination"
                :size="row[field]"
                :disabled="!fieldUpdatable(field)"
                @offset-change="fieldOffsetChange[field]"
              />
            </div> <!-- field-input -->

            <div
              v-if="nullToggleableField(field)"
              class="field-toggle"
            >
              <TCheckbox v-model="fieldToggles[field]" :label="fieldToggleLabel(field)"/>
            </div>

          </div> <!-- data-field -->
        </slot>

      </div>
    </template>

    <template #actions>
      <TButton class="confirm-button" button-type="text" value="Confirm" icon="fa-solid fa-check" @click="submitData()"/>
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

.data-field {
  display: flex;
  flex-direction: column;
}
</style>
