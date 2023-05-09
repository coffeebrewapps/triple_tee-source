<script setup>
import { ref, computed } from 'vue'

import useConfig from '../config'

import {
  TDialog,
  TDatePicker,
  TInput,
  TSelect,
  TButton
} from 'coffeebrew-vue-components'

import SelectTable from './SelectTable.vue'

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

function inputType(field) {
  return props.schemas[field].type
}

function inputLabel(field) {
  return props.schemas[field].label
}

function inputValue(field, value) {
  if (selectableField(field)) {
    const option = inputOptions(field).find(o => o.value === value) || {}
    return option.label
  } else {
    return value
  }
}

function inputOptions(field) {
  if (selectableField(field)) {
    return props.schemas[field].options
  } else {
    return []
  }
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
            :options="inputOptions(field)"
            :size="row[field]"
          />

          <SelectTable
            v-if="inputType(field) === 'multiSelect'"
            v-model="data[field]"
            :label="inputLabel(field)"
            :name="field"
            :options="inputOptions(field)"
            :size="row[field]"
          />
        </slot>

      </div>
    </template>

    <template #actions>
      <TButton class="confirm-button" button-type="text" value="Confirm" icon="fa-solid fa-check" @click="submitDataAndCloseDialog()"/>
      <TButton button-type="text" value="Cancel" icon="fa-solid fa-xmark" @click="closeDialog()"/>
    </template>
  </TDialog>
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
