<script setup>
import { onMounted, computed, ref } from 'vue'

import {
  TDialog,
  TInput,
  TCheckbox,
  TTable
} from 'coffeebrew-vue-components'

const props = defineProps({
  modelValue: {
    type: Array,
    default() {
      return []
    }
  },
  name: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md'
  },
  label: {
    type: String,
    default: 'Input'
  },
  options: {
    type: Array,
    default() {
      return []
    }
  }
})

const emit = defineEmits(['update:modelValue'])

const tableDialog = ref(false)
const errorMessage = ref('')

const tableHeaders = computed(() => {
  return [
    { key: 'value', type: 'text', label: 'Value' },
    { key: 'label', type: 'text', label: 'Label' }
  ]
})

const actions = ref([
  {
    name: 'Select',
    icon: '',
    click: function(row, index) {
      updateSelected(row)
    }
  }
])

const computedInputControlClass = computed(() => {
  return `input-control ${props.size}`
})

function checkboxClass(row) {
  if (selectedOptions.value[row.value]) {
    return `checkbox checked`
  } else {
    return `checkbox`
  }
}

function optionsForSelect() {
  return props.options.reduce((o, opt) => {
    if (!!props.modelValue && typeof props.modelValue !== 'String') {
      o[opt.value] = !!props.modelValue.find(v => v === opt.value)
    } else {
      o[opt.value] = props.modelValue === opt.value
    }
    return o
  }, {})
}

const selectedOptions = ref(optionsForSelect())

const selectedValues = computed(() => {
  return Object.keys(selectedOptions.value).filter((o) => {
    return selectedOptions.value[o]
  })
})

const selectedOptionsForDisplay = computed(() => {
  return selectedValues.value.map((selected) => {
    return props.options.find(o => o.value === selected).label
  })
})

function toggleSelect() {
  tableDialog.value = !tableDialog.value
}

function updateSelected(row) {
  selectedOptions.value[row.value] = !selectedOptions.value[row.value]
  emit('update:modelValue', selectedValues.value)
}

function updateOffsetAndReload() {
}

onMounted(() => {
})
</script>

<template>
  <div
    :class="computedInputControlClass"
  >
    <div
      class="input-label"
    >
      {{ label }}
    </div>

    <div
      class="input-field"
      @click="toggleSelect"
    >
      <div
        class="select"
      >
        <div
          class="selected"
          v-for="selected in selectedOptionsForDisplay"
        >
          <div class="tag">{{ selected }}</div>
        </div>
      </div>

      <div class="toggle">
        <i class="fa-solid fa-magnifying-glass"></i>
      </div>
    </div>

    <div
      v-if="errorMessage.length > 0"
      class="input-error"
    >
      {{ errorMessage }}
    </div>
  </div>

  <TDialog
    v-if="tableDialog"
    v-model="tableDialog"
    title="Select"
    :width="800"
    :height="600"
    class="options-dialog"
  >
    <template #body>
      <TTable
        :name="name"
        :headers="tableHeaders"
        :data="options"
        :actions="actions"
        :loading="false"
        :total-data="options.length"
        :pagination="{ limit: 5, client: true }"
        @offset-change="updateOffsetAndReload"
      >

        <template #data-action="{ row, action, i }">
          <div
            :class="checkboxClass(row)"
          >
          </div>
        </template>
      </TTable>
    </template>
  </TDialog>
</template>

<style scoped>
.input-control {
  margin: 2px 0 8px 0;
}

.input-control.sm {
  width: 100px;
}

.input-control.md {
  width: 200px;
}

.input-control.lg {
  width: 500px;
}

.input-label {
  font-size: 0.8rem;
}

.input-field {
  display: flex;
  align-items: center;
  padding: 12px;
  margin: 2px 0 8px 0;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-sizing: border-box;
}

.input-field:hover {
  cursor: pointer;
  background-color: var(--color-border-hover);
  color: var(--color-text);
}

.input-control .input-field .select {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 95%;
}

.input-error {
  margin-bottom: 8px;
  font-size: 0.8rem;
  color: var(--color-error);
}

.options-dialog .checkbox {
  display: grid;
  align-items: center;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid var(--color-border);
}

.options-dialog .checkbox.checked {
  background-color: var(--color-border-hover);
}
</style>
