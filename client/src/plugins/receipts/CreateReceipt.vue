<script setup>
/** import:global **/
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
/** import:global **/

/** import:utils **/
import { useValidations } from '@/utils/validations';
import { useDataAccess } from '@/utils/dataAccess';
import { useInputHelper } from '@/utils/input';
import { useFormatter } from '@/utils/formatter';
import { useReceiptUtils } from './utils';
/** import:utils **/

/** import:stores **/
import { useBannerStore } from '@/stores/banner';
/** import:stores **/

/** import:components **/
import WorkflowContainer from '@/components/WorkflowContainer.vue';
import DataForm from '@/components/DataForm.vue';
import TemplateEditor from '@/components/TemplateEditor.vue';
/** import:components **/

/** section:utils **/
const router = useRouter();
const { isEmpty, notEmpty } = useValidations();
const dataAccess = useDataAccess();
const {
  formatNumber,
} = useFormatter();
const banner = useBannerStore();
/** section:utils **/

/** section:global **/
const currentRoute = Object.assign({}, router.currentRoute.value);
const invoiceId = computed(() => {
  return currentRoute.query.invoiceId;
});

const contactId = computed(() => {
  return currentRoute.query.contactId;
});

const {
  fieldsLayout,
  generateDataFields,
  recordValue,
  receiptConfigLabel,
  invoiceLabel,
  validations,
} = useReceiptUtils();
/** section:global **/

/** section:filters **/
const filtersData = ref({
  invoiceId: [],
  receiptConfigId: [],
});

if (notEmpty(invoiceId.value)) {
  filtersData.value.invoiceId = [{ value: invoiceId.value }];
}

const filtersDataFields = computed(() => {
  return [
    {
      key: 'invoiceId',
      type: 'singleSelect',
      label: 'Invoice',
      reference: { label: invoiceLabel },
      listable: false,
      viewable: true,
      creatable: true,
      updatable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'invoices',
        value: recordValue,
        label: invoiceLabel,
      },
    },
    {
      key: 'receiptConfigId',
      type: 'singleSelect',
      label: 'Receipt Config',
      reference: { label: receiptConfigLabel },
      listable: false,
      viewable: true,
      creatable: true,
      updatable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'receipt_configs',
        value: recordValue,
        label: receiptConfigLabel,
      },
    },
  ];
});

const filtersInputHelper = useInputHelper(filtersDataFields.value);

const filtersLayout = computed(() => {
  return [
    { invoiceId: 'lg', receiptConfigId: 'lg' },
  ];
});

const filterableKeys = computed(() => {
  return filtersDataFields.value.map(f => f.key);
});

const filtersErrorMessages = ref({});

function resetReceiptData() {
  updatedReceipt.value = null;
  invoice.value = null;
  currency.value = null;
  billingContact.value = null;
  receiptConfig.value = null;
  receiptNumberSequence.value = null;
  receiptTemplate.value = null;
  invoiceNumberSequence.value = null;
  receiptErrorMessages.value = {};
  originalPaymentAmount.value = 0;
}

async function formatReceipt(receipt) {
  const promises = receiptKeys.value.map((key) => {
    return receiptHelper.formatDataForShow(key, receipt);
  });

  Promise
    .all(promises)
    .then((results) => {
      updatedReceipt.value = {};
      receiptKeys.value.forEach((key, i) => {
        updatedReceipt.value[key] = results[i];
      });
    })
    .catch((error) => {
      showBanner(`Error generating receipt!`);
      console.error(error);
    });
}

async function updateReceiptData(result) {
  await formatReceipt(Object.assign({}, result.receipt));

  invoice.value = Object.assign({}, result.invoice);
  currency.value = Object.assign({}, result.currency);
  billingContact.value = Object.assign({}, result.billingContact);
  receiptConfig.value = Object.assign({}, result.receiptConfig);
  receiptNumberSequence.value = Object.assign({}, result.receiptNumberSequence);
  receiptTemplate.value = Object.assign({}, result.receiptTemplate);
  invoiceNumberSequence.value = Object.assign({}, result.invoiceNumberSequence);
}

async function submitFilters() {
  resetReceiptData();

  const params = filtersInputHelper.formatFilters(filtersData.value);
  dataAccess
    .create('income_receipts', params, { path: 'preview_receipt' })
    .then((result) => {
      updateReceiptData(result);
      currentStep.value = 1;
    })
    .catch((error) => {
      console.error(error);
      showBanner(`Error previewing receipt!`);
    });
}

function resetFilters() {
  resetReceiptData();

  filtersData.value = {
    invoiceId: [],
    receiptConfigId: [],
  };
}
/** section:filters **/

/** section:receipt **/
const updatedReceipt = ref();
const originalPaymentAmount = ref(0);

const receiptFieldsLayout = fieldsLayout;

const receiptDataFields = computed(() => {
  return generateDataFields(invoiceId.value, contactId.value);
});

