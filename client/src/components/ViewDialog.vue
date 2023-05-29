<script setup>
/*** import:global ***/
import { ref, computed, onMounted } from 'vue'
/*** import:global ***/

/*** import:utils ***/
import { useFormatter } from '../utils/formatter'
import { useValidations } from '../utils/validations'
import { useSystemConfigsStore } from '@/stores/systemConfigs'

const systemConfigsStore = useSystemConfigsStore()
const systemConfigs = systemConfigsStore.getSystemConfigs()

const { isEmpty, notEmpty } = useValidations()

const {
  formatTag,
  tagStyle
} = useFormatter()

import { useInputHelper } from '../utils/input'

const {
  tagsFields,
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
  },
  includeKeys: {
    type: Array,
    default() {
      return []
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

const formattedRecord = ref()

async function asyncFormatTag(row, tags, key) {
  const promises = tags.map((tag) => {
    return new Promise((resolve, reject) => {
      formatTag(row, tag, key, systemConfigs.tagFormat)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => {
          reject(error)
        })
    })
  })

  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then((results) => {
        resolve({ key, formattedValue: results })
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function formattedTag(record, field, i) {
  if (formattedRecord.value[field]) {
    return formattedRecord.value[field][i] 
  } else {
    return record[field][i]
  }
}

onMounted(async () => {
  const promises = tagsFields.value.map((key) => {
    const value = props.record[key]
    return asyncFormatTag(props.record, value, key)
  })

  Promise.all(promises)
    .then((results) => {
      formattedRecord.value = Object.assign({}, props.record)

      results.forEach((result) => {
        formattedRecord.value[result.key] = result.formattedValue
      })
    })
    .catch((error) => {
      console.error(error)
    })
})
</script>

<template>
  <TDialog
    v-if="formattedRecord"
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
              v-if="notEmpty(record[field])"
            >
              {{ inputValue(field, record, includeKeys, dataFields) }}
            </div>

            <div
              v-if="isEmpty(record[field])"
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
              v-for="(tag, i) in record[field]"
              class="tag"
              :style="tagStyle(record, tag, field)"
            >
              {{ formattedTag(record, field, i) }}
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
