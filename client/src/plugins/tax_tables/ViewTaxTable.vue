<script setup>
/** import:global **/
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
/** import:global **/

/** import:utils **/
import { useDataAccess } from '@/utils/dataAccess';
import { useInputHelper } from '@/utils/input';

import { useTaxTableUtils } from './utils';
import { useTaxTierUtils } from '@/plugins/tax_tiers/utils';
/** import:utils **/

/** import:stores **/
import { useBannerStore } from '@/stores/banner';
/** import:stores **/

/** import:components **/
import {
  TInput,
  TTable
} from 'coffeebrew-vue-components';

import ViewPage from '@/components/ViewPage.vue';
/** import:components **/

/** section:utils **/
const router = useRouter();
const dataAccess = useDataAccess();
const { flashMessage } = useBannerStore();
/** section:utils **/

/** section:global **/
const currentRoute = Object.assign({}, router.currentRoute.value);

const taxTableId = computed(() => {
  return currentRoute.params.id;
});

const heading = computed(() => {
  if (currentTaxTable.value) {
    return `Tax Table: ${currentTaxTable.value.description}`;
  } else {
    return `Tax Table`;
  }
});
/** section:global **/

/** section:taxTable **/
const taxTableUtils = useTaxTableUtils();

const taxTableFieldsLayout = computed(() => {
  return taxTableUtils.fieldsLayout;
});

const taxTableDataFields = computed(() => {
  return taxTableUtils.dataFields;
});

const taxTableHelper = useInputHelper(taxTableDataFields.value);

const currentTaxTable = ref();

async function loadTaxTable() {
  currentTaxTable.value = null;
  const params = { include: taxTableHelper.includeKeys.value };

  await dataAccess
    .view('tax_tables', taxTableId.value, params)
    .then((result) => {
      currentTaxTable.value = result;
      flashMessage(`Loaded tax table successfully!`);
    })
    .catch((error) => {
      console.error(error);
      flashMessage(`Error loading tax table!`);
    });
}
/** section:taxTable **/

/** section:taxTiers **/
const taxTierUtils = useTaxTierUtils();

const taxTierDataFields = computed(() => {
  const fields = taxTierUtils.generateDataFields(taxTableId.value);
  const taxTableFieldIndex = fields.findIndex(f => f.key === 'taxTableId');
  fields.splice(taxTableFieldIndex, 1);
  const idFieldIndex = fields.findIndex(f => f.key === 'id');
  fields.splice(idFieldIndex, 1);
  return fields;
});

const taxTierHelper = useInputHelper(taxTierDataFields.value);

const updatableTaxTierKeys = taxTierHelper.updatableKeys;

const currentTaxTiers = ref([]);
const taxTiersEditable = ref([]);
const taxTiersLoading = ref(false);

async function loadTaxTiers() {
  taxTiersLoading.value = true;
  currentTaxTiers.value = [];
  taxTiersEditable.value = [];

  await dataAccess
    .list('tax_tiers', { filters: { taxTableId: taxTableId.value }, sort: { field: 'minIncome', order: 'asc' } })
    .then((results) => {
      currentTaxTiers.value = results.data;
      taxTiersEditable.value = results.data.map(d => false);
      flashMessage(`Loaded tax tiers successfully!`);
    })
    .catch((error) => {
      console.error(error);
      flashMessage(`Error loading tax tiers!`);
    })
    .finally(() => {
      taxTiersLoading.value = false;
    });
}

const taxTiersTableActions = [
  {
    name: 'Add',
    icon: 'fa-solid fa-circle-plus fa-xl',
    click: async function(data) {
      await addTaxTier();
    },
  },
];

const taxTiersRowActions = [
  {
    name: 'Edit',
    icon: 'fa-solid fa-pencil',
    click: async function(row, index) {
      taxTiersEditable.value[index] = true;
    },
    show: function(row, index) {
      return !taxTiersEditable.value[index];
    },
  },
  {
    name: 'Save',
    icon: 'fa-solid fa-check',
    click: async function(row, index) {
      await saveTaxTier(row, index);
      taxTiersEditable.value[index] = false;
    },
    show: function(row, index) {
      return taxTiersEditable.value[index];
    },
  },
  {
    name: 'Cancel',
    icon: 'fa-solid fa-xmark',
    click: async function(row, index) {
      taxTiersEditable.value[index] = false;
    },
    show: function(row, index) {
      return taxTiersEditable.value[index];
    },
  },
];