const receiptFieldKeys = computed(() => {
  return creatableReceiptFields.value.map(f => f.key);
});

const notUpdatableReceiptFields = [
  'receiptNumber',
  'billableAmount',
  'paidAmount',
  'remainingAmount',
];

const creatableReceiptFields = computed(() => {
  return receiptDataFields.value.filter((field) => {
    return !notUpdatableReceiptFields.includes(field.key) && field.creatable;
  });
});

const receiptKeys = computed(() => {
  return receiptDataFields.value.map(f => f.key);
});

const receiptHelper = useInputHelper(receiptDataFields.value);

watch(updatedReceipt, (newVal, oldVal) => {
  if (isEmpty(newVal) || isEmpty(oldVal)) { return; }

  receiptErrorMessages.value = {};
  if (originalPaymentAmount.value !== newVal.paymentAmount) {
    const { billableAmount, paidAmount, paymentAmount } = updatedReceipt.value;
    const remainingAmount = billableAmount - paidAmount - paymentAmount;

    const errors = receiptHelper.validateParams(
      { remainingAmount: validations.create.remainingAmount },
      Object.assign({}, updatedReceipt.value, { paymentAmount: newVal.paymentAmount, remainingAmount })
    );

    if (Object.keys(errors).length > 0) {
      receiptErrorMessages.value = errors;
    } else {
      updatedReceipt.value.remainingAmount = parseFloat(formatNumber(remainingAmount, 2));
    }
    originalPaymentAmount.value = newVal.paymentAmount;
  }
}, { deep: true });

const receiptErrorMessages = ref({});
/** section:receipt **/

/** section:template **/
const invoice = ref();
const currency = ref();
const transaction = ref();
const billingContact = ref();
const receiptConfig = ref();
const receiptNumberSequence = ref();
const receiptTemplate = ref();
const invoiceNumberSequence = ref();

const templateData = computed(() => {
  return {
    receipt: updatedReceipt.value,
    invoice: invoice.value,
    currency: currency.value,
    transaction: transaction.value,
    billingContact: billingContact.value,
    receiptConfig: receiptConfig.value,
    receiptNumberSequence: receiptNumberSequence.value,
    invoiceNumberSequence: invoiceNumberSequence.value,
  };
});
/** section:template **/

/** section:action **/
const showTemplateEditor = ref(false);
async function createReceipt() {
  showTemplateEditor.value = false;
  const params = Object.assign(
    {},
    {
      receipt: receiptHelper.formatDataForSave(updatedReceipt.value),
      receiptConfigId: receiptConfig.value.id,
    }
  );

  await dataAccess
    .create('income_receipts', params, { path: 'generate_with_transaction' })
    .then((result) => {
      updatedReceipt.value.id = result.id;
      transaction.value = result.transaction;
      showTemplateEditor.value = true;
      currentStep.value = 2;
      showBanner(`Receipt created successfully!`);
    })
    .catch((error) => {
      showBanner(`Error creating receipt!`);
      console.error(error);
    });
}
/** section:action **/

/** section:banner **/
function showBanner(message) {
  banner.show(message);
  setTimeout(hideBanner, 5000);
}

function hideBanner() {
  banner.hide();
}
/** section:banner **/

/** section:steps **/
const currentStep = ref(0);

const steps = computed(() => {
  return [
    { title: 'Select Invoice' },
    { title: 'Fill Receipt' },
    { title: 'Preview Receipt' },
  ];
});

async function prevStep(step) {
  if (step === 0) { // filter
    resetReceiptData();
    currentStep.value = step;
  } else {
    // do nothing because it's not possible to come back to fill receipt
  }
}

async function nextStep(step) {
  if (step === 1) { // fill receipt
    await submitFilters();
  }
}

async function submit() {
  await createReceipt();
}
/** section:steps **/

onMounted(() => {
  resetFilters();
});
</script>

<template>
  <div class="page-container">
    <h3 class="heading">
      Create Receipt
    </h3>

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
      </template> <!-- step-0:select receipt -->

      <template #step-1>
        <DataForm
          v-if="updatedReceipt"
          v-model="updatedReceipt"
          :fields-layout="receiptFieldsLayout"
          :data-fields="receiptFieldKeys"
          :schemas="receiptDataFields"
          :error-messages="receiptErrorMessages"
          :submittable="false"
        />
      </template> <!-- step-1:receipt -->

      <template #step-2>
        <TemplateEditor
          v-if="showTemplateEditor"
          :id="receiptTemplate.id"
          template-type="receipt_templates"
          :content-markup="receiptTemplate.contentMarkup"
          :content-styles="receiptTemplate.contentStyles"
          :data="templateData"
          :disabled="true"
        />
      </template> <!-- step-2:preview receipt -->
    </WorkflowContainer>
  </div>
</template>

<style scoped>
.page-container .heading {
  margin: 1rem 0;
  font-weight: 900;
}

.data-col {
  padding: 1rem 0;
}

.actions {
  margin-top: 1rem;
  padding-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}
</style>
