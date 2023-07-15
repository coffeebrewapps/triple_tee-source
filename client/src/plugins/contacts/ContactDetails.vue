<script setup>
/** import:global **/
import { ref, onMounted } from 'vue';
/** import:global **/

/** import:utils **/
import { useInputHelper } from '@/utils/input';
import { useDataAccess } from '@/utils/dataAccess';
import { useValidations } from '@/utils/validations';
import { useContactUtils } from './utils';
import { useLogger } from '@/utils/logger';
/** import:utils **/

/** import:stores **/
import { useBannerStore } from '@/stores/banner';
import { useSystemConfigsStore } from '@/stores/systemConfigs';
/** import:stores **/

/** section:props **/
const props = defineProps({
  contactId: {
    type: String,
    default: null,
  },
});
/** section:props **/

/** section:utils **/
const {
  fieldsLayout,
  dataFields,
  includeKeys,
} = useContactUtils();

const {
  inputLabel,
  inputValue,
  fileField,
} = useInputHelper(dataFields);

const dataAccess = useDataAccess();
const { isEmpty, notEmpty } = useValidations();
const { flashMessage } = useBannerStore();
const systemConfigs = useSystemConfigsStore();
const logger = useLogger();
/** section:utils **/

/** section:global **/
const currentContact = ref();

async function loadContact() {
  currentContact.value = null;
  const params = { include: includeKeys.value };

  await dataAccess
    .view(`contacts`, props.contactId, params)
    .then((result) => {
      currentContact.value = result;
    })
    .catch((error) => {
      logger.error(`Error loading contact`, error);
      flashMessage(`Error loading contact!`);
    });
}
/** section:global **/

onMounted(async() => {
  await loadContact();
});
</script>

<template>
  <div
    class="contact-container"
  >
    <div
      v-for="(row, i) in fieldsLayout"
      :key="i"
      class="data-row"
    >
      <div
        v-for="(field, j) in Object.keys(row)"
        :key="j"
        class="data-field"
      >
        <div
          class="field-label"
        >
          {{ inputLabel(field) }}
        </div> <!-- field-label -->

        <div
          v-if="notEmpty(currentContact) && notEmpty(currentContact[field])"
          class="field-value"
        >
          <span
            v-if="!fileField(field)"
          >
            {{ inputValue(field, currentContact, includeKeys, dataFields, systemConfigs) }}
          </span>

          <img
            v-if="fileField(field)"
            style="width: 50%;"
            :src="inputValue(field, currentContact, includeKeys, dataFields, systemConfigs)"
          >
        </div> <!-- field-value:notEmpty -->

        <div
          v-if="isEmpty(currentContact) || isEmpty(currentContact[field])"
          class="field-value"
        >
          <span>--- no value ---</span>
        </div> <!-- field-value:isEmpty -->
      </div> <!-- data-field -->
    </div> <!-- data-row -->
  </div> <!-- contact-container -->
</template>

<style scoped>
.contact-container {
  display: flex;
  flex-direction: column;
}

.contact-container .data-row {
  display: flex;
}

.contact-container .data-row .data-field {
  display: flex;
  align-items: center;
}

.contact-container .data-row .data-field .field-label {
  padding: 0.5rem 1rem;
  font-weight: 600;
}

.contact-container .data-row .data-field .field-value {
  padding: 0.5rem 1rem;
}
</style>
