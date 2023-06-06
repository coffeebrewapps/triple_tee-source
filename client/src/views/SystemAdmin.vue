<script setup>
/** import:global **/
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
/** import:global **/

/** import:components **/
import TabContainer from '@/components/TabContainer.vue';
import DataForm from '@/components/DataForm.vue';
import {
  TButton
} from 'coffeebrew-vue-components';
/** import:components **/

/** import:utils **/
import { useDataAccess } from '@/utils/dataAccess';
import { useInputHelper } from '@/utils/input';
import { useValidations } from '@/utils/validations';
/** import:utils **/

/** import:stores **/
import { useSystemConfigsStore } from '@/stores/systemConfigs';
import { useBannerStore } from '@/stores/banner';
/** import:stores **/

/** section:utils **/
const dataAccess = useDataAccess();
const systemConfigsStore = useSystemConfigsStore();
const { flashMessage } = useBannerStore();
const { notEmpty } = useValidations();
/** section:utils **/

/** section:systemConfigs **/
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
  { tagFormat: 'md', timezone: 'lg' },
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

const timezones = Intl.supportedValuesOf('timeZone').map((timezone) => {
  const timezoneLabel = timezone.replace(/_/g, ' ');
  return { value: timezone, label: timezoneLabel };
});

const dataFields = ref([
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
    type: 'select',
    label: 'Timezone',
    listable: false,
    viewable: true,
    creatable: true,
    updatable: true,
    options: timezones,
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
]);
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
      flashMessage(`Updated config successfully!`);
      systemConfigsStore.updateSystemConfigs(result);
    })
    .catch((error) => {
      console.error(error);
      errorMessages.value = formatErrorsForDisplay(error);
      flashMessage(`Error updating config!`);
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
/** section:systemConfigs **/

/** section:logs **/
const logsContentArray = ref([]);
const logsContent = computed(() => {
  return logsContentArray.value.join('\n');
});

const streamDebugLogsIntervalId = ref();

async function streamDebugLogs() {
  loadDebugLogs();
  streamDebugLogsIntervalId.value = setInterval(loadDebugLogs, 1000);
}

async function loadDebugLogs() {
  dataAccess
    .downloadStream('logs')
    .then((result) => {
      result.data.text()
        .then((text) => {
          logsContentArray.value = text.split('\n');
        })
        .catch((error) => {
          console.error(error);
        });
    })
    .catch((error) => {
      console.error(error);
    });
}
/** section:logs **/

/** section:tabs **/
const selectedTab = ref(0);
const tabs = [
  { label: 'System Configs', onchange: loadSystemConfigs },
  { label: 'Debug Logs', onchange: streamDebugLogs },
];

async function triggerTabEvent(i) {
  if (notEmpty(streamDebugLogsIntervalId.value)) {
    clearInterval(streamDebugLogsIntervalId.value);
  }

  await tabs[i].onchange();
  selectedTab.value = i;
}
/** section:tabs **/

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
      flashMessage(`Error loading config!`);
    });
});

onBeforeUnmount(() => {
  clearInterval(streamDebugLogsIntervalId.value);
});
</script>

<template>
  <div class="page-container">
    <TabContainer
      :tabs="tabs"
      :selected-tab="selectedTab"
      @tab-change="triggerTabEvent"
    >
      <template #tab-0>
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
      </template> <!-- template-0 -->

      <template #tab-1>
        <div class="logs">
          <pre>{{ logsContent }}</pre>
        </div>
      </template> <!-- template-1 -->
    </TabContainer>
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.actions {
  display: flex;
  justify-content: center;
}

.logs {
  padding: 1rem;
  width: 90vw;
  height: 70vh;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: auto;
}

.logs pre {
  white-space: break-spaces;
}
</style>
