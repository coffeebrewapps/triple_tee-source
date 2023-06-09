<script setup>
/** import:global **/
import { ref, computed, watch, onMounted } from 'vue';
/** import:global **/

/** import:utils **/
import { useValidations } from '@/utils/validations';
import { useDataAccess } from '@/utils/dataAccess';
import { useFormatter } from '@/utils/formatter';
import { useInputHelper } from '@/utils/input';
import { useLogger } from '@/utils/logger';
import { useWorkLogUtils } from './utils';
/** import:utils **/

/** import:stores **/
import { useSystemConfigsStore } from '@/stores/systemConfigs';
import { useBannerStore } from '@/stores/banner';
import { useEventsStore } from '@/stores/events';
import { useShortcutsStore } from '@/stores/shortcuts';
/** import:stores **/

/** import:components **/
import FormDialog from '@/components/FormDialog.vue';
/** import:components **/

/** section:utils **/
const {
  isEmpty,
  notEmpty,
} = useValidations();

const dataAccess = useDataAccess();
const systemConfigsStore = useSystemConfigsStore();
const systemConfigs = systemConfigsStore.getSystemConfigs();

const {
  formatShortTime,
} = useFormatter();

const {
  dataFields,
  fieldsLayout,
  validations,
  formatDuration,
  calculateDuration,
  includeKeys,
} = useWorkLogUtils();

const {
  formatDataFields,
  validateParams,
  formatDataForShow,
  formatDataForSave,
} = useInputHelper(dataFields);

const { flashMessage } = useBannerStore();
const events = useEventsStore();
const shortcuts = useShortcutsStore();
const logger = useLogger();
/** section:utils **/

/** section:global **/
const combinedDataFields = ref([]);

const creatableKeys = computed(() => {
  return dataFields.map(f => f.key);
});
/** section:global **/

/** section:data **/
const currentTask = ref({});

const startOfToday = computed(() => {
  const today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  return today;
});

const endOfToday = computed(() => {
  const today = new Date();
  today.setHours(23);
  today.setMinutes(59);
  today.setSeconds(59);
  return today;
});

const todayLogs = ref([]);

const openTask = computed(() => {
  if (todayLogs.value.length === 0) { return false; }

  return isEmpty(currentTask.value.endTime) && taskStarted.value;
});

const todayTotalDuration = computed(() => {
  return todayLogs.value.reduce((total, log) => {
    return total + log.duration;
  }, 0);
});

function formatWorkLogs(data) {
  return data.map((record) => {
    record.duration = calculateDuration(record);
    return record;
  });
}

function formatExistingTask(record) {
  if (isEmpty(record)) { return {}; }

  record.duration = calculateDuration(record);
  return record;
}
/** section:data **/

/** section:startTask **/
const startTaskDialog = ref(false);
const taskStarted = ref(false);

function formatNewTask() {
  return dataFields.reduce((o, field) => {
    const key = field.key;
    const defaultValue = field.defaultValue;

    if (notEmpty(defaultValue)) {
      o[key] = defaultValue();
    } else {
      o[key] = null;
    }

    return o;
  }, {});
}

function startTask() {
  currentTask.value = formatNewTask();
  startNew.value = '';
  startTaskDialog.value = true;
}

async function quickStartTask() {
  currentTask.value = formatNewTask();
  startNew.value = '';
  await submitNewTask();
}

function closeStartTaskDialog() {
  startTaskDialog.value = false;
}

async function submitNewTask() {
  const errors = validateParams(validations.create, currentTask.value);

  if (Object.keys(errors).length > 0) {
    flashMessage(`Error submitting task!`);
    return;
  }

  const params = formatDataForSave(currentTask.value);

  await dataAccess
    .create('work_logs', params)
    .then((result) => {
      flashMessage(`Started task successfully!`);
      loadToday();
      closeStartTaskDialog();
    })
    .catch((error) => {
      logger.error(`Error creating data`, error);
      flashMessage(`Error creating data!`);
    });
}
/** section:startTask **/

/** section:endTask **/
const endTaskDialog = ref(false);
const startNew = ref('');
const currentTaskForUpdate = ref({});

watch(endTaskDialog, (newVal, oldVal) => {
  if (!newVal) {
    currentTaskForUpdate.value = {};
  }
});

async function updateTask() {
  const errors = validateParams(validations.update, currentTaskForUpdate.value);

  if (Object.keys(errors).length > 0) {
    flashMessage(`Error submitting task!`);
    return;
  }

  const params = formatDataForSave(currentTaskForUpdate.value);

  await dataAccess
    .update('work_logs', currentTaskForUpdate.value.id, params)
    .then((result) => {
      flashMessage(`Ended task successfully!`);
      loadToday();
      closeEndTaskDialog();

      if (startNew.value === 'quick') {
        quickStartTask();
      } else if (startNew.value === 'input') {
        setTimeout(startTask, 1000);
      }
    })
    .catch((error) => {
      logger.error(`Error submitting task`, error);
      flashMessage(`Error submitting task!`);
    });
}

