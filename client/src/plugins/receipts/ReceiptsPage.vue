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

async function openViewPage(row) {
  router.push({
    name: 'Contact View Receipt',
    params: { receiptId: row.id, invoiceId: row.invoiceId, contactId: row.contactId },
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
  >
    <template #header-row>
      <th />
    </template>

    <template #data-content="{ row, inputValue }">
      <td class="col">
        <div class="content-row">
          <div class="highlight">
            Receipt Number {{ inputValue('receiptNumber', row).toString().padStart(6, '0') }}
          </div>
          <div class="small">
            Payment of
            <strong>
              {{ row.includes.currencyId[row.currencyId].code }}{{ inputValue('paymentAmount', row).toFixed(2) }}
            </strong>
            for Invoice Number
            <strong>
              {{ row.includes.invoiceId[row.invoiceId].invoiceNumber.toString().padStart(6, '0') }}
            </strong>
            received on <strong>{{ inputValue('receiptDate', row) }}</strong>
          </div>
          <div class="small">
            Balance due
            <strong>
              {{ row.includes.currencyId[row.currencyId].code }}{{ inputValue('remainingAmount', row).toFixed(2) }}
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