async function addTaxTier() {
  currentTaxTiers.value.push({
    id: null,
    minIncome: null,
    maxIncome: null,
    maxPayableAmount: null,
    rate: null,
    taxTableId: taxTableId.value,
  });
  taxTiersEditable.value.push(true);
}

function formatTierForSave(tier) {
  const tierForSave = updatableTaxTierKeys.value.reduce((o, key) => {
    o[key] = tier[key];
    return o;
  }, {});
  return taxTierHelper.formatDataForSave(tierForSave);
}

async function saveTaxTier(row, index) {
  const formattedTier = formatTierForSave(row);

  if (row.id) {
    await dataAccess
      .update('tax_tiers', row.id, Object.assign({}, formattedTier, { taxTableId: taxTableId.value }))
      .then((result) => {
        loadTaxTiers();
        flashMessage(`Saved tax tier ${row.id} successfully!`);
      })
      .catch((error) => {
        console.error(error);
        flashMessage(`Error saving tax tier ${row.id}!`);
      });
  } else {
    await dataAccess
      .create('tax_tiers', Object.assign({}, formattedTier, { taxTableId: taxTableId.value }))
      .then((result) => {
        loadTaxTiers();
        flashMessage(`Saved tax tier successfully!`);
      })
      .catch((error) => {
        console.error(error);
        flashMessage(`Error saving tax tier!`);
      });
  }
}

function formatRate(rate) {
  return (rate * 100).toFixed(2);
}
/** section:taxTiers **/

onMounted(async() => {
  await loadTaxTable();
  await loadTaxTiers();
});
</script>

<template>
  <div class="page-container">
    <ViewPage
      v-if="currentTaxTable"
      :heading="heading"
      :fields-layout="taxTableFieldsLayout"
      :data-fields="taxTableDataFields"
      :data="currentTaxTable"
    />

    <div class="divider" />

    <TTable
      v-if="currentTaxTable"
      name="Tax Tiers"
      :headers="taxTierDataFields"
      :data="currentTaxTiers"
      :table-actions="taxTiersTableActions"
      :actions="taxTiersRowActions"
      :loading="taxTiersLoading"
      :pagination="{ offset: 0, limit: currentTaxTiers.length, client: true }"
    >
      <template #[`data-col.minIncome`]="{ row, i }">
        <div
          v-if="taxTiersEditable[i]"
        >
          <TInput
            v-model="row.minIncome"
            type="number"
            label=""
            size="sm"
            :error-message="''"
          />
        </div>
      </template> <!-- minIncome -->

      <template #[`data-col.maxIncome`]="{ row, i }">
        <div
          v-if="taxTiersEditable[i]"
        >
          <TInput
            v-model="row.maxIncome"
            type="number"
            label=""
            size="sm"
            :error-message="''"
          />
        </div>
      </template> <!-- maxIncome -->

      <template #[`data-col.maxPayableAmount`]="{ row, i }">
        <div
          v-if="taxTiersEditable[i]"
        >
          <TInput
            v-model="row.maxPayableAmount"
            type="number"
            label=""
            size="sm"
            :error-message="''"
          />
        </div>
      </template> <!-- maxPayableAmount -->

      <template #[`data-col.rate`]="{ row, i }">
        <div
          v-if="taxTiersEditable[i]"
        >
          <TInput
            v-model="row.rate"
            type="number"
            label=""
            size="sm"
            :error-message="''"
          />
        </div>

        <div
          v-if="!taxTiersEditable[i]"
        >
          {{ formatRate(row.rate) }}%
        </div>
      </template> <!-- rate -->

      <template #data-actions="{ row, actions, i }">
        <div class="actions">
          <div
            v-for="(action, j) in actions"
            :key="j"
          >
            <div
              v-if="action.show(row, i)"
              class="action"
              @click="action.click(row, i)"
            >
              <i :class="action.icon" />
              <span
                class="tooltip"
              >
                {{ action.name }}
              </span>
            </div> <!-- action -->
          </div> <!-- v-for -->
        </div> <!-- actions -->
      </template> <!-- row-actions -->

      <template #pagination>
        <div />
      </template>
    </TTable>
  </div> <!-- page-container -->
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action:hover {
  cursor: pointer;
}

.action .tooltip {
  visibility: hidden;
  padding: 4px;
  position: absolute;
  left: 10px;
  bottom: -1rem;
  z-index: 1;
  background-color: var(--color-border-hover);
  color: var(--color-text);
  font-size: 0.8rem;
  border-radius: 4px;
}

.action:hover .tooltip {
  visibility: visible;
}
</style>
