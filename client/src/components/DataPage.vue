<script setup>
/** import:global **/
import { ref, computed, watch, onMounted } from 'vue';
/** import:global **/

/** import:utils **/
import { useInputHelper } from '@/utils/input';
import { useFormatter } from '@/utils/formatter';
import { useErrors } from '@/utils/errors';
import { useDataAccess } from '@/utils/dataAccess';
import { useValidations } from '@/utils/validations';
/** import:utils **/

/** import:stores **/
import { useSystemConfigsStore } from '@/stores/systemConfigs';
import { useBannerStore } from '@/stores/banner';
import { useEventsStore } from '@/stores/events';
/** import:stores **/

/** import:components **/
import {
  TTable,
  TAlert,
  TConfirmDialog,
  TDialog,
  TButton
} from 'coffeebrew-vue-components';

import DataForm from '@/components/DataForm.vue';
import FormDialog from '@/components/FormDialog.vue';
import ViewDialog from '@/components/ViewDialog.vue';
/** import:components **/

/** section:props **/
const props = defineProps({
  dataType: {
    type: String,
    default: '',
  },
  modelClass: {
    type: String,
    default: null,
  },
  filters: {
    type: Object,
    default() {
      return {};
    },
  },
  dataFields: {
    type: Array,
    default() {
      return [];
    },
  },
  fieldsLayout: {
    type: Array,
    default() {
      return [];
    },
  },
  validations: {
    type: Object,
    default() {
      return {};
    },
  },
  fullscreen: {
    type: Boolean,
    default: false,
  },
  createDialogTitle: {
    type: Function,
    default: function(dataType) {
      return `Create ${dataType}`;
    },
  },
  viewDialogTitle: {
    type: Function,
    default: function(dataType, row) {
      return `View ${dataType} ${row.id}`;
    },
  },
  updateDialogTitle: {
    type: Function,
    default: function(dataType, row) {
      if (!row) { return ``; }
      return `Update ${dataType} ${row.id}`;
    },
  },
  deleteDialogTitle: {
    type: Function,
    default: function(dataType, row) {
      if (!row) { return ``; }
      return `Delete ${dataType} ${row.id}`;
    },
  },
  deleteDialogPrimaryText: {
    type: Function,
    default: function(dataType, row) {
      if (!row) { return ``; }
      return `Are you sure you want to delete ${dataType} ${row.id}?`;
    },
  },
  deleteDialogSecondaryText: {
    type: Function,
    default: function(dataType, row) {
      if (!row) { return ``; }
      return JSON.stringify(row, false, 2);
    },
  },
  actions: {
    type: Object,
    default() {
      return {};
    },
  },
});
/** section:props **/

/** section:global **/
const {
  includeKeys,
  inputLabel,
  inputValue,
  tagsField,
  formatDataForShow,
  formatDataForSave,
  formatErrorsForDisplay,
  formatFilters,
  initOptionsData,
} = useInputHelper(props.dataFields);
const systemConfigsStore = useSystemConfigsStore();
const systemConfigs = systemConfigsStore.getSystemConfigs();

const {
  formatTag,
  tagStyle,
} = useFormatter();
const errorsMap = useErrors();
const dataAccess = useDataAccess();
const { isEmpty, notEmpty } = useValidations();
const { flashMessage } = useBannerStore();
const events = useEventsStore();

const inputOptionsData = ref({});

const combinedDataFields = ref(Array.from(props.dataFields));

const schemasLoaded = ref(false);
const filtersLoaded = ref(false);

function validateParams(validations, params) {
  return Object.keys(validations).reduce((errors, field) => {
    const validators = validations[field];
    const fieldErrors = validators.map((validator) => {
      return validator(params);
    }).filter(e => !!e);

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
    return errors;
  }, {});
}

function formatDataFields(fields) {
  combinedDataFields.value = combinedDataFields.value.map((field) => {
    if (field.type === 'enum') {
      const enums = fields[field.key].enums;
      const options = Object.keys(enums).map((e) => {
        return { value: e, label: enums[e] };
      });
      const combined = Object.assign({}, field, { options });
      return combined;
    } else {
      return field;
    }
  });
}
/** section:global **/

/** section:filter **/
const filtersEnabled = ref(props.filters.layout);

const filtersState = ref(false);

const filtersData = ref({});

const filtersDataFields = ref(Array.from(props.dataFields));

const filtersErrorMessages = ref({});

