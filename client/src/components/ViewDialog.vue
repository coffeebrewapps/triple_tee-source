<script setup>
import { computed } from 'vue'

import { useFormatter } from '../utils/formatter'

import {
  TDialog,
  TButton
} from 'coffeebrew-vue-components'

const {
  formatTag,
  tagStyle
} = useFormatter()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  keys: {
    type: Array,
    default() {
      return []
    }
  },
  record: {
    type: Object,
    default() {
      return {}
    }
  },
  title: {
    type: String,
    default: 'View'
  },
  inputLabel: {
    type: Function,
    default(f) {
      return f
    }
  },
  inputValue: {
    type: Function,
    default(f, r) {
      return r[f]
    }
  }
})

const emit = defineEmits(['update:modelValue'])

const dialog = computed({
  get: () => {
    return props.modelValue
  },
  set: (val) => {
    emit('update:modelValue', val)
  }
})

function closeDialog() {
  emit('update:modelValue', false)
}
</script>

<template>
  <TDialog
    v-if="record"
    v-model="dialog"
    :title="title"
  >
    <template #body>
      <div class="data-row">
        <div
          class="data-col"
          v-for="field in keys"
        >
          <div class="data-label">{{ inputLabel(field) }}</div>
          <div
            v-if="field !== 'tags'"
            class="data-value"
          >
            {{ inputValue(field, record) }}
          </div>

          <!-- hardcode format for tags because it is standard through the app --->
          <div class="data-value">
            <div
              v-if="field === 'tags'"
              v-for="tag in record.tags"
              class="tag"
              :style="tagStyle(record, tag)"
            >
              {{ formatTag(record, tag) }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #actions>
      <TButton button-type="text" value="Close" icon="fa-solid fa-xmark" @click="closeDialog()"/>
    </template>
  </TDialog>
</template>

<style scoped>
.data-row {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.data-col {
  display: grid;
  grid-template-columns: 1fr 3fr;
  padding: 1rem;
}

.data-label {
  font-weight: 600;
}

.data-value {
  white-space: pre-wrap;
}
</style>
