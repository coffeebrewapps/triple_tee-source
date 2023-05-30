<script setup>
import { ref, computed, onMounted } from 'vue';

import DataForm from '@/components/DataForm.vue';
import {
  TButton
} from 'coffeebrew-vue-components';

import { useDataAccess } from '@/utils/dataAccess';

import { useSystemConfigsStore } from '@/stores/systemConfigs';

import { useBannerStore } from '@/stores/banner';

import { useInputHelper } from '@/utils/input';

const dataAccess = useDataAccess();
const systemConfigsStore = useSystemConfigsStore();
const banner = useBannerStore();

const formData = ref();
const errorMessages = ref({});

const updatableKeys = computed(() => {
  return dataFields.value.filter((field) => {
    return field.updatable;
  });
});

const fieldKeys = computed(() => {
  return updatableKeys.value.map(f => f.key);
});

const fieldsLayout = [
  { tagFormat: 'md', timezone: 'md' },
  { baseCurrencyId: 'lg', baseContactId: 'lg' },
];

function recordValue(record) {
  return record.id;
}

function currencyLabel(record) {
  return `${record.code} (${record.symbol})`;
}

function contactLabel(record) {
  return record.name;
}

const dataFields = computed(() => {
  return [
    {
      key: 'id',
      type: 'text',
      label: 'ID',
      listable: true,
      viewable: true,
      creatable: false,
      updatable: false,
      sortable: true,
    },
    {
      key: 'tagFormat',
      type: 'text',
      label: 'Tag Format',
      listable: false,
      viewable: true,
      creatable: true,
      updatable: true,
    },
    {
      key: 'timezone',
      type: 'text',
      label: 'Timezone',
      listable: false,
      viewable: true,
      creatable: true,
      updatable: true,
    },
    {
      key: 'baseCurrencyId',
      type: 'singleSelect',
      label: 'Base Currency',
      reference: { label: currencyLabel },
      listable: true,
      viewable: true,
      creatable: true,
      updatable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'currencies',
        value: recordValue,
        label: currencyLabel,
      },
    },
    {
      key: 'baseContactId',
      type: 'singleSelect',
      label: 'Base Contact',
      reference: { label: contactLabel },
      listable: true,
      viewable: true,
      creatable: true,
      updatable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'contacts',
        value: recordValue,
        label: contactLabel,
      },
    },
  ];
});
const {
  formatDataForShow,
  formatDataForSave,
  formatErrorsForDisplay,
} = useInputHelper(dataFields.value);

function initFormData() {
  return {
    tagFormat: '{{ category }}:{{ name }}',
    timezone: 'UTC',
    baseCurrencyId: [],
    baseContactId: [],
  };
}

async function updateConfig() {
  const params = formatDataForSave(Object.assign({}, formData.value));
  await dataAccess
    .create('system_configs', params, { path: 'replace' })
    .then((result) => {
      showBanner(`Updated config successfully!`);
      systemConfigsStore.updateSystemConfigs(result);
    })
    .catch((error) => {
      console.error(error);
      errorMessages.value = formatErrorsForDisplay(error);
      showBanner(`Error updating config!`);
    });
}

async function formatFormDataForShow(record) {
  const promises = fieldKeys.value.map((key) => {
    return formatDataForShow(key, record);
  });

  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then((results) => {
        const formattedRecord = {};
        updatableKeys.value.forEach((field, i) => {
          const key = field.key;
          formattedRecord[key] = results[i];
        });
        resolve(formattedRecord);
      });
  });
}

async function loadSystemConfigs() {
  return new Promise((resolve, reject) => {
    dataAccess
      .list('system_configs', {}, { path: 'latest' })
      .then((result) => {
        const latestConfig = result.record;
        resolve(latestConfig);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/** * section:banner ***/
function showBanner(message) {
  banner.show(message);
  setTimeout(hideBanner, 5000);
}

function hideBanner() {
  banner.hide();
}
/** * section:banner ***/

onMounted(async() => {
  await loadSystemConfigs()
    .then((result) => {
      if (result) {
        formatFormDataForShow(result)
          .then((formattedResult) => {
            formData.value = formattedResult;
          });
      } else {
        formData.value = initFormData();
      }
    })
    .catch((error) => {
      console.error(error);
      showBanner(`Error loading config!`);
    });
});
</script>

<template>
  <div class="view-container">
    <DataForm
      v-if="formData"
      v-model="formData"
      :fields-layout="fieldsLayout"
      :data-fields="fieldKeys"
      :schemas="dataFields"
      :error-messages="errorMessages"
      :submittable="false"
    />

    <div class="actions">
      <TButton
        class="button"
        value="Update"
        icon="fa-solid fa-check"
        @click="updateConfig()"
      />
    </div>
  </div>
</template>

<style scoped>
.view-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.actions {
  display: flex;
  justify-content: center;
}
</style>