const filtersConfirmButton = computed(() => {
  return {
    type: 'icon',
    icon: 'fa-solid fa-check',
  };
});

const filtersCancelButton = computed(() => {
  return {
    type: 'icon',
    icon: 'fa-solid fa-filter-circle-xmark',
  };
});

const filterableFields = computed(() => {
  return props.dataFields.filter(h => h.filterable).reduce((o, h) => {
    o[h.key] = h;
    return o;
  }, {});
});

const filterableKeys = computed(() => {
  return Object.keys(filterableFields.value);
});

const showFilters = computed(() => {
  return filtersEnabled.value && schemasLoaded.value && filtersLoaded.value;
});

const filtersLayout = computed(() => {
  return props.filters.layout;
});

const filtersStyleClass = computed(() => {
  if (filtersState.value) {
    return `filters expanded`;
  } else {
    return `filters collapsed`;
  }
});

async function submitFilters(updatedFilters) {
  offset.value = 0;
  await loadData();
}

async function resetFilters() {
  filtersLoaded.value = false;
  filtersData.value = formatFilters(Object.assign({}, props.filters.initData));

  const promises = filterableKeys.value.map((key) => {
    return formatDataForShow(key, filtersData.value);
  });

  Promise.all(promises)
    .then((results) => {
      filterableKeys.value.forEach((key, i) => {
        filtersData.value[key] = results[i];
      });
      filtersLoaded.value = true;
      offset.value = 0;
      loadData();
    });
}

function toggleFilters() {
  filtersState.value = !filtersState.value;
}

function formatFiltersFields() {
  filtersDataFields.value = Array.from(combinedDataFields.value).map((field) => {
    const filterField = Object.assign({}, field);
    if (!filterField.filterable) { return filterField; }

    if (filterField.type === 'date') {
      filterField.type = 'daterange';
    } else if (filterField.type === 'datetime') {
      filterField.type = 'datetimerange';
    } else if (filterField.type === 'number') {
      filterField.type = 'numberrange';
    }

    return filterField;
  }).filter(f => f.filterable);
}
/** section:filter **/

/** section:sort **/
const currentSortField = ref('id');
const currentSortOrder = ref(true); // true = asc, false = desc

const sortFilters = computed(() => {
  return {
    field: currentSortField.value,
    order: currentSortOrder.value ? 'asc' : 'desc',
  };
});

const sortableFields = computed(() => {
  return props.dataFields.filter(h => h.sortable).reduce((o, h) => {
    o[h.key] = h;
    return o;
  }, {});
});

const sortableKeys = computed(() => {
  return Object.keys(sortableFields.value);
});

function sortableField(field) {
  return sortableKeys.value.includes(field);
}

const sortHeaderStyles = computed(() => {
  return props.dataFields.reduce((o, field) => {
    const key = field.key;
    if (sortableField(key) && key === currentSortField.value) {
      if (currentSortOrder.value) {
        o[key] = `header-field sort down`;
      } else {
        o[key] = `header-field sort up`;
      }
    } else if (sortableField(key)) {
      o[key] = `header-field sort reset`;
    } else {
      o[key] = `header-field nosort`;
    }
    return o;
  }, {});
});

async function toggleSort(field) {
  if (!sortableField(field)) { return; }

  if (field === currentSortField.value) {
    currentSortOrder.value = !currentSortOrder.value;
  } else {
    currentSortField.value = field;
    currentSortOrder.value = true;
  }

  offset.value = 0;
  await loadData();
}
/** section:sort **/

/** section:table **/
const tableActions = computed(() => {
  const defaultCreateAction = {
    name: 'Create',
    icon: 'fa-solid fa-circle-plus fa-xl',
    click: async function(data) {
      await openCreateDialog();
    },
  };
  const createOverride = props.actions.create || {};
  const createAction = Object.assign({}, defaultCreateAction, createOverride);

  const defaultExportAction = {
    name: 'Export',
    icon: 'fa-solid fa-file-export',
    click: async function(data) {
      await openDownloadDialog();
    },
  };
  const exportOverride = props.actions.export || {};
  const exportAction = Object.assign({}, defaultExportAction, exportOverride);

  const defaultFilterAction = {
    name: 'Filter',
    icon: 'fa-solid fa-filter',
    click: async function() {
      toggleFilters();
    },
  };
  const filterOverride = props.actions.filter || {};
  const filterAction = Object.assign({}, defaultFilterAction, filterOverride);

  const initialActions = [
    createAction,
    exportAction,
  ];

  if (showFilters.value) {
    initialActions.unshift(filterAction);
  }

  return initialActions;
});

