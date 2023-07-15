<script setup>
/** import:global **/
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
/** import:global **/

/** import:utils **/
import { useDataAccess } from '@/utils/dataAccess';
import { useInputHelper } from '@/utils/input';
import { useValidations } from '@/utils/validations';
import { useErrors } from '@/utils/errors';
import { useLogger } from '@/utils/logger';
import { useFormatter } from '@/utils/formatter';

import { useTaxTableUtils } from './utils';
import { useTaxTierUtils } from '@/plugins/tax_tiers/utils';
import { useTaxDeductibleUtils } from '@/plugins/tax_deductibles/utils';
/** import:utils **/

/** import:stores **/
import { useBannerStore } from '@/stores/banner';
import { useSystemConfigsStore } from '@/stores/systemConfigs';
/** import:stores **/

/** import:components **/
import {
  TButton,
  TConfirmDialog,
  TInput,
  TSelect,
  TSelectTable,
  TTable
} from 'coffeebrew-vue-components';

import ViewPage from '@/components/ViewPage.vue';
/** import:components **/

/** section:utils **/
const router = useRouter();
const dataAccess = useDataAccess();
const { notEmpty } = useValidations();
const errorsMap = useErrors();
const { flashMessage } = useBannerStore();
const logger = useLogger();
const formatter = useFormatter();
const { getSystemConfigs } = useSystemConfigsStore();
const systemConfigs = getSystemConfigs();
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
      logger.error(`Error loading tax table`, error);
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

const taxTierValidations = taxTierUtils.validations.create;
const taxTierHelper = useInputHelper(taxTierDataFields.value);

const updatableTaxTierKeys = taxTierHelper.updatableKeys;

const currentTaxTiers = ref([]);
const taxTiersEditable = ref([]);
const taxTiersLoading = ref(false);
const taxTiersValidationErrors = ref([]);

const currentTierForDelete = ref();
const deleteTierDialogPrimaryText = ref('');
const deleteTierDialog = ref(false);

