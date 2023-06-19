<script setup>
import { computed } from 'vue';
import DataPage from '@/components/DataPage.vue';
import { useRouter } from 'vue-router';
import { useReceiptUtils } from './utils';

const router = useRouter();

const props = defineProps({
  invoiceId: {
    type: String,
    default: null,
  },
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
} = useReceiptUtils();

const dataFields = computed(() => {
  return generateDataFields(props.invoiceId, props.contactId);
});

const filters = computed(() => {
  return generateFilters(props.invoiceId, props.contactId);
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
};

const tableStyle = {
  oneline: true,
  showHeader: false,
  highlightField: 'receiptNumber',
};

async function openViewPage(row) {
  router.push({
    name: 'Contact View Receipt',
    params: { receiptId: row.id, contactId: row.contactId },
  });
}

async function openCreatePage() {
  router.push({
    name: 'Contact Create Receipt',
    params: { contactId: props.contactId },
  });
}
</script>

<template>
  <DataPage
    model-class="income_receipts"
    data-type="Receipts"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
    :actions="actions"
    :table-style="tableStyle"
  >
    <template #[`highlight.receiptNumber`]="{ formattedValue }">
      Receipt Number {{ formattedValue.toString().padStart(6, '0') }}
    </template>

    <template #[`data-col.paymentAmount`]="{ row, formattedValue, inputValue }">
      Payment of
      <strong>
        {{ row.includes.currencyId[row.currencyId].code }}{{ formattedValue.toFixed(2) }}
      </strong>
      for Invoice Number
      <strong>
        {{ row.includes.invoiceId[row.invoiceId].invoiceNumber.toString().padStart(6, '0') }}
      </strong>
      received on <strong>{{ inputValue('receiptDate', row) }}</strong>
    </template>

    <template #[`data-col.remainingAmount`]="{ row, formattedValue }">
      Balance due
      <strong>
        {{ row.includes.currencyId[row.currencyId].code }}{{ formattedValue.toFixed(2) }}
      </strong>
    </template>
  </DataPage>
</template>
