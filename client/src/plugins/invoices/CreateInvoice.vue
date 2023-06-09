<script setup>
/** import:global **/
import { ref, computed, onMounted } from 'vue';
/** import:global **/

/** import:utils **/
import { useValidations } from '@/utils/validations';
import { useDataAccess } from '@/utils/dataAccess';
import { useInputHelper } from '@/utils/input';
import { useLogger } from '@/utils/logger';
import { useInvoiceUtils } from './utils';
/** import:utils **/

/** import:stores **/
import { useBannerStore } from '@/stores/banner';
/** import:stores **/

/** import:components **/
import {
  TInput,
  TSelect,
  TTable
} from 'coffeebrew-vue-components';

import WorkflowContainer from '@/components/WorkflowContainer.vue';
import DataForm from '@/components/DataForm.vue';
import TemplateEditor from '@/components/TemplateEditor.vue';
/** import:components **/

/** section:utils **/
const { isEmpty, notEmpty } = useValidations();
const dataAccess = useDataAccess();
const { flashMessage } = useBannerStore();
const logger = useLogger();
/** section:utils **/

/** section:props **/
const props = defineProps({
  contactId: {
    type: String,
    default: null,
  },
});
/** section:props **/

/** section:global **/
const {
  generateDataFields,
  recordValue,
  tagLabel,
  contactLabel,
  invoiceConfigLabel,
} = useInvoiceUtils();
/** section:global **/

/** section:filters **/
const filtersData = ref({
  tags: [],
  contactId: [],
  invoiceConfigId: [],
  startTime: {
    startTime: null,
    endTime: null,
  },
  endTime: {
    startTime: null,
    endTime: null,
  },
});

const filtersDataFields = computed(() => {
  return [
    {
      key: 'contactId',
      type: 'singleSelect',
      label: 'Contact',
      reference: { label: contactLabel },
      listable: false,
      viewable: true,
      creatable: true,
      updatable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'contacts',
        value: recordValue,
        label: contactLabel,
      },
    },
    {
      key: 'invoiceConfigId',
      type: 'singleSelect',
      label: 'Invoice Config',
      reference: { label: invoiceConfigLabel },
      listable: false,
      viewable: true,
      creatable: true,
      updatable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'invoice_configs',
        value: recordValue,
        label: invoiceConfigLabel,
      },
    },
    {
      key: 'tags',
      type: 'multiSelect',
      label: 'Tags',
      reference: { label: tagLabel },
      listable: true,
      viewable: true,
      creatable: true,
      updatable: true,
      filterable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'tags',
        value: recordValue,
        label: tagLabel,
      },
    },
    {
      key: 'startTime',
      type: 'datetimerange',
      label: 'Start Time',
      defaultValue: () => { return new Date(); },
      listable: true,
      viewable: true,
      creatable: true,
      updatable: true,
      filterable: true,
      sortable: true,
    },
    {
      key: 'endTime',
      type: 'datetimerange',
      label: 'End Time',
      listable: true,
      viewable: true,
      creatable: true,
      updatable: true,
      filterable: true,
      sortable: true,
    },
  ];
});

const filtersInputHelper = useInputHelper(filtersDataFields.value);

const filtersLayout = computed(() => {
  return [
    { contactId: 'lg', invoiceConfigId: 'lg' },
    { tags: 'lg' },
    { startTime: 'md' },
    { endTime: 'md' },
  ];
});

const filterableKeys = computed(() => {
  return filtersDataFields.value.map(f => f.key);
});

const filtersErrorMessages = ref({});

function resetInvoiceData() {
  updatedInvoice.value = null;
  updatedInvoiceLines.value = [];
  invoiceTemplate.value = null;
  invoiceErrorMessages.value = {};
}

async function formatInvoice(invoice) {
  const promises = invoiceKeys.value.map((key) => {
    return invoiceHelper.formatDataForShow(key, invoice);
  });

  Promise
    .all(promises)
    .then((results) => {
      updatedInvoice.value = {};
      invoiceKeys.value.forEach((key, i) => {
        updatedInvoice.value[key] = results[i];
      });
      updatedInvoice.value.totalAmount = invoiceTotalAmount.value;
    })
    .catch((error) => {
      flashMessage(`Error generating invoice!`);
      logger.error(`Error generating invoice`, error);
    });
}