async function loadTaxTiers() {
  taxTiersLoading.value = true;
  currentTaxTiers.value = [];
  taxTiersEditable.value = [];
  taxTiersValidationErrors.value = [];

  await dataAccess
    .list('tax_tiers', { filters: { taxTableId: taxTableId.value }, sort: { field: 'minIncome', order: 'asc' } })
    .then((results) => {
      currentTaxTiers.value = results.data;
      taxTiersEditable.value = results.data.map(d => false);
      taxTiersValidationErrors.value = taxTiersEditable.value.map(t => '');
      flashMessage(`Loaded tax tiers successfully!`);
    })
    .catch((error) => {
      logger.error(`Error loading tax tiers`, error);
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
  {
    name: 'Delete',
    icon: 'fa-solid fa-trash-can',
    click: async function(row, index) {
      await openDeleteTierDialog(row, index);
    },
    show: function(row, index) {
      return true;
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
  taxTiersValidationErrors.value.push({});
}

function formatTierForSave(tier) {
  const tierForSave = updatableTaxTierKeys.value.reduce((o, key) => {
    o[key] = tier[key];
    return o;
  }, {});
  return taxTierHelper.formatDataForSave(tierForSave);
}

function formatTierFieldErrorMessage(index, field) {
  const errorMessage = (taxTiersValidationErrors.value[index][field] || []).map((error) => {
    return errorsMap[error.name](error.params);
  }).join(', ');
  return errorMessage;
}

async function saveTaxTier(row, index) {
  const formattedTier = formatTierForSave(row);
  taxTiersValidationErrors.value[index] = {};
  const validationErrors = taxTierHelper.validateParams(taxTierValidations, formattedTier);

  if (Object.keys(validationErrors).length > 0) {
    taxTiersValidationErrors.value[index] = validationErrors;
    return;
  }

  if (row.id) {
    await dataAccess
      .update('tax_tiers', row.id, Object.assign({}, formattedTier, { taxTableId: taxTableId.value }))
      .then((result) => {
        loadTaxTiers();
        taxTiersEditable.value[index] = false;
        flashMessage(`Saved tax tier ${row.id} successfully!`);
      })
      .catch((error) => {
        logger.error(`Error saving tax tier ${row.id}`, error);
        flashMessage(`Error saving tax tier ${row.id}!`);
      });
  } else {
    await dataAccess
      .create('tax_tiers', Object.assign({}, formattedTier, { taxTableId: taxTableId.value }))
      .then((result) => {
        loadTaxTiers();
        taxTiersEditable.value[index] = false;
        flashMessage(`Saved tax tier successfully!`);
      })
      .catch((error) => {
        logger.error(`Error saving tax tier`, error);
        flashMessage(`Error saving tax tier!`);
      });
  }
}

async function openDeleteTierDialog(row, index) {
  currentTierForDelete.value = index;
  deleteTierDialog.value = true;
  deleteTierDialogPrimaryText.value = `Are you sure you want to delete tier row ${index + 1}?`;
}

async function deleteTierAndCloseDialog() {
  const index = currentTierForDelete.value;
  const tier = currentTaxTiers.value[index];
  if (tier.id) {
    await dataAccess
      .remove('tax_tiers', tier.id)
      .then((result) => {
        loadTaxTiers();
        flashMessage(`Deleted tax tier successfully!`);
      })
      .catch((error) => {
        logger.error(`Error deleting tax tier`, error);
        flashMessage(`Error deleting tax tier!`);
      });
  } else {
    currentTaxTiers.value.splice(index, 1);
  }

  closeDeleteTierDialog();
}

function closeDeleteTierDialog() {
  deleteTierDialog.value = false;
  currentTierForDelete.value = null;
}

function formatRate(rate) {
  return (rate * 100).toFixed(2);
}
/** section:taxTiers **/

/** section:taxDeductibles **/
const taxDeductibleUtils = useTaxDeductibleUtils();

const taxDeductibleDataFields = computed(() => {
  const fields = taxDeductibleUtils.generateDataFields(taxTableId.value);
  const taxTableFieldIndex = fields.findIndex(f => f.key === 'taxTableId');
  fields.splice(taxTableFieldIndex, 1);
  const idFieldIndex = fields.findIndex(f => f.key === 'id');
  fields.splice(idFieldIndex, 1);
  return fields;
});

const taxDeductibleValidations = taxDeductibleUtils.validations.create;
const taxDeductibleHelper = useInputHelper(taxDeductibleDataFields.value);
const taxDeductibleSchemasMap = taxDeductibleHelper.schemasMap;
const taxDeductiblesTableName = computed(() => {
  if (notEmpty(estimatedTax.value)) {
    return `Tax Deductibles (Total Deductible: ${estimatedTax.value.totalDeductible})`;
  } else {
    return `Tax Deductibles`;
  }
});

const updatableTaxDeductibleKeys = taxDeductibleHelper.updatableKeys;

const currentTaxDeductibles = ref([]);
const taxDeductiblesEditable = ref([]);
const taxDeductiblesLoading = ref(false);
const taxDeductiblesValidationErrors = ref([]);

const currentDeductibleForDelete = ref();
const deleteDeductibleDialogPrimaryText = ref('');
const deleteDeductibleDialog = ref(false);

const deductibleInputOptionsData = ref({});
const taxDeductibleOptions = ref([]);
function taxDeductibleType(row) {
  const found = taxDeductibleOptions.value.find((option) => {
    return row.rateType === option.value;
  });
  if (found) {
    return found.label;
  } else {
    return row.rateType;
  }
}

const deductibleFieldOffsetChange = computed(() => {
  return ['includeTags', 'excludeTags'].reduce((o, k) => {
    o[k] = (offset) => { deductibleOffsetChange(k, offset); };
    return o;
  }, {});
});

async function deductibleOffsetChange(field, newOffset) {
  const limit = taxDeductibleSchemasMap.value[field].limit || 5;
  await taxDeductibleHelper.fetchOptions(field, newOffset)
    .then((result) => {
      deductibleInputOptionsData.value[field] = taxDeductibleHelper.formatInputOptionsData(
        field, newOffset, limit, result
      );
    });
}

function formatDeductibleRateOptions(fields) {
  const enums = fields.rateType.enums;
  return Object.keys(enums).map((e) => {
    return { value: e, label: enums[e] };
  });
}

function tagStyle(row, tag, field) {
  return formatter.tagStyle(row, tag, field);
}

function formatTag(row, tag, field) {
  return formatter.formatTagSync(row, tag, field, systemConfigs.tagFormat);
}

function formatTransactionType(type) {
  const options = taxDeductibleSchemasMap.value.transactionTypes.options;
  const found = options.find(o => o.value === type);
  if (found) {
    return found.label;
  } else {
    return type;
  }
}

async function loadDeductibleSchemas() {
  await dataAccess
    .schemas('tax_deductibles')
    .then((result) => {
      const fields = result.fields;
      taxDeductibleOptions.value = formatDeductibleRateOptions(fields);
    })
    .catch((error) => {
      logger.error(`Error loading deductible schemas`, error);
      flashMessage(`Error loading deductible schemas!`);
    });
}

async function loadTaxDeductibles() {
  taxDeductiblesLoading.value = true;
  currentTaxDeductibles.value = [];
  taxDeductiblesEditable.value = [];
  taxDeductiblesValidationErrors.value = [];

  await dataAccess
    .list('tax_deductibles', { filters: { taxTableId: taxTableId.value }, include: ['includeTags', 'excludeTags'] })
    .then((results) => {
      currentTaxDeductibles.value = results.data;
      taxDeductiblesEditable.value = results.data.map(d => false);
      taxDeductiblesValidationErrors.value = taxDeductiblesEditable.value.map(t => '');
      flashMessage(`Loaded tax deductibles successfully!`);
    })
    .catch((error) => {
      logger.error(`Error loading tax deductibles`, error);
      flashMessage(`Error loading tax deductibles!`);
    })
    .finally(() => {
      taxDeductiblesLoading.value = false;
    });
}

const taxDeductiblesTableActions = [
  {
    name: 'Add',
    icon: 'fa-solid fa-circle-plus fa-xl',
    click: async function(data) {
      await addTaxDeductible();
    },
  },
];

const taxDeductiblesRowActions = [
  {
    name: 'Edit',
    icon: 'fa-solid fa-pencil',
    click: async function(row, index) {
      taxDeductiblesEditable.value[index] = true;
      const promises = Object.keys(row).map((key) => {
        return taxDeductibleHelper.formatDataForShow(key, row);
      });

      Promise.all(promises)
        .then((results) => {
          Object.keys(row).forEach((key, i) => {
            row[key] = results[i];
          });
        });
    },
    show: function(row, index) {
      return !taxDeductiblesEditable.value[index];
    },
  },
  {
    name: 'Save',
    icon: 'fa-solid fa-check',
    click: async function(row, index) {
      await saveTaxDeductible(row, index);
    },
    show: function(row, index) {
      return taxDeductiblesEditable.value[index];
    },
  },
  {
    name: 'Cancel',
    icon: 'fa-solid fa-xmark',
    click: async function(row, index) {
      taxDeductiblesEditable.value[index] = false;
      await loadTaxDeductibles();
    },
    show: function(row, index) {
      return taxDeductiblesEditable.value[index];
    },
  },
  {
    name: 'Delete',
    icon: 'fa-solid fa-trash-can',
    click: async function(row, index) {
      await openDeleteDeductibleDialog(row, index);
    },
    show: function(row, index) {
      return true;
    },
  },
];

async function addTaxDeductible() {
  currentTaxDeductibles.value.push({
    id: null,
    category: null,
    description: null,
    type: null,
    rate: null,
    maxDeductibleAmount: null,
    includeTags: [],
    excludeTags: [],
    taxTableId: taxTableId.value,
  });
  taxDeductiblesEditable.value.push(true);
  taxDeductiblesValidationErrors.value.push({});
}

function formatDeductibleForSave(deductible) {
  const deductibleForSave = updatableTaxDeductibleKeys.value.reduce((o, key) => {
    o[key] = deductible[key];
    return o;
  }, {});
  return taxDeductibleHelper.formatDataForSave(deductibleForSave);
}

function formatDeductibleFieldErrorMessage(index, field) {
  const errorMessage = (taxDeductiblesValidationErrors.value[index][field] || []).map((error) => {
    return errorsMap[error.name](error.params);
  }).join(', ');
  return errorMessage;
}

async function saveTaxDeductible(row, index) {
  const formattedDeductible = formatDeductibleForSave(row);
  taxDeductiblesValidationErrors.value[index] = {};
  const validationErrors = taxDeductibleHelper.validateParams(taxDeductibleValidations, formattedDeductible);

  if (Object.keys(validationErrors).length > 0) {
    taxDeductiblesValidationErrors.value[index] = validationErrors;
    return;
  }

  if (row.id) {
    await dataAccess
      .update('tax_deductibles', row.id, Object.assign({}, formattedDeductible, { taxTableId: taxTableId.value }))
      .then((result) => {
        loadTaxDeductibles();
        taxDeductiblesEditable.value[index] = false;
        flashMessage(`Saved tax deductible ${row.id} successfully!`);
      })
      .catch((error) => {
        logger.error(`Error saving tax deductible ${row.id}`, error);
        flashMessage(`Error saving tax deductible ${row.id}!`);
      });
  } else {
    await dataAccess
      .create('tax_deductibles', Object.assign({}, formattedDeductible, { taxTableId: taxTableId.value }))
      .then((result) => {
        loadTaxDeductibles();
        taxDeductiblesEditable.value[index] = false;
        flashMessage(`Saved tax deductible successfully!`);
      })
      .catch((error) => {
        logger.error(`Error saving tax deductible`, error);
        flashMessage(`Error saving tax deductible!`);
      });
  }
}

async function openDeleteDeductibleDialog(row, index) {
  currentDeductibleForDelete.value = index;
  deleteDeductibleDialog.value = true;
  deleteDeductibleDialogPrimaryText.value = `Are you sure you want to delete deductible row ${index + 1}?`;
}

async function deleteDeductibleAndCloseDialog() {
  const index = currentDeductibleForDelete.value;
  const deductible = currentTaxDeductibles.value[index];
  if (deductible.id) {
    await dataAccess
      .remove('tax_deductibles', deductible.id)
      .then((result) => {
        loadTaxDeductibles();
        flashMessage(`Deleted tax deductible successfully!`);
      })
      .catch((error) => {
        logger.error(`Error deleting tax deductible`, error);
        flashMessage(`Error deleting tax deductible!`);
      });
  } else {
    currentTaxDeductibles.value.splice(index, 1);
  }

  closeDeleteDeductibleDialog();
}

function closeDeleteDeductibleDialog() {
  deleteDeductibleDialog.value = false;
  currentDeductibleForDelete.value = null;
}
/** section:taxDeductibles **/

/** section:estimateTax **/
const estimatedTax = ref();
const estimateTaxErrorMessage = ref();

async function estimateTax() {
  estimatedTax.value = null;
  estimateTaxErrorMessage.value = null;

  await dataAccess
    .view('tax_tables', taxTableId.value, {}, { path: 'estimate' })
    .then((result) => {
      estimatedTax.value = result;
      flashMessage(`Estimated tax successfully!`);
    })
    .catch((error) => {
      estimateTaxErrorMessage.value = Object.entries(error).map(([field, errors]) => {
        return errors.map((fieldError) => {
          return `${field} ${errorsMap[fieldError]()}`;
        }).join('\n');
      }).join('\n');
      logger.error(`Error estimating tax`, error);
      flashMessage(`Error estimating tax!`);
    });
}

function tierPayable(tier) {
  return (
    notEmpty(estimatedTax.value) &&
    notEmpty(estimatedTax.value.incomeBracket) &&
    estimatedTax.value.incomeBracket.id === tier.id
  );
}
/** section:estimateTax **/

/** section:styles **/
const taxTierFieldStyles = computed(() => {
  return currentTaxTiers.value.map((tier) => {
    if (tierPayable(tier)) {
      return `row-field payable`;
    } else {
      return `row-field`;
    }
  });
});
/** section:styles **/

onMounted(async() => {
  await loadTaxTable();
  await loadTaxTiers();
  await loadTaxDeductibles();
  await loadDeductibleSchemas();
  await taxDeductibleHelper.initOptionsData()
    .then((result) => {
      deductibleInputOptionsData.value = result;
    })
    .catch((error) => {
      logger.error(error);
    });
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

    <div class="tax-table-actions">
      <TButton
        icon="fa-solid fa-calculator"
        value="Estimate Tax"
        @click="estimateTax"
      />

      <div
        v-if="estimateTaxErrorMessage"
        class="error-message"
      >
        Estimate Tax Error: {{ estimateTaxErrorMessage }}
      </div>
    </div>

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
            size="md"
            :error-message="formatTierFieldErrorMessage(i, 'minIncome')"
          />
        </div>

        <div
          v-if="!taxTiersEditable[i]"
          :class="taxTierFieldStyles[i]"
        >
          {{ parseFloat(row.minIncome).toFixed(2) }}
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
            size="md"
            :error-message="formatTierFieldErrorMessage(i, 'maxIncome')"
          />
        </div>

        <div
          v-if="!taxTiersEditable[i]"
          :class="taxTierFieldStyles[i]"
        >
          {{ parseFloat(row.maxIncome).toFixed(2) }}
          <span
            v-if="tierPayable(row)"
          >
            (Nett Income: {{ estimatedTax.nettIncome.toFixed(2) }})
          </span>
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
            size="md"
            :error-message="formatTierFieldErrorMessage(i, 'maxPayableAmount')"
          />
        </div>

        <div
          v-if="!taxTiersEditable[i]"
          :class="taxTierFieldStyles[i]"
        >
          {{ parseFloat(row.maxPayableAmount).toFixed(2) }}
          <span
            v-if="tierPayable(row)"
          >
            (Payable: {{ parseFloat(estimatedTax.payable).toFixed(2) }})
          </span>
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
            size="md"
            :error-message="formatTierFieldErrorMessage(i, 'rate')"
          />
        </div>

        <div
          v-if="!taxTiersEditable[i]"
          :class="taxTierFieldStyles[i]"
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
              class="action tooltipable"
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

    <TTable
      v-if="currentTaxTable"
      :name="taxDeductiblesTableName"
      :headers="taxDeductibleDataFields"
      :data="currentTaxDeductibles"
      :table-actions="taxDeductiblesTableActions"
      :actions="taxDeductiblesRowActions"
      :loading="taxDeductiblesLoading"
      :pagination="{ offset: 0, limit: currentTaxDeductibles.length, client: true }"
    >
      <template #[`data-col.category`]="{ row, i }">
        <div
          v-if="taxDeductiblesEditable[i]"
        >
          <TInput
            v-model="row.category"
            type="text"
            label=""
            size="md"
            :error-message="formatDeductibleFieldErrorMessage(i, 'category')"
          />
        </div>

        <div
          v-if="!taxDeductiblesEditable[i]"
          class="row-field"
        >
          {{ row.category }}
        </div>
      </template> <!-- category -->

      <template #[`data-col.description`]="{ row, i }">
        <div
          v-if="taxDeductiblesEditable[i]"
        >
          <TInput
            v-model="row.description"
            type="text"
            label=""
            size="md"
            :error-message="formatDeductibleFieldErrorMessage(i, 'description')"
          />
        </div>

        <div
          v-if="!taxDeductiblesEditable[i]"
          class="row-field"
        >
          {{ row.description }}
        </div>
      </template> <!-- description -->

      <template #[`data-col.rateType`]="{ row, i }">
        <div
          v-if="taxDeductiblesEditable[i]"
        >
          <TSelect
            v-model="row.rateType"
            label=""
            :options="taxDeductibleOptions"
            size="md"
            :error-message="formatDeductibleFieldErrorMessage(i, 'rateType')"
          />
        </div>

        <div
          v-if="!taxDeductiblesEditable[i]"
          class="row-field"
        >
          {{ taxDeductibleType(row) }}
        </div>
      </template> <!-- rateType -->

      <template #[`data-col.rate`]="{ row, i }">
        <div
          v-if="taxDeductiblesEditable[i]"
        >
          <TInput
            v-model="row.rate"
            type="number"
            label=""
            size="md"
            :error-message="formatDeductibleFieldErrorMessage(i, 'rate')"
          />
        </div>

        <div
          v-if="!taxDeductiblesEditable[i]"
          class="row-field"
        >
          <span v-if="row.rateType === 'percentage'">
            {{ formatRate(row.rate) }}%
          </span>

          <span v-else>
            {{ parseFloat(row.rate).toFixed(2) }}
          </span>
        </div>
      </template> <!-- rate -->

      <template #[`data-col.maxDeductibleAmount`]="{ row, i }">
        <div
          v-if="taxDeductiblesEditable[i]"
        >
          <TInput
            v-model="row.maxDeductibleAmount"
            type="number"
            label=""
            size="md"
            :error-message="formatDeductibleFieldErrorMessage(i, 'maxDeductibleAmount')"
          />
        </div>

        <div
          v-if="!taxDeductiblesEditable[i] && row.maxDeductibleAmount"
          class="row-field"
        >
          {{ parseFloat(row.maxDeductibleAmount).toFixed(2) }}
        </div>
      </template> <!-- maxDeductibleAmount -->

      <template #[`data-col.transactionTypes`]="{ row, i }">
        <div
          v-if="taxDeductiblesEditable[i]"
        >
          <TSelectTable
            v-if="taxDeductibleSchemasMap.transactionTypes"
            v-model="row.transactionTypes"
            label=""
            :options="taxDeductibleSchemasMap.transactionTypes.options"
            :options-length="taxDeductibleSchemasMap.transactionTypes.options.length"
            :options-loading="false"
            :pagination="{ client: true, offset: 0, limit: taxDeductibleSchemasMap.transactionTypes.options.length }"
            :error-message="formatDeductibleFieldErrorMessage(i, 'transactionTypes')"
          />
        </div>

        <div
          v-if="!taxDeductiblesEditable[i] && row.transactionTypes"
          class="row-field"
        >
          <div
            v-for="(type, t) in row.transactionTypes"
            :key="t"
            class="tag"
          >
            {{ formatTransactionType(type) }}
          </div>
        </div>
      </template> <!-- transactionTypes -->

      <template #[`data-col.includeTags`]="{ row, i }">
        <div
          v-if="taxDeductiblesEditable[i]"
        >
          <TSelectTable
            v-model="row.includeTags"
            label=""
            :multiple="false"
            :options="deductibleInputOptionsData.includeTags.data"
            :options-length="deductibleInputOptionsData.includeTags.total"
            :options-loading="deductibleInputOptionsData.includeTags.loading"
            :pagination="deductibleInputOptionsData.includeTags.pagination"
            size="md"
            :error-message="formatDeductibleFieldErrorMessage(i, 'includeTags')"
            @offset-change="deductibleFieldOffsetChange.includeTags"
          />
        </div>

        <div
          v-if="!taxDeductiblesEditable[i]"
          class="row-field"
        >
          <div
            v-for="(tag, t) in row.includeTags"
            :key="t"
            class="tag"
            :style="tagStyle(row, tag, 'includeTags')"
          >
            {{ formatTag(row, tag, 'includeTags') }}
          </div>
        </div>
      </template> <!-- includeTags -->

      <template #data-actions="{ row, actions, i }">
        <div class="actions">
          <div
            v-for="(action, j) in actions"
            :key="j"
          >
            <div
              v-if="action.show(row, i)"
              class="action tooltipable"
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

    <TConfirmDialog
      v-if="deleteTierDialog"
      v-model="deleteTierDialog"
      title="Delete Tier"
      :primary-text="deleteTierDialogPrimaryText"
      secondary-text=""
      :width="500"
      :height="250"
      class="delete-dialog"
      @confirm="deleteTierAndCloseDialog"
      @cancel="closeDeleteTierDialog"
    />

    <TConfirmDialog
      v-if="deleteDeductibleDialog"
      v-model="deleteDeductibleDialog"
      title="Delete Deductible"
      :primary-text="deleteDeductibleDialogPrimaryText"
      secondary-text=""
      :width="500"
      :height="250"
      class="delete-dialog"
      @confirm="deleteDeductibleAndCloseDialog"
      @cancel="closeDeleteDeductibleDialog"
    />
  </div> <!-- page-container -->
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tax-table-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.error-message {
  color: var(--color-error);
  font-size: 0.8rem;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action:hover {
  cursor: pointer;
}

.row-field.payable,
.row-field.payable span {
  font-weight: 900;
  font-size: 1.2rem;
}
</style>