async function endTask() {
  currentTaskForUpdate.value = Object.assign({}, currentTask.value);

  await formatDataForShow('startTime', currentTaskForUpdate.value)
    .then((result) => {
      currentTaskForUpdate.value.startTime = result;
    });

  await formatDataForShow('tags', currentTaskForUpdate.value)
    .then((result) => {
      currentTaskForUpdate.value.tags = result;
    });

  currentTaskForUpdate.value.endTime = new Date();
  endTaskDialog.value = true;
}

function endTaskAndStartTask() {
  endTask();
  startNew.value = 'input';
}

function endTaskAndQuickStartTask() {
  endTask();
  startNew.value = 'quick';
}

function closeEndTaskDialog() {
  currentTaskForUpdate.value = {};
  endTaskDialog.value = false;
}
/** section:endTask **/

/** section:shortcuts **/
const showShortcuts = ref(false);

const shortcutStyles = computed(() => {
  if (showShortcuts.value) {
    return `shortcut show`;
  } else {
    return `shortcut hide`;
  }
});

shortcuts.registerListener(
  {
    route: '/work_logs',
    eventType: 'ctrl-n',
  },
  {
    id: 'TodayStartTask',
    invoke: (payload) => {
      startTask();
    },
  }
);

shortcuts.registerListener(
  {
    route: '/work_logs',
    eventType: 'ctrl-q',
  },
  {
    id: 'TodayQuickStartTask',
    invoke: (payload) => {
      quickStartTask();
    },
  }
);

shortcuts.registerListener(
  {
    route: '/work_logs',
    eventType: 'ctrl-e',
  },
  {
    id: 'TodayEndTask',
    invoke: (payload) => {
      endTask();
    },
  }
);

shortcuts.registerListener(
  {
    route: '/work_logs',
    eventType: 'ctrl-g',
  },
  {
    id: 'TodayEndTaskAndStartTask',
    invoke: (payload) => {
      endTaskAndStartTask();
    },
  }
);

shortcuts.registerListener(
  {
    route: '/work_logs',
    eventType: 'ctrl-f',
  },
  {
    id: 'TodayEndTaskAndQuickStartTask',
    invoke: (payload) => {
      endTaskAndQuickStartTask();
    },
  }
);

shortcuts.registerListener(
  {
    route: '/work_logs',
    eventType: 'keydown-Escape',
  },
  {
    id: 'CloseTodayLogDialogs',
    invoke: (payload) => {
      if (startTaskDialog.value) { startTaskDialog.value = false; }
      if (endTaskDialog.value) { endTaskDialog.value = false; }
    },
  }
);
/** section:shortcuts **/

/** section:events **/
events.registerListener(
  'loadTodayLogs',
  {
    id: 'TodayLog',
    invoke: (payload) => {
      loadToday();
    },
  }
);

events.registerListener(
  'toggleShortcut',
  {
    id: 'ToggleTodayLogShortcut',
    invoke: (payload) => {
      showShortcuts.value = !showShortcuts.value;
    },
  }
);
/** section:events **/

async function loadSchemas() {
  await dataAccess
    .schemas('work_logs')
    .then((result) => {
      const fields = result.fields;
      combinedDataFields.value = formatDataFields(fields);
    })
    .catch((error) => {
      flashMessage(`Error loading schemas!`);
      logger.error(`Error loading schemas`, error);
    });
}

async function loadToday() {
  const params = {
    include: includeKeys.value,
    filters: {
      startTime: {
        startDate: startOfToday.value,
        endDate: endOfToday.value,
      },
    },
    sort: {
      field: 'startTime',
      order: 'desc',
    },
  };

  await dataAccess
    .list('work_logs', params)
    .then((result) => {
      todayLogs.value = formatWorkLogs(result.data);
      currentTask.value = formatExistingTask(todayLogs.value[0]);
      if (notEmpty(currentTask.value.startTime)) { taskStarted.value = true; }
    })
    .catch((error) => {
      flashMessage(`Error loading work logs!`);
      logger.error(`Error loading work logs`, error);
    });
}

onMounted(async() => {
  await loadToday();
  await loadSchemas();
});
</script>

