<script setup>
/** import:global **/
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
/** import:global **/

/** import:utils **/
import { useInputHelper } from '@/utils/input';
import { useDataAccess } from '@/utils/dataAccess';
import { useValidations } from '@/utils/validations';
import { useReceiptUtils } from './utils';
/** import:utils **/

/** import:stores **/
import { useBannerStore } from '@/stores/banner';
import { useSystemConfigsStore } from '@/stores/systemConfigs';
/** import:stores **/

/** import:components **/
import {
  TProgressBar
} from 'coffeebrew-vue-components';

import TabContainer from '@/components/TabContainer.vue';
import TemplateEditor from '@/components/TemplateEditor.vue';
/** import:components **/

/** section:utils **/
const router = useRouter();
const dataAccess = useDataAccess();
const { isEmpty, notEmpty } = useValidations();
const { flashMessage } = useBannerStore();
const systemConfigs = useSystemConfigsStore();
/** section:utils **/

/** section:global **/
const currentRoute = Object.assign({}, router.currentRoute.value);

const receiptId = computed(() => {
  return currentRoute.params.id;
});

const invoiceId = computed(() => {
  return currentRoute.query.invoiceId;
});

const contactId = computed(() => {
  return currentRoute.query.contactId;
});
const {
  fieldsLayout,
  generateDataFields,
} = useReceiptUtils();

const dataFields = computed(() => {
  return generateDataFields(invoiceId.value, contactId.value);
});

const {
  inputLabel,
  inputValue,
  includeKeys,
} = useInputHelper(dataFields.value);

const currentReceipt = ref();
const receiptTemplate = ref();
const templateData = ref();

const heading = computed(() => {
  if (currentReceipt.value) {
    return `Receipt: ${currentReceipt.value.receiptNumber}`;
  } else {
    return `Loading Receipt...`;
  }
});

async function loadReceipt() {
  currentReceipt.value = null;
  const params = { include: includeKeys.value };

  await dataAccess
    .view('income_receipts', receiptId.value, params)
    .then((result) => {
      currentReceipt.value = result;
      flashMessage(`Loaded receipt successfully!`);
    })
    .catch((error) => {
      console.error(error);
      flashMessage(`Error loading receipt!`);
    });
}

async function loadTemplateData() {
  receiptTemplate.value = null;

  dataAccess
    .view('income_receipts', currentReceipt.value.id, {}, { path: 'template_data' })
    .then((result) => {
      receiptTemplate.value = result.receiptTemplate;
      const country = result.country;
      const logo = result.logo;
      const billingContact = Object.assign(
        {},
        result.billingContact,
        { country: country.countryName, logo: logo.rawData }
      );

      templateData.value = Object.assign(
        {},
        result,
        {
          billingContact,
        }
      );
      flashMessage(`Loaded template data successfully!`);
    })
    .catch((error) => {
      console.error(error);
      flashMessage(`Error loading template data!`);
    });
}
/** section:global **/

/** section:tabs **/
const selectedTab = ref(0);
const tabs = [
  { label: 'Details', onchange: loadReceipt },
  { label: 'View Receipt PDF', onchange: loadTemplateData },
];

async function triggerTabEvent(i) {
  await tabs[i].onchange();
  selectedTab.value = i;
}
/** section:tabs **/

onMounted(async() => {
  await loadReceipt();
});
</script>

<template>
  <div class="page-container">
    <h2 class="heading">
      {{ heading }}
    </h2>

    <TProgressBar
      v-if="!currentReceipt"
    />

    <TabContainer
      v-if="currentReceipt"
      :selected-tab="selectedTab"
      :tabs="tabs"
      @tab-change="triggerTabEvent"
    >
      <template #tab-0>
        <div
          v-if="selectedTab === 0"
          class="details-container"
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
                class="field-value"
              >
                <span
                  v-if="notEmpty(currentReceipt) && notEmpty(currentReceipt[field])"
                >
                  {{ inputValue(field, currentReceipt, includeKeys, dataFields, systemConfigs) }}
                </span>

                <span
                  v-if="isEmpty(currentReceipt) || isEmpty(currentReceipt[field])"
                >
                  --- no value ---
                </span>
              </div> <!-- field-value -->
            </div> <!-- data-field -->
          </div> <!-- data-row -->
        </div> <!-- details-container -->
      </template> <!-- template-0 -->

      <template #tab-1>
        <TemplateEditor
          v-if="selectedTab === 1 && receiptTemplate"
          :id="receiptTemplate.id"
          template-type="receipt_templates"
          :content-markup="receiptTemplate.contentMarkup"
          :content-styles="receiptTemplate.contentStyles"
          :data="templateData"
          :disabled="true"
        />
      </template> <!-- template-1 -->
    </TabContainer>
  </div> <!-- page-container -->
</template>

<style scoped>
.page-container {
  margin-top: 1rem;
}

.page-container .heading {
  font-weight: 900;
}

.details-container {
  display: flex;
  flex-direction: column;
}

.data-row {
  display: flex;
}

.data-field {
  display: flex;
  align-items: center;
}

.data-field .field-label {
  padding: 0.5rem 1rem;
  font-weight: 600;
}

.data-field .field-value {
  padding: 0.5rem 1rem;
}
</style>