async function updateInvoiceData(result) {
  await formatInvoice(Object.assign({}, result.invoice));

  updatedInvoiceLines.value = result.invoiceLines.map((line) => {
    return formatInvoiceLine(line);
  });

  invoiceConfig.value = Object.assign({}, result.invoiceConfig);
  invoiceNumberSequence.value = Object.assign({}, result.invoiceNumberSequence);
  billingContact.value = Object.assign({}, result.billingContact);
  currency.value = Object.assign({}, result.currency);
  invoiceTemplate.value = Object.assign({}, result.invoiceTemplate);
}

async function submitFilters() {
  resetInvoiceData();
  invoiceLinesLoading.value = true;

  const params = filtersInputHelper.formatFilters(filtersData.value);
  dataAccess
    .create('invoices', params, { path: 'preview_invoice' })
    .then((result) => {
      updateInvoiceData(result);
      invoiceLinesLoading.value = false;
      currentStep.value = 1;
    })
    .catch((error) => {
      logger.error(`Error previewing invoice`, error);
      flashMessage(`Error previewing invoice!`);
    });
}

function resetFilters() {
  resetInvoiceData();

  filtersData.value = {
    contactId: [],
    tags: [],
    invoiceConfigId: [],
    startTime: {
      startTime: null,
      endTime: null,
    },
    endTime: {
      startTime: null,
      endTime: null,
    },
  };

  if (notEmpty(props.contactId)) {
    filtersData.value.contactId = [{ value: props.contactId }];
  }
}
/** section:filters **/

/** section:invoiceLines **/
const invoiceLineHeaders = [
  { key: 'description', type: 'text', label: 'Description', listable: true, creatable: true, updatable: true },
  { key: 'unitValue', type: 'number', label: 'Unit Value', listable: true, creatable: true, updatable: true },
  { key: 'unitCost', type: 'number', label: 'Unit Cost', listable: true, creatable: true, updatable: true },
  { key: 'unit', type: 'enum', label: 'Unit', listable: true, creatable: true, updatable: true },
  { key: 'subtotal', type: 'number', label: 'Subtotal', listable: true, creatable: true, updatable: true },
];

const invoiceLineHelper = useInputHelper(invoiceLineHeaders);

const updatedInvoiceLines = ref([]);

const invoiceLineTableActions = [
  {
    name: 'Create',
    icon: 'fa-solid fa-circle-plus fa-xl',
    click: async function(data) {
      await addInvoiceLine();
    },
  },
];

const invoiceLineRowActions = [
  {
    name: 'Calculate',
    icon: 'fa-solid fa-calculator',
    click: async function(row, index) {
      await calculateSubtotal(row);
    },
  },
  {
    name: 'Delete',
    icon: 'fa-solid fa-trash-can',
    click: async function(row, index) {
      await removeInvoiceLine(index);
    },
  },
];

const invoiceLinesLoading = ref(false);

const invoiceLineUnitOptions = computed(() => {
  return [
    { value: 'hour', label: 'Hour' },
    { value: 'minute', label: 'Minute' },
    { value: 'count', label: 'Count' },
    { value: 'fixed', label: 'Fixed' },
  ];
});

function addInvoiceLine() {
  invoiceLinesLoading.value = true;
  updatedInvoiceLines.value.push({
    description: null,
    unitCost: null,
    unit: null,
    unitValue: null,
    subtotal: null,
  });
  invoiceLinesLoading.value = false;
}

function removeInvoiceLine(index) {
  invoiceLinesLoading.value = true;
  updatedInvoiceLines.value.splice(index, 1);
  invoiceLinesLoading.value = false;
}

function formatInvoiceLine(line) {
  const formattedLine = {};
  formattedLine.description = line.description;
  formattedLine.unit = line.unit;
  formattedLine.unitCost = formatNumber(line.unitCost);
  formattedLine.unitValue = formatNumber(line.unitValue);

  if (isEmpty(line.subtotal)) {
    calculateSubtotal(formattedLine);
  } else {
    formattedLine.subtotal = formatNumber(line.subtotal);
  }

  return formattedLine;
}

