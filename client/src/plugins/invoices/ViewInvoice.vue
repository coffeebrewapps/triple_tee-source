<script setup>
/** import:global **/
import { ref, computed, onMounted } from 'vue';
/** import:global **/

/** import:utils **/
import { useInputHelper } from '@/utils/input';
import { useDataAccess } from '@/utils/dataAccess';
import { useValidations } from '@/utils/validations';
import { useInvoiceUtils } from './utils';
/** import:utils **/

/** import:stores **/
import { useEventsStore } from '@/stores/events';
import { useBannerStore } from '@/stores/banner';
import { useSystemConfigsStore } from '@/stores/systemConfigs';
/** import:stores **/

/** import:components **/
import {
  TProgressBar
} from 'coffeebrew-vue-components';

import TabContainer from '@/components/TabContainer.vue';
import InvoiceLines from '@/plugins/invoice_lines/InvoiceLines.vue';
import TemplateEditor from '@/components/TemplateEditor.vue';
/** import:components **/

/** section:utils **/
const dataAccess = useDataAccess();
const { isEmpty, notEmpty } = useValidations();
const events = useEventsStore();
const { flashMessage } = useBannerStore();
const systemConfigs = useSystemConfigsStore();
/** section:utils **/

/** section:props **/
const props = defineProps({
  contactId: {
    type: String,
    default: null,
  },
  invoiceId: {
    type: String,
    default: null,
  },
});
/** section:props **/

/** section:global **/
const {
  fieldsLayout,
  generateDataFields,
} = useInvoiceUtils();

const dataFields = computed(() => {
  return generateDataFields(props.contactId);
});

const {
  inputLabel,
  inputValue,
  includeKeys,
} = useInputHelper(dataFields.value);

const currentInvoice = ref();
const invoiceLines = ref();
const invoiceConfig = ref();
const invoiceTemplate = ref();
const templateData = ref();

const heading = computed(() => {
  if (currentInvoice.value) {
    return `Invoice: ${currentInvoice.value.invoiceNumber}`;
  } else {
    return `Loading Invoice...`;
  }
});

async function loadInvoice() {
  currentInvoice.value = null;
  const params = { include: includeKeys.value };

  await dataAccess
    .view('invoices', props.invoiceId, params)
    .then((result) => {
      currentInvoice.value = result;
      flashMessage(`Loaded invoice successfully!`);
    })
    .catch((error) => {
      console.error(error);
      flashMessage(`Error loading invoice!`);
    });
}

async function loadTemplateData() {
  invoiceLines.value = null;
  invoiceConfig.value = null;
  invoiceTemplate.value = null;

  dataAccess
    .view('invoices', currentInvoice.value.id, {}, { path: 'template_data' })
    .then((result) => {
      invoiceLines.value = result.invoiceLines;
      invoiceConfig.value = result.invoiceConfig;
      invoiceTemplate.value = result.invoiceTemplate;
      const invoiceNumberSequence = result.invoiceNumberSequence;
      const currency = result.currency;
      const billingContact = result.billingContact;
      const country = result.country;
      const logo = result.logo;

      templateData.value = {
        invoice: currentInvoice.value,
        invoiceLines: invoiceLines.value,
        invoiceConfig: invoiceConfig.value,
        invoiceNumberSequence,
        billingContact: Object.assign({}, billingContact, { country: country.countryName, logo: logo.rawData }),
        currency,
        country,
        logo,
      };
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
  { label: 'Details', onchange: loadInvoice },
  { label: 'Invoice Lines', onchange: loadInvoiceLines },
  { label: 'View Invoice PDF', onchange: loadTemplateData },
];

async function loadInvoiceLines() {
  events.emitEvent('loadData', { dataType: 'Invoice Lines' });
}

async function triggerTabEvent(i) {
  await tabs[i].onchange();
  selectedTab.value = i;
}
/** section:tabs **/

onMounted(async() => {
  await loadInvoice();
});
</script>

<template>
  <div class="page-container">
    <h2 class="heading">
      {{ heading }}
    </h2>

    <TProgressBar
      v-if="!currentInvoice"
    />

    <TabContainer
      v-if="currentInvoice"
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
                  v-if="notEmpty(currentInvoice) && notEmpty(currentInvoice[field])"
                >
                  {{ inputValue(field, currentInvoice, includeKeys, dataFields, systemConfigs) }}
                </span>

                <span
                  v-if="isEmpty(currentInvoice) || isEmpty(currentInvoice[field])"
                >
                  --- no value ---
                </span>
              </div> <!-- field-value -->
            </div> <!-- data-field -->
          </div> <!-- data-row -->
        </div> <!-- details-container -->
      </template> <!-- template-0 -->

      <template #tab-1>
        <InvoiceLines
          v-if="selectedTab === 1"
          :invoice-id="invoiceId"
        />
      </template> <!-- template-1 -->

      <template #tab-2>
        <TemplateEditor
          v-if="selectedTab === 2 && invoiceTemplate"
          :id="invoiceTemplate.id"
          template-type="invoice_templates"
          :content-markup="invoiceTemplate.contentMarkup"
          :content-styles="invoiceTemplate.contentStyles"
          :data="templateData"
          :disabled="true"
        />
      </template> <!-- template-2 -->
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