<template>
  <div class="today-logs-container">
    <div class="controls">
      <div
        v-if="!openTask"
        class="button"
        tabindex="0"
        @click="startTask"
        @keydown.enter="startTask"
      >
        Start New Task
        <div :class="shortcutStyles">
          N
        </div>
      </div>

      <div
        v-if="!openTask"
        class="button"
        tabindex="0"
        @click="quickStartTask"
        @keydown.enter="quickStartTask"
      >
        Quick Start New Task
        <div :class="shortcutStyles">
          Q
        </div>
      </div>

      <div
        v-if="openTask"
        class="button"
        tabindex="0"
        @click="endTask"
        @keydown.enter="endTask"
      >
        End Current Task
        <div :class="shortcutStyles">
          E
        </div>
      </div>

      <div
        v-if="openTask"
        class="button"
        tabindex="0"
        @click="endTaskAndStartTask"
        @keydown.enter="endTaskAndStartTask"
      >
        End and Start New
        <div :class="shortcutStyles">
          G
        </div>
      </div>

      <div
        v-if="openTask"
        class="button"
        tabindex="0"
        @click="endTaskAndQuickStartTask"
        @keydown.enter="endTaskAndQuickStartTask"
      >
        End and Quick Start
        <div :class="shortcutStyles">
          F
        </div>
      </div>
    </div> <!-- controls -->

    <div class="logs">
      <div
        class="total"
      >
        Today's total: {{ formatDuration(todayTotalDuration) }}
      </div>

      <div
        v-for="(log, l) in todayLogs"
        :key="l"
        class="log"
      >
        <div class="divider" />

        <div class="duration">
          <div class="start-time">
            {{ formatShortTime(log.startTime, systemConfigs.timezone) }}
          </div>

          <div
            v-if="notEmpty(log.endTime)"
            class="end-time"
          >
            to {{ formatShortTime(log.endTime, systemConfigs.timezone) }}
          </div>

          <div
            v-if="notEmpty(log.endTime)"
            class="elapsed"
          >
            ({{ formatDuration(log.duration) }})
          </div>

          <div
            v-if="isEmpty(log.endTime)"
            class="elapsed"
          >
            (not ended)
          </div>
        </div>

        <div class="description">
          {{ log.description }}
        </div>
      </div>
    </div>

    <FormDialog
      v-model="startTaskDialog"
      :schemas="combinedDataFields"
      :fields-layout="fieldsLayout"
      :data-fields="creatableKeys"
      :data="currentTask"
      :fullscreen="true"
      dialog-title="Start Task"
      @submit="submitNewTask"
    />

    <FormDialog
      v-model="endTaskDialog"
      :schemas="combinedDataFields"
      :fields-layout="fieldsLayout"
      :data-fields="creatableKeys"
      :data="currentTaskForUpdate"
      :fullscreen="true"
      dialog-title="End Task"
      @submit="updateTask"
    />
  </div> <!-- today-logs-container -->
</template>

<style scoped>
.today-logs-container {
  display: flex;
  justify-content: space-evenly;
  gap: 1rem;
  margin: 1rem 0 0 0;
}

.today-logs-container .controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  width: 30%;
}

.today-logs-container .controls .button {
  display: grid;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
  width: 200px;
  height: 100px;
  border-radius: 8px;
  background-color: var(--color-border);
  font-size: 0.8rem;
  font-weight: 900;
}

.today-logs-container .controls .button:hover {
  cursor: pointer;
  background-color: var(--color-border-hover);
}

.today-logs-container .controls .button:focus,
.today-logs-container .controls .input:focus {
  outline: 5px solid var(--color-border-hover);
}

.today-logs-container .controls .button .shortcut {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 0.7rem;
  width: 1.6rem;
  height: 1.6rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  content: "AB"
}

.today-logs-container .controls .button .shortcut.show {
  display: inline-flex;
}

.today-logs-container .controls .button .shortcut.hide {
  display: none;
}

.today-logs-container .controls .input {
  padding: 1rem;
  width: 300px;
  background-color: var(--color-border-hover);
  border: 1px solid var(--color-border-hover);
  border-radius: 8px;
}

.today-logs-container .logs {
  display: flex;
  flex-direction: column;
  padding: 0 1rem;
  height: 500px;
  width: 70%;
  overflow-y: auto;
}

.today-logs-container .logs .total {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: var(--color-background-soft);
  border-radius: 4px;
  text-align: center;
  width: 100%;
  font-weight: 600;
}

.today-logs-container .logs .log {
  padding: 1rem 1rem 3rem 2rem;
  width: 500px;
  border-left: 5px solid var(--color-border);
}

.today-logs-container .logs .log .divider {
  position: absolute;
  top: 1rem;
  left: -13px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--color-text);
  border: 5px double rgba(255, 255, 255, 0.4);
}

.today-logs-container .logs .log .duration {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.today-logs-container .logs .log .duration .start-time,
.today-logs-container .logs .log .duration .end-time,
.today-logs-container .logs .log .duration .elapsed {
  font-weight: 600;
}

.today-logs-container .logs .log .duration .elapsed {
  align-self: flex-end;
  font-size: 0.8rem;
  font-style: oblique;
}
</style>