const rowActions = computed(() => {
  const defaultViewAction = {
    name: 'View',
    icon: 'fa-solid fa-magnifying-glass',
    click: async function(row, index) {
      await openViewDialog(row.id);
    },
  };
  const viewOverride = props.actions.view || {};
  const viewAction = Object.assign({}, defaultViewAction, viewOverride);

  const defaultUpdateAction = {
    name: 'Update',
    icon: 'fa-solid fa-pen-to-square',
    click: async function(row, index) {
      await openUpdateDialog(row.id);
    },
  };
  const updateOverride = props.actions.update || {};
  const updateAction = Object.assign({}, defaultUpdateAction, updateOverride);

  const defaultRemoveAction = {
    name: 'Delete',
    icon: 'fa-solid fa-trash-can',
    click: async function(row, index) {
      await openDeleteDialog(row.id);
    },
  };
  const removeOverride = props.actions.remove || {};
  const removeAction = Object.assign({}, defaultRemoveAction, removeOverride);

  return [
    viewAction,
    updateAction,
    removeAction,
  ];
});

const data = ref([]);
const totalData = ref(0);

const offset = ref(0);
const limit = ref(5);

const dataLoading = ref(false);

const listedHeaders = computed(() => {
  return props.dataFields.filter(h => h.listable);
});

const listedData = ref([]);

async function updateOffsetAndReload(updated) {
  offset.value = updated;
  await loadData();
}

