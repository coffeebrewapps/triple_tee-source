<script setup>
/** import:global **/
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
/** import:global **/

/** import:utils **/
import { useInputHelper } from '@/utils/input';
import { useDataAccess } from '@/utils/dataAccess';
import { useValidations } from '@/utils/validations';
import { useContactUtils } from './utils';
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
import InvoiceConfigs from '@/plugins/invoice_configs/InvoiceConfigs.vue';
import ReceiptConfigs from '@/plugins/receipt_configs/ReceiptConfigs.vue';
import BillingConfigs from '@/plugins/billing_configs/BillingConfigs.vue';
import InvoicesPage from '@/plugins/invoices/InvoicesPage.vue';
import ReceiptsPage from '@/plugins/receipts/ReceiptsPage.vue';
/** import:components **/

/** section:utils **/
const router = useRouter();
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
const events = useEventsStore();
const { flashMessage } = useBannerStore();
const systemConfigs = useSystemConfigsStore();
/** section:utils **/

/** section:global **/
const currentRoute = Object.assign({}, router.currentRoute.value);

const contactId = computed(() => {
  return currentRoute.params.id;
});

const currentContact = ref();

const heading = computed(() => {
  if (currentContact.value) {
    return `Contact: ${currentContact.value.name}`;
  } else {
    return `Loading Contact...`;
  }
});

async function loadContact() {
  currentContact.value = null;
  const params = { include: includeKeys.value };

  await dataAccess
    .view(`contacts`, contactId.value, params)
    .then((result) => {
      currentContact.value = result;
      flashMessage(`Loaded contact successfully!`);
    })
    .catch((error) => {
      console.error(error);
      flashMessage(`Error loading contact!`);
    });
}
/** section:global **/

/** section:tabs **/
const selectedTab = ref(0);
const tabs = [
  { label: 'Details', onchange: loadContact },
  { label: 'Invoice Configs', onchange: loadInvoiceConfig },
  { label: 'Receipt Configs', onchange: loadReceiptConfig },
  { label: 'Billing Configs', onchange: loadBillingConfig },
  { label: 'Invoices', onchange: loadInvoices },
  { label: 'Receipts', onchange: loadReceipts },
];

async function loadInvoiceConfig() {
  events.emitEvent('loadData', { dataType: 'Invoice Configs', filters: { billingContactId: contactId.value } });
}

async function loadReceiptConfig() {
  events.emitEvent('loadData', { dataType: 'Receipt Configs', filters: { billingContactId: contactId.value } });
}

async function loadBillingConfig() {
  events.emitEvent('loadData', { dataType: 'Billing Configs', filters: { contactId: contactId.value } });
}

async function loadInvoices() {
  events.emitEvent('loadData', { dataType: 'Invoices', filters: { contactId: contactId.value } });
}

async function loadReceipts() {
  events.emitEvent('loadData', { dataType: 'Receipts', filters: { contactId: contactId.value } });
}

async function triggerTabEvent(i) {
  await tabs[i].onchange();
  selectedTab.value = i;
}
/** section:tabs **/

onMounted(async() => {
  await loadContact();
});
</script>

<template>
  <div class="page-container">
    <h2 class="heading">
      {{ heading }}
    </h2>

    <TProgressBar
      v-if="!currentContact"
    />

    <TabContainer
      v-if="currentContact"
      :tabs="tabs"
      :selected-tab="selectedTab"
      @tab-change="triggerTabEvent"
    >
      <template #tab-0>
        <div
          v-if="selectedTab === 0"
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
      </template> <!-- template-0 -->

      <template #tab-1>
        <InvoiceConfigs
          v-if="selectedTab === 1"
          :billing-contact-id="contactId"
        />
      </template> <!-- template-1 -->

      <template #tab-2>
        <ReceiptConfigs
          v-if="selectedTab === 2"
          :billing-contact-id="contactId"
        />
      </template> <!-- template-2 -->

      <template #tab-3>
        <BillingConfigs
          v-if="selectedTab === 3"
          :contact-id="contactId"
        />
      </template> <!-- template-3 -->

      <template #tab-4>
        <InvoicesPage
          v-if="selectedTab === 4"
          :contact-id="contactId"
        />
      </template> <!-- template-4 -->

      <template #tab-5>
        <ReceiptsPage
          v-if="selectedTab === 5"
          :contact-id="contactId"
        />
      </template> <!-- template-5 -->
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

.contact-container {
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
