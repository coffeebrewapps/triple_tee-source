<script setup>
/** import:global **/
import { computed } from 'vue';
/** import:global **/

/** import:components **/
import {
  TDialog
} from 'coffeebrew-vue-components';

import DataForm from './DataForm.vue';
/** import:components **/

/** section:props **/
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
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
  data: {
    type: Object,
    default() {
      return {};
    },
  },
  schemas: {
    type: Object,
    default() {
      return {};
    },
  },
  dialogTitle: {
    type: String,
    default: ``,
  },
  fullscreen: {
    type: Boolean,
    default: false,
  },
  errorMessages: {
    type: Object,
    default() {
      return {};
    },
  },
});
/** section:props **/

/** section:emit **/
const emit = defineEmits(['update:modelValue', 'submit']);
/** section:emit **/

/** section:dialog **/
const dialog = computed({
  get: () => {
    return props.modelValue;
  },
  set: (val) => {
    emit('update:modelValue', val);
  },
});
/** section:dialog **/

/** section:form **/
const formData = computed(() => {
  return props.data;
});
/** section:form **/

/** section:action **/
function submitData(data) {
  emit('submit', data);
}

function closeDialog() {
  dialog.value = false;
}
/** section:action **/
</script>

<template>
  <TDialog
    v-model="dialog"
    :title="dialogTitle"
    :fullscreen="fullscreen"
    class="form-dialog"
  >
    <template #body>
      <DataForm
        v-model="formData"
        :fields-layout="fieldsLayout"
        :data-fields="dataFields"
        :schemas="schemas"
        :error-messages="errorMessages"
        @submit="submitData"
        @cancel="closeDialog"
      />
    </template>
  </TDialog>
</template>