async function asyncFormatTag(row, tags, key, i) {
  const promises = tags.map((tag) => {
    return new Promise((resolve, reject) => {
      formatTag(row, tag, key, systemConfigs.tagFormat)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  });

  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then((results) => {
        resolve({ i, key, formattedValue: results });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function formattedTag(row, key, i) {
  const formattedKey = `${key}Formatted`;
  if (row[formattedKey]) {
    return row[formattedKey][i];
  } else {
    return row[key];
  }
}

async function formatListedData() {
  const promises = [];
  listedData.value = [];

  data.value.forEach((row, i) => {
    listedData.value.push(Object.assign({}, row));
    listedHeaders.value.forEach((field) => {
      const key = field.key;
      const value = row[key];
      if (tagsField(key)) {
        promises.push(asyncFormatTag(row, value, key, i));
      }
    });
  });

  Promise.all(promises)
    .then((results) => {
      results.forEach((result) => {
        const formattedKey = `${result.key}Formatted`;
        listedData.value[result.i][formattedKey] = result.formattedValue;
      });
    })
    .catch((error) => {
      console.error(error);
    });
}
/** section:table **/

/** section:events **/
events.registerListener(
  'loadData',
  {
    id: `DataPage-${props.dataType}`,
    invoke: (payload) => {
      if (payload.dataType === props.dataType) {
        loadData();
      }
    },
  }
);
/** section:events **/

/** section:dataAccess **/
async function loadSchemas() {
  await dataAccess
    .schemas(props.modelClass)
    .then((result) => {
      const fields = result.fields;
      formatDataFields(fields);
      formatFiltersFields();
      schemasLoaded.value = true;
    })
    .catch((error) => {
      console.error(error);
      flashMessage(`Error loading schemas!`);
    });
}

async function loadData() {
  const params = {
    include: includeKeys.value,
    offset: offset.value,
    limit: limit.value,
    filters: formatFilters(filtersData.value),
    sort: sortFilters.value,
  };

  dataLoading.value = true;

  await dataAccess
    .list(props.modelClass, params)
    .then((result) => {
      data.value = result.data;
      formatListedData();
      totalData.value = result.total;
      dataLoading.value = false;
    })
    .catch((error) => {
      dataLoading.value = false;
      console.error(error);
      flashMessage(`Error loading data!`);
    });
}

async function viewData(id, resolve, reject) {
  const params = { include: includeKeys.value };

  await dataAccess
    .view(props.modelClass, id, params)
    .then((result) => {
      resolve(result);
    })
    .catch((error) => {
      reject(error);
    });
}
/** section:dataAccess **/

/** section:error **/
const errorAlert = ref(false);
const errorContent = ref('');

const errorAlertFitContent = computed(() => {
  if (!!errorContent.value && errorContent.value.length > 0) {
    return (errorContent.value.match(/.{1,100}/g) ?? []).join('\n');
  } else {
    return ``;
  }
});

const errorAlertSize = computed(() => {
  return {
    width: 800,
    height: 400,
  };
});
/** section:error **/

/** section:view **/
const viewDialog = ref(false);
const currentRow = ref();

const viewableFields = computed(() => {
  return props.dataFields.filter(h => h.viewable).reduce((o, h) => {
    o[h.key] = h;
    return o;
  }, {});
});

const viewableKeys = computed(() => {
  return Object.keys(viewableFields.value);
});

async function openViewDialog(id) {
  viewData(
    id,
    (record) => {
      currentRow.value = record;
      viewDialog.value = true;
    },
    (error) => {
      currentRow.value = null;
      errorAlert.value = true;
      errorContent.value = JSON.stringify(error, false, 4);
    }
  );
}
/** section:view **/

/** section:create **/
const createDialog = ref(false);
const newRow = ref();
const createErrors = ref({});

const creatableFields = computed(() => {
  return props.dataFields.filter(h => h.creatable).reduce((o, h) => {
    o[h.key] = h;
    return o;
  }, {});
});

const creatableKeys = computed(() => {
  return Object.keys(creatableFields.value);
});

const createValidations = computed(() => {
  return props.validations.create || [];
});

watch(createDialog, (newVal, oldVal) => {
  if (!newVal) { createErrors.value = {}; }
});

async function openCreateDialog(id) {
  newRow.value = {};
  const promises = creatableKeys.value.map((key) => {
    return formatDataForShow(key, {});
  });

  Promise.all(promises)
    .then((results) => {
      creatableKeys.value.forEach((key, i) => {
        newRow.value[key] = results[i];
        createDialog.value = true;
      });
    });
}

async function createDataAndCloseDialog(rawParams) {
  const errors = validateCreateParams(rawParams);

  if (Object.keys(errors).length > 0) {
    createErrors.value = errors;
    flashMessage(`Error creating data!`);
    return;
  }

  const params = formatDataForSave(rawParams);

  await dataAccess
    .create(props.modelClass, params)
    .then((result) => {
      flashMessage(`Data created successfully!`);
      resetFilters();
      closeCreateDialog();
    })
    .catch((error) => {
      createErrors.value = formatErrorsForDisplay(error);
      flashMessage(`Error creating data!`);
    });
}

function validateCreateParams(params) {
  return validateParams(createValidations.value, params);
}

function closeCreateDialog() {
  createDialog.value = false;
  resetNewRow();
}

function resetNewRow() {
  newRow.value = null;
}

/** section:create **/

/** section:update **/
const updateDialog = ref(false);
const currentRowForUpdate = ref();
const updateErrors = ref({});

const updatableFields = computed(() => {
  return props.dataFields.filter(h => h.updatable).reduce((o, h) => {
    o[h.key] = h;
    return o;
  }, {});
});

const updatableKeys = computed(() => {
  return Object.keys(updatableFields.value);
});

const updateValidations = computed(() => {
  return props.validations.update || [];
});

watch(updateDialog, (newVal, oldVal) => {
  if (!newVal) { updateErrors.value = {}; }
});

async function openUpdateDialog(id) {
  viewData(
    id,
    (record) => {
      formatCurrentRowForUpdate(record);
      updateDialog.value = true;
    },
    (error) => {
      resetCurrentRowForUpdate();
      errorAlert.value = true;
      errorContent.value = JSON.stringify(error, false, 4);
    }
  );
}

async function updateDataAndCloseDialog(rawParams) {
  const errors = validateUpdateParams(rawParams);

  if (Object.keys(errors).length > 0) {
    updateErrors.value = errors;
    flashMessage(`Error updating data!`);
    return;
  }

  const id = rawParams.id;
  const params = formatDataForSave(rawParams);

  await dataAccess
    .update(props.modelClass, id, params)
    .then((record) => {
      flashMessage(`Data updated successfully!`);
      resetFilters();
      closeUpdateDialog();
    })
    .catch((error) => {
      updateErrors.value = formatErrorsForDisplay(error);
      flashMessage(`Error updating data!`);
    });
}

function validateUpdateParams(params) {
  return validateParams(updateValidations.value, params);
}

function closeUpdateDialog() {
  updateDialog.value = false;
  resetCurrentRowForUpdate();
}

async function formatCurrentRowForUpdate(record) {
  currentRowForUpdate.value = {};

  const promises = props.dataFields.map((field) => {
    const key = field.key;
    return formatDataForShow(key, record);
  });

  Promise.all(promises)
    .then((results) => {
      props.dataFields.forEach((field, i) => {
        const key = field.key;
        currentRowForUpdate.value[key] = results[i];
      });
    });
}

function resetCurrentRowForUpdate() {
  currentRowForUpdate.value = null;
}
/** section:update **/

/** section:delete **/
const deleteDialog = ref(false);
const currentRowForDelete = ref();
const deleteErrors = ref({});

watch(deleteDialog, (newVal, oldVal) => {
  if (!newVal) { deleteErrors.value = {}; }
});

async function openDeleteDialog(id) {
  viewData(
    id,
    (record) => {
      currentRowForDelete.value = record;
      deleteDialog.value = true;
    },
    (error) => {
      resetCurrentRowForDelete();
      errorAlert.value = true;
      errorContent.value = JSON.stringify(error, false, 4);
    }
  );
}

async function deleteDataAndCloseDialog() {
  const params = currentRowForDelete.value;
  const id = params.id;

  await dataAccess
    .remove(props.modelClass, id)
    .then((record) => {
      flashMessage(`Data deleted successfully!`);
      resetFilters();
    })
    .catch((error) => {
      errorAlert.value = true;
      errorContent.value = error.map((type) => {
        return errorsMap[type]();
      }).join(', ');
    })
    .finally(() => {
      closeDeleteDialog();
    });
}

function closeDeleteDialog() {
  deleteDialog.value = false;
  resetCurrentRowForDelete();
}

function resetCurrentRowForDelete() {
  currentRowForDelete.value = null;
}
/** section:delete **/

/** section:download **/
const downloadDialog = ref(false);
const downloadLink = ref();
const downloadFile = ref();
const downloadAnchor = ref('downloadAnchor');

async function openDownloadDialog() {
  await dataAccess
    .download(props.modelClass)
    .then((result) => {
      const url = window.URL.createObjectURL(new Blob([result.data]));
      downloadLink.value = url;
      downloadFile.value = result.filename;
      downloadDialog.value = true;
    })
    .catch((error) => {
      errorAlert.value = true;
      errorContent.value = JSON.stringify(error, false, 4);
    });
}

function downloadDataAsFile() {
  downloadAnchor.value.click();
  closeDownloadDialog();
}

function closeDownloadDialog() {
  downloadDialog.value = false;
  downloadLink.value = null;
  downloadFile.value = null;
}
/** section:download **/

onMounted(async() => {
  await loadSchemas();
  await initOptionsData()
    .then((result) => {
      inputOptionsData.value = result;
    })
    .catch((error) => {
      errorAlert.value = true;
      errorContent.value = JSON.stringify(error, false, 4);
    });
  await resetFilters();
});
</script>

<template>
  <div class="page-container">
    <h2 class="heading">
      {{ dataType }}
    </h2>

    <div
      v-if="showFilters"
      :class="filtersStyleClass"
    >
      <h3 class="heading">
        Filters
      </h3>
      <DataForm
        v-model="filtersData"
        :fields-layout="filtersLayout"
        :data-fields="filterableKeys"
        :schemas="filtersDataFields"
        :error-messages="filtersErrorMessages"
        :confirm-button="filtersConfirmButton"
        :cancel-button="filtersCancelButton"
        :compact="true"
        @submit="submitFilters"
        @cancel="resetFilters"
      />
    </div>

    <TTable
      name=""
      :headers="listedHeaders"
      :data="listedData"
      :table-actions="tableActions"
      :actions="rowActions"
      :loading="dataLoading"
      :pagination="{ offset, limit, client: false }"
      :total-data="totalData"
      @offset-change="updateOffsetAndReload"
    >
      <template #header-row="{ headers, actions }">
        <th
          v-for="(header, i) in headers"
          :key="i"
          class="col"
          @click="toggleSort(header.key)"
        >
          <div
            :class="sortHeaderStyles[header.key]"
          >
            {{ header.label }}

            <i class="fa-solid fa-sort" />
            <i class="fa-solid fa-sort-up" />
            <i class="fa-solid fa-sort-down" />
          </div>
        </th>

        <th
          v-if="actions.length > 0"
          class="col"
        />
      </template>

      <template #data-content="{ headers, row, i }">
        <td
          v-for="(header, h) in headers"
          :key="h"
          class="col"
        >
          <slot
            :name="`data-col.${header.key}`"
            v-bind="{ header, row, i }"
          >
            <div
              v-if="!tagsField(header.key)"
            >
              <div
                v-if="notEmpty(row[header.key])"
              >
                {{ inputValue(header.key, row, includeKeys, combinedDataFields) }}
              </div>

              <div
                v-if="isEmpty(row[header.key])"
                class="no-value"
              >
                --- no value ---
              </div>
            </div>

            <!-- hardcode format for tags because it is standard through the app --->
            <div
              v-if="tagsField(header.key)"
            >
              <div
                v-for="(tag, j) in row[header.key]"
                :key="j"
                class="tag"
                :style="tagStyle(row, tag, header.key)"
              >
                {{ formattedTag(row, header.key, j) }}
              </div>

              <div
                v-if="row[header.key].length === 0"
                class="no-value"
              >
                --- no value ---
              </div>
            </div>
          </slot>
        </td>
      </template>
    </TTable>

    <TAlert
      v-if="errorContent.length > 0"
      v-model="errorAlert"
      title="Error"
      class="error-alert"
      :content="errorAlertFitContent"
      :width="errorAlertSize.width"
      :height="errorAlertSize.height"
    />

    <FormDialog
      v-if="newRow"
      v-model="createDialog"
      :schemas="combinedDataFields"
      :fields-layout="fieldsLayout"
      :data-fields="creatableKeys"
      :data="newRow"
      :dialog-title="createDialogTitle(dataType)"
      :fullscreen="fullscreen"
      :error-messages="createErrors"
      @submit="createDataAndCloseDialog"
    />

    <slot
      name="updateDialog"
      v-bind="{ row: currentRowForUpdate }"
    >
      <FormDialog
        v-if="currentRowForUpdate"
        v-model="updateDialog"
        :schemas="combinedDataFields"
        :fields-layout="fieldsLayout"
        :data-fields="updatableKeys"
        :data="currentRowForUpdate"
        :dialog-title="updateDialogTitle(dataType, currentRowForUpdate)"
        :fullscreen="fullscreen"
        :error-messages="updateErrors"
        @submit="updateDataAndCloseDialog"
      />
    </slot>

    <ViewDialog
      v-if="currentRow"
      v-model="viewDialog"
      :keys="viewableKeys"
      :include-keys="includeKeys"
      :data-fields="combinedDataFields"
      :record="currentRow"
      :title="viewDialogTitle(dataType, currentRow)"
      :input-label="inputLabel"
      :input-value="inputValue"
      class="view-dialog"
    />

    <TConfirmDialog
      v-if="currentRowForDelete"
      v-model="deleteDialog"
      :title="deleteDialogTitle(dataType, currentRowForDelete)"
      :primary-text="deleteDialogPrimaryText(dataType, currentRowForDelete)"
      :secondary-text="deleteDialogSecondaryText(dataType, currentRowForDelete)"
      :width="500"
      :height="350"
      class="delete-dialog"
      @confirm="deleteDataAndCloseDialog"
      @cancel="closeDeleteDialog"
    />

    <TDialog
      v-if="downloadLink"
      v-model="downloadDialog"
      title="Download export file"
      :width="400"
      :height="250"
    >
      <template #body>
        {{ downloadFile }}
      </template>

      <template #actions>
        <a
          ref="downloadAnchor"
          class="hidden"
          rel="noreferrer"
          :download="downloadFile"
          :href="downloadLink"
        />
        <TButton
          button-type="text"
          value="Download"
          icon="fa-solid fa-file-arrow-down"
          @click="downloadDataAsFile()"
        />
        <TButton
          button-type="text"
          value="Cancel"
          icon="fa-solid fa-xmark"
          @click="closeDownloadDialog()"
        />
      </template>
    </TDialog>
  </div>
</template>

<style scoped>
.page-container {
  margin: 1rem 0;
}

.heading {
  font-weight: 900;
}

.filters {
  margin-top: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.filters.expanded {
  display: block;
}

.filters.collapsed {
  display: none;
}

a.hidden {
  display: none;
}

.header-field {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  font-weight: 900;
}

.header-field i {
  display: none;
}

.header-field.sort:hover {
  cursor: pointer;
}

.header-field.sort.reset:hover .fa-sort {
  display: inline-block;
}

.header-field.sort.down .fa-sort-down {
  display: inline-block;
}

.header-field.sort.up .fa-sort-up {
  display: inline-block;
}

.col {
  text-align: left;
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.col .no-value {
  font-size: 0.8rem;
  font-style: oblique;
}
</style>
