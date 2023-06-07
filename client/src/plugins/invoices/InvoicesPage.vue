<script setup>
import { computed } from 'vue';
import DataPage from '@/components/DataPage.vue';
import { useRouter } from 'vue-router';

import { useInvoiceUtils } from './utils';
const router = useRouter();

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
</script>

<template>
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
    <template #[`highlight.invoiceNumber`]="{ formattedValue }">
      Invoice Number {{ formattedValue.toString().padStart(6, '0') }}
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
</template>