function formatNumber(value) {
  return (value || 0).toFixed(2);
}

function calculateSubtotal(line) {
  const unitCost = line.unitCost;
  const unitValue = line.unitValue;

  if (notEmpty(unitCost) && notEmpty(unitValue)) {
    line.subtotal = formatNumber(parseFloat(unitCost) * parseFloat(unitValue));
  } else {
    line.subtotal = formatNumber(0);
  }

  updatedInvoice.value.totalAmount = invoiceTotalAmount.value;
}

const invoiceLineErrorMessages = ref([]);

function invoiceLineErrorMessage(index, field) {
  if (invoiceLineErrorMessages[index]) {
    return invoiceLineErrorMessage[index][field];
  } else {
    return ``;
  }
}
/** section:invoiceLines **/

/** section:invoice **/
const updatedInvoice = ref();

const invoiceFieldsLayout = [
  { invoiceNumber: 'lg', contactId: 'lg' },
  { invoiceDate: 'md', dueDate: 'md', totalAmount: 'md' },
  { customFields: 'md' },
  { invoiceConfigId: 'lg' },
  { currencyId: 'lg' },
];

const invoiceFieldKeys = computed(() => {
  return invoiceFieldsLayout.reduce((keys, fields) => {
    Object.keys(fields).forEach((key) => {
      keys.push(key);
    });
    return keys;
  }, []);
});

const invoiceDataFields = computed(() => {
  return generateDataFields(props.contactId);
});

const invoiceKeys = computed(() => {
  return invoiceDataFields.value.map(f => f.key);
});

const invoiceHelper = useInputHelper(invoiceDataFields.value);

const invoiceTotalAmount = computed(() => {
  const total = updatedInvoiceLines.value.reduce((sum, line) => {
    if (notEmpty(line.subtotal)) {
      return sum + parseFloat(line.subtotal);
    } else {
      return sum;
    }
  }, 0);
  return formatNumber(total);
});

const invoiceErrorMessages = ref({});
/** section:invoice **/

/** section:template **/
const invoiceTemplate = ref();
const invoiceConfig = ref();
const invoiceNumberSequence = ref();
const billingContact = ref();
const currency = ref();

const templateData = computed(() => {
  return {
    invoice: updatedInvoice.value,
    invoiceLines: updatedInvoiceLines.value,
    invoiceConfig: invoiceConfig.value,
    invoiceNumberSequence: invoiceNumberSequence.value,
    billingContact: billingContact.value,
    currency: currency.value,
  };
});
/** section:template **/

