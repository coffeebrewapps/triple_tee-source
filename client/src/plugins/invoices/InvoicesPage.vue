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
  />
</template>
