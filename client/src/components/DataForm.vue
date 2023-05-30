<script setup>
/** import:global **/
import { onMounted, ref, computed } from 'vue';
/** import:global **/

/** import:utils **/
import { useInputHelper } from '@/utils/input';
import { useErrors } from '@/utils/errors';
/** import:utils **/

/** import:components **/
import {
  TCheckbox,
  TDatePicker,
  TDateRange,
  TDateTimePicker,
  TDateTimeRange,
  TInput,
  TSelect,
  TSelectTable,
  TTextarea,
  TButton
} from 'coffeebrew-vue-components';
/** import:components **/

/** section:props **/
const props = defineProps({
  modelValue: {
    type: Object,
    default() {
      return {};
    },
  },
  fieldsLayout: {
    type: Array,
    default() {
      return [];
    },
  },
  dataFields: {
    type: Array,
    default() {
      return [];
    },
  },
  schemas: {
    type: Object,
    default() {
      return {};
    },
  },
  errorMessages: {
    type: Object,
    default() {
      return {};
    },
  },
  compact: {
    type: Boolean,
    default: false,
  },
  submittable: {
    type: Boolean,
    default: true,
  },
  confirmButton: {
    type: Object,
    default() {
      return {
        type: 'text',
        icon: 'fa-solid fa-check',
        value: 'Confirm',
      };
    },
  },
  cancelButton: {
    type: Object,
    default() {
      return {
        type: 'text',
        icon: 'fa-solid fa-xmark',
        value: 'Cancel',
      };
    },
  },
});

const data = computed({
  get: () => {
    return props.modelValue;
  },
  set: (val) => {
    emit('update:modelValue', val);
  },
});
/** section:props **/

/** section:emit **/
const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);
/** section:emit **/

/** section:inputUtils **/
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
  objectField,
  formatInputOptionsData,
  fetchOptions,
  initOptionsData,
} = useInputHelper(props.schemas);

const errorsMap = useErrors();

const fieldToggles = ref(nullToggleableFields.value.reduce((o, f) => {
  o[f] = false;
  return o;
}, {}));

function showField(field) {
  return !nullToggleableField(field) || fieldToggles.value[field];
}

function showInput(field) {
  return showField(field) && inputableField(field);
}

function showTextarea(field) {
  return showField(field) && (multiInputableField(field) || objectField(field));
}

function showDatePicker(field) {
  return showField(field) && inputType(field) === 'date';
}

function showDateTimePicker(field) {
  return showField(field) && inputType(field) === 'datetime';
}

function showSelect(field) {
  return showField(field) && (inputType(field) === 'enum' || inputType(field) === 'select');
}

function showDateRange(field) {
  return showField(field) && inputType(field) === 'daterange';
}

function showDateTimeRange(field) {
  return showField(field) && inputType(field) === 'datetimerange';
}

function showCheckbox(field) {
  return showField(field) && inputType(field) === 'boolean';
}

function fieldUpdatable(field) {
  return props.dataFields.find(f => f === field);
}

function fieldToggleLabel(field) {
  return `Has ${inputLabel(field)}`;
}

function fieldErrorMessage(field) {
  if (!props.errorMessages) { return ``; }
  if (!props.errorMessages[field]) { return ``; }

  return props.errorMessages[field].map((error) => {
    return errorsMap[error.name](error.params);
  }).join(', ');
}
/** section:inputUtils **/

/** section:selectTableUtils **/
const inputOptionsData = ref({});

function inputOptions(field) {
  return inputOptionsData.value[field];
}

function showSingleSelect(field) {
  return showField(field) && singleSelectableField(field) && !!inputOptions(field);
}

function showMultiSelect(field) {
  return showField(field) && multiSelectableField(field) && !!inputOptions(field);
}

const fieldOffsetChange = computed(() => {
  return serverOptionsFields.value.reduce((o, k) => {
    o[k] = (offset) => { offsetChange(k, offset); };
    return o;
  }, {});
});

async function offsetChange(field, newOffset) {
  const limit = schemasMap.value[field].limit || 5;
  await fetchOptions(field, newOffset)
    .then((result) => {
      inputOptionsData.value[field] = formatInputOptionsData(field, newOffset, limit, result);
    });
}
/** section:selectTableUtils **/

/** section:styles **/
const formClass = computed(() => {
  if (props.compact) {
    return `form compact`;
  } else {
    return `form`;
  }
});

function dataFieldClass(field) {
  if (nullToggleableField(field)) {
    return `data-field toggleable`;
  } else {
    return `data-field`;
  }
}
/** section:styles **/

/** section:action **/
function submitData() {
  emit('submit', data.value);
}

function cancel() {
  emit('cancel');
}
/** section:action **/

onMounted(async() => {
  await initOptionsData()
    .then((result) => {
      inputOptionsData.value = result;
    })
    .catch((error) => {
      console.error(error);
    });
});
</script>

<template>
  <div
    :class="formClass"
  >
    <div class="body">
      <div
        v-for="(row, i) in fieldsLayout"
        :key="i"
        class="data-row"
      >
        <slot
          v-for="(field, j) in Object.keys(row)"
          :key="j"
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
                :id="field"
                v-model="data[field]"
                :label="inputLabel(field)"
                :name="field"
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
                :error-message="fieldErrorMessage(field)"
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
                :error-message="fieldErrorMessage(field)"
                @offset-change="fieldOffsetChange[field]"
              />

              <TDateRange
                v-if="showDateRange(field)"
                v-model:start-date="data[field].startDate"
                v-model:end-date="data[field].endDate"
                :label="inputLabel(field)"
                :disabled="!fieldUpdatable(field)"
                :error-message="fieldErrorMessage(field)"
              />

              <TDateTimeRange
                v-if="showDateTimeRange(field)"
                v-model:start-time="data[field].startTime"
                v-model:end-time="data[field].endTime"
                :label="inputLabel(field)"
                :disabled="!fieldUpdatable(field)"
                :error-message="fieldErrorMessage(field)"
              />

              <TCheckbox
                v-if="showCheckbox(field)"
                v-model="data[field]"
                :label="inputLabel(field)"
                :disabled="!fieldUpdatable(field)"
                :error-message="fieldErrorMessage(field)"
              />
            </div> <!-- field-input -->

            <div
              v-if="nullToggleableField(field)"
              class="field-toggle"
            >
              <TCheckbox
                v-model="fieldToggles[field]"
                :label="fieldToggleLabel(field)"
              />
            </div>
          </div> <!-- data-field -->
        </slot>
      </div> <!-- data-row -->
    </div> <!-- body -->

    <div
      v-if="submittable"
      class="actions"
    >
      <TButton
        class="button"
        :button-type="confirmButton.type"
        :value="confirmButton.value"
        :icon="confirmButton.icon"
        @click="submitData()"
      />
      <TButton
        class="button"
        :button-type="cancelButton.type"
        :value="cancelButton.value"
        :icon="cancelButton.icon"
        @click="cancel()"
      />
    </div>
  </div> <!-- form -->
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
}

.form.compact {
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.form .body {
}

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

.form .actions {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.form.compact .actions {
  align-self: flex-end;
  gap: 0.5rem;
}

.date-range {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
}

.to {
  margin: 0 8px;
  font-size: 0.8rem;
  font-weight: 600;
}
</style>
