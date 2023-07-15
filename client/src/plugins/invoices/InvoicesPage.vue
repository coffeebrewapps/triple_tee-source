<script setup>
import { ref, computed } from 'vue';
import DataPage from '@/components/DataPage.vue';
import {
  TConfirmDialog
} from 'coffeebrew-vue-components';
import { useRouter } from 'vue-router';
import { useDataAccess } from '@/utils/dataAccess';
import { useEventsStore } from '@/stores/events';
import { useBannerStore } from '@/stores/banner';
import { useLogger } from '@/utils/logger';
import { useInvoiceUtils } from './utils';

const router = useRouter();
const dataAccess = useDataAccess();
const { flashMessage } = useBannerStore();
const events = useEventsStore();
const logger = useLogger();

const props = defineProps({
  contactId: {
    type: String,
    default: null,
  },
});
const {
  fieldsLayout,
  generateDataFields,
  validations,
  generateFilters,
} = useInvoiceUtils();

const dataFields = computed(() => {
  return generateDataFields(props.contactId);
});

const filters = computed(() => {
  return generateFilters(props.contactId);
});

const actions = {
  view: {
    click: async function(row, index) {
      await openViewPage(row);
    },
  },
  create: {
    click: async function() {
      await openCreatePage();
    },
  },
  row: {
    void: {
      name: 'Void',
      icon: 'fa-solid fa-ban',
      click: async function(row, index) {
        await openVoidDialog(row);
      },
    },
  },
};

const tableStyle = {
  oneline: true,
  showHeader: false,
  highlightField: 'invoiceNumber',
};

async function openViewPage(row) {
  router.push({ name: 'Contact View Invoice', params: { invoiceId: row.id, contactId: row.contactId } });
}

async function openCreatePage() {
  router.push({ name: 'Contact Create Invoice', params: { contactId: props.contactId } });
}

const currentRowForVoid = ref();
const voidDialog = ref(false);

async function openVoidDialog(record) {
  currentRowForVoid.value = record;
  voidDialog.value = true;
}

async function voidDataAndCloseDialog() {
  await dataAccess
    .update('invoices', currentRowForVoid.value.id, {}, { path: 'void' })
    .then((record) => {
      events.emitEvent('loadData', { dataType: 'Invoices' });
      flashMessage(`Voided invoice successfully!`);
    })
    .catch((error) => {
      logger.error(`Error voiding invoice`, error);
      flashMessage(`Error voiding invoice!`);
    })
    .finally(() => {
      closeVoidDialog();
    });
}

function closeVoidDialog() {
  voidDialog.value = false;
}
</script>

<template>
  <div class="page-container">
    <DataPage
      model-class="invoices"
      data-type="Invoices"
      :fullscreen="true"
      :fields-layout="fieldsLayout"
      :data-fields="dataFields"
      :validations="validations"
      :filters="filters"
      :actions="actions"
      :table-style="tableStyle"
    >
      <template #[`highlight.invoiceNumber`]="{ row, formattedValue }">
        Invoice Number {{ formattedValue.toString().padStart(6, '0') }}
        <span
          v-if="row.voided"
          class="tag inline"
        >Voided</span>
      </template>

      <template #[`data-col.invoiceDate`]="{ formattedValue }">
        Invoiced on <strong>{{ formattedValue }}</strong>
      </template>

      <template #[`data-col.dueDate`]="{ formattedValue }">
        Due on <strong>{{ formattedValue }}</strong>
      </template>

      <template #[`data-col.totalAmount`]="{ row, formattedValue }">
        Total
        <strong>
          {{ row.includes.currencyId[row.currencyId].code }}{{ formattedValue.toFixed(2) }}
        </strong>
      </template>
    </DataPage>

    <TConfirmDialog
      v-if="currentRowForVoid"
      v-model="voidDialog"
      title="Void Invoice"
      primary-text="Are you sure you want to void this invoice?"
      :secondary-text="`Invoice Number ${currentRowForVoid.invoiceNumber}`"
      :width="500"
      :height="350"
      class="void-dialog"
      @confirm="voidDataAndCloseDialog"
      @cancel="closeVoidDialog"
    />
  </div>
</template>
