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
  >
    <template #header-row>
      <th />
    </template>

    <template #data-content="{ row, inputValue }">
      <td class="col">
        <div class="content-row">
          <div class="highlight">
            Invoice Number {{ inputValue('invoiceNumber', row).toString().padStart(6, '0') }}
          </div>
          <div class="small">
            Invoiced on <strong>{{ inputValue('invoiceDate', row) }}</strong>
          </div>
          <div class="small">
            Due on <strong>{{ inputValue('dueDate', row) }}</strong>
          </div>
          <div class="small">
            Total
            <strong>
              {{ row.includes.currencyId[row.currencyId].code }}{{ inputValue('totalAmount', row).toFixed(2) }}
            </strong>
          </div>
        </div>
      </td>
    </template>
  </DataPage>
</template>

<style scoped>
.col {
  text-align: left;
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  width: 100%;
}

.content-row {
  display: flex;
  flex-direction: column;
}

.highlight {
  font-weight: 900;
}

.small {
  font-size: 0.8rem;
}

.small strong {
  font-weight: 600;
}
</style>