/** section:action **/
async function formatInvoiceLines() {
  return new Promise((resolve, reject) => {
    const promises = updatedInvoiceLines.value.map((line) => {
      return invoiceLineHelper.formatDataForSave(line);
    });

    Promise.all(promises)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function createInvoice() {
  await formatInvoiceLines()
    .then((results) => {
      const params = Object.assign(
        {},
        {
          invoice: invoiceHelper.formatDataForSave(updatedInvoice.value),
          invoiceNumberSequence: invoiceNumberSequence.value,
          invoiceLines: results,
        }
      );

      dataAccess
        .create('invoices', params, { path: 'generate_with_lines' })
        .then((result) => {
          updatedInvoice.value.id = result.id;
          updatedInvoiceLines.value = result.invoiceLines;
          currentStep.value = 2;
          flashMessage(`Invoice created successfully!`);
        })
        .catch((error) => {
          flashMessage(`Error creating invoice!`);
          logger.error(`Error creating invoice`, error);
        });
    })
    .catch((error) => {
      flashMessage(`Error formatting invoice for save!`);
      logger.error(`Error formatting invoice for save`, error);
    });
}
/** section:action **/

/** section:steps **/
const currentStep = ref(0);

const steps = computed(() => {
  return [
    { title: 'Filter Work Logs' },
    { title: 'Fill Invoice and Lines' },
    { title: 'Preview Invoice' },
  ];
});

async function prevStep(step) {
  if (step === 0) { // filter
    resetInvoiceData();
    currentStep.value = step;
  } else {
    // do nothing because it's not possible to come back to fill invoice
  }
}

async function nextStep(step) {
  if (step === 1) { // fill invoice
    await submitFilters();
  }
}

async function submit() {
  await createInvoice();
}
/** section:steps **/

onMounted(() => {
  resetFilters();
});
</script>

<template>
  <div class="page-container">
    <WorkflowContainer
      :steps="steps"
      :current-step-number="currentStep"
      @prev-step="prevStep"
      @next-step="nextStep"
      @submit="submit"
    >
      <template #step-0>
        <DataForm
          v-model="filtersData"
          :fields-layout="filtersLayout"
          :data-fields="filterableKeys"
          :schemas="filtersDataFields"
          :error-messages="filtersErrorMessages"
          :submittable="false"
        />
      </template> <!-- step-0:filter worklogs -->

      <template #step-1>
        <DataForm
          v-if="updatedInvoice"
          v-model="updatedInvoice"
          :fields-layout="invoiceFieldsLayout"
          :data-fields="invoiceFieldKeys"
          :schemas="invoiceDataFields"
          :error-messages="invoiceErrorMessages"
          :submittable="false"
        />

        <div class="invoice-lines-table">
          <TTable
            v-if="updatedInvoice"
            name="Invoice Lines"
            :headers="invoiceLineHeaders"
            :data="updatedInvoiceLines"
            :table-actions="invoiceLineTableActions"
            :actions="invoiceLineRowActions"
            :loading="invoiceLinesLoading"
            :pagination="{ offset: 0, limit: updatedInvoiceLines.length, client: true }"
          >
            <template #[`data-col.description`]="{ row, i }">
              <div class="data-col">
                <TInput
                  v-model="row.description"
                  type="text"
                  label=""
                  size="md"
                  :error-message="invoiceLineErrorMessage(i, 'description')"
                />
              </div>
            </template>

            <template #[`data-col.unitCost`]="{ row, i }">
              <div class="data-col">
                <TInput
                  v-model="row.unitCost"
                  type="number"
                  label=""
                  size="sm"
                  :error-message="invoiceLineErrorMessage(i, 'unitCost')"
                />
              </div>
            </template>

            <template #[`data-col.unit`]="{ row, i }">
              <div class="data-col">
                <TSelect
                  v-model="row.unit"
                  type="text"
                  label=""
                  size="sm"
                  :options="invoiceLineUnitOptions"
                  :error-message="invoiceLineErrorMessage(i, 'unit')"
                />
              </div>
            </template>

            <template #[`data-col.unitValue`]="{ row, i }">
              <div class="data-col">
                <TInput
                  v-model="row.unitValue"
                  type="number"
                  label=""
                  size="sm"
                  :error-message="invoiceLineErrorMessage(i, 'unitValue')"
                />
              </div>
            </template>

            <template #[`data-col.subtotal`]="{ row, i }">
              <div class="data-col">
                <TInput
                  v-model="row.subtotal"
                  type="number"
                  label=""
                  size="sm"
                  :error-message="invoiceLineErrorMessage(i, 'subtotal')"
                />
              </div>
            </template>

            <template #pagination="{ total }">
              Total Lines: {{ total }}
            </template>
          </TTable>
        </div> <!-- invoice-lines-table -->
      </template> <!-- step-1:invoice and lines -->

      <template #step-2>
        <TemplateEditor
          v-if="invoiceTemplate"
          :id="invoiceTemplate.id"
          template-type="invoice_templates"
          :content-markup="invoiceTemplate.contentMarkup"
          :content-styles="invoiceTemplate.contentStyles"
          :data="templateData"
          :disabled="true"
        />
      </template> <!-- step-2:preview invoice -->
    </WorkflowContainer>
  </div>
</template>

<style scoped>
.data-col {
  padding: 1rem 0;
}

.invoice-lines-table {
  width: 100%;
  overflow: auto;
}

.actions {
  margin-top: 1rem;
  padding-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}
</style>
