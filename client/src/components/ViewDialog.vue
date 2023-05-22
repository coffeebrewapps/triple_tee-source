<script setup>
/*** import:global ***/
import { computed } from 'vue'
/*** import:global ***/

/*** import:utils ***/
import { useFormatter } from '../utils/formatter'

const {
  formatTag,
  tagStyle
} = useFormatter()

import { useInputHelper } from '../utils/input'

const {
  tagsField
} = useInputHelper(props.dataFields)
/*** import:utils ***/

/*** import:components ***/
import {
  TDialog,
  TButton
} from 'coffeebrew-vue-components'
/*** import:components ***/

/*** section:props ***/
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
  dataFields: {
    type: Array,
    default() {
      return []
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
/*** section:props ***/

/*** section:emit ***/
const emit = defineEmits(['update:modelValue'])
/*** section:emit ***/

/*** section:dialog ***/
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
/*** section:dialog ***/
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
            v-if="!tagsField(field)"
            class="data-value"
          >
            <div
              v-if="record[field]"
            >
              {{ inputValue(field, record) }}
            </div>

            <div
              v-if="!record[field]"
              class="no-value"
            >
              --- no value ---
            </div>
          </div>

          <!-- hardcode format for tags because it is standard through the app --->
          <div
            v-if="tagsField(field)"
            class="data-value tags"
          >
            <div
              v-for="tag in record[field]"
              class="tag"
              :style="tagStyle(record, tag, field)"
            >
              {{ formatTag(record, tag, field) }}
            </div>

            <div
              v-if="record[field].length === 0"
              class="no-value"
            >
              --- no value ---
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
  display: flex;
  align-items: flex-start;
  font-weight: 600;
  padding: 0 0.5rem 0 0;
}

.data-value {
  display: flex;
  align-items: center;
  white-space: pre-wrap;
}

.data-value.tags {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

.data-value .no-value {
  font-size: 0.8rem;
  font-style: oblique;
}
</style>
