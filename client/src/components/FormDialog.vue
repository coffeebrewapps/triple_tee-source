<script setup>
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'

import useConfig from '../config'
import { useInputHelper } from '../utils/input'

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
const {
  schemasMap,
  serverOptionsFields,
  serverOptionsField,
  selectableKeys,
  multiSelectableFields,
  singleSelectableFields,
  inputType,
  inputLabel,
  inputableField,
  multiSelectableField,
  singleSelectableField,
  selectableField,
  formatInputOptionsData,
  formatDate,
  fetchOptions,
  initOptionsData
} = useInputHelper(props.schemas)

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

const inputOptionsData = ref({})

function inputOptions(field) {
  return inputOptionsData.value[field]
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

function submitDataAndCloseDialog() {
  emit('submit', props.data)
  closeDialog()
}

function closeDialog() {
  dialog.value = false
  emit('update:modelValue', false)
}

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
            v-if="inputType(field) === 'enum' || inputType(field) === 'select'"
            v-model="data[field]"
            :label="inputLabel(field)"
            :name="field"
            :id="field"
            :options="schemasMap[field].options"
            :size="row[field]"
          />

          <TSelectTable
            v-if="inputType(field) === 'singleSelect' && !!inputOptions(field)"
            v-model="data[field]"
            :label="inputLabel(field)"
            :name="inputLabel(field)"
            :multiple="false"
            :options="inputOptions(field).data"
            :options-length="inputOptions(field).total"
            :options-loading="inputOptions(field).loading"
            :pagination="inputOptions(field).pagination"
            :size="row[field]"
            @offset-change="fieldOffsetChange[field]"
          />

          <TSelectTable
            v-if="inputType(field) === 'multiSelect' && !!inputOptions(field)"
            v-model="data[field]"
            :label="inputLabel(field)"
            :name="inputLabel(field)"
            :options="inputOptions(field).data"
            :options-length="inputOptions(field).total"
            :options-loading="inputOptions(field).loading"
            :pagination="inputOptions(field).pagination"
            :size="row[field]"
            @offset-change="fieldOffsetChange[field]"
          />
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
