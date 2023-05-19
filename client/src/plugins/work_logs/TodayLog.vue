<script setup>
/*** import:global ***/
import { ref, computed, watch, onMounted } from 'vue'
/*** import:global ***/

/*** import:config ***/
import useConfig from '@/config'
const config = useConfig()
/*** import:config ***/

/*** import:utils ***/
import { useValidations } from '@/utils/validations'
const {
  isEmpty,
  notEmpty
} = useValidations()

import { useDataAccess } from '@/utils/dataAccess'
const dataAccess = useDataAccess()

import { useFormatter } from '@/utils/formatter'
const {
  formatShortTime
} = useFormatter()

import { useWorkLogUtils } from './utils'
const {
  schemasUrl,
  tagsUrl,
  worklogsUrl,
  dataFields,
  fieldsLayout,
  filters,
  validations,
  formatDuration,
  calculateDuration,
  includeKeys
} = useWorkLogUtils()

import { useInputHelper } from '@/utils/input'
const {
  formatDataFields,
  validateParams,
  formatDataForShow,
  formatDataForSave,
  fetchOptions,
  initOptionsData
} = useInputHelper(dataFields)
/*** import:utils ***/

/*** import:stores ***/
import { useBannerStore } from '@/stores/banner'
const banner = useBannerStore()

import { useEventsStore } from '@/stores/events'
const events = useEventsStore()
/*** import:stores ***/

/*** import:components ***/
import FormDialog from '@/components/FormDialog.vue'
/*** import:components ***/

/*** section:global ***/
const combinedDataFields = ref([])

const creatableKeys = computed(() => {
  return dataFields.map(f => f.key)
})
/*** section:global ***/

/*** section:data ***/
const currentTask = ref({})

const startOfToday = computed(() => {
  const today = new Date()
  today.setHours(0)
  today.setMinutes(0)
  today.setSeconds(0)
  return today
})

const endOfToday = computed(() => {
  const today = new Date()
  today.setHours(23)
  today.setMinutes(59)
  today.setSeconds(59)
  return today
})

const todayLogs = ref([])

const openTask = computed(() => {
  if (todayLogs.value.length === 0) { return false }

  return isEmpty(currentTask.value.endTime)
})

function formatWorkLogs(data) {
  return data.map((record) => {
    record.duration = calculateDuration(record)
    return record
  })
}

function formatExistingTask(record) {
  if (isEmpty(record)) { return {} }

  record.duration = calculateDuration(record)
  return record
}
/*** section:data ***/

/*** section:startTask ***/
const startTaskDialog = ref(false)

function formatNewTask() {
  return dataFields.reduce((o, field) => {
    const key = field.key
    const defaultValue = field.defaultValue

    if (notEmpty(defaultValue)) {
      o[key] = defaultValue()
    } else {
      o[key] = null
    }

    return o
  }, {})
}

function startTask() {
  currentTask.value = formatNewTask()
  startNew.value = ''
  startTaskDialog.value = true
}

async function quickStartTask() {
  currentTask.value = formatNewTask()
  startNew.value = ''
  await submitNewTask()
}

function closeStartTaskDialog() {
  startTaskDialog.value = false
}

async function submitNewTask() {
  const errors = validateParams(validations.create, currentTask.value)

  if (Object.keys(errors).length > 0) {
    showBanner(`Error submitting task!`)
    return
  }

  const params = formatDataForSave(currentTask.value)

  await dataAccess
    .create(worklogsUrl, params)
    .then((result) => {
      showBanner(`Started task successfully!`)
      loadToday()
      closeStartTaskDialog()
    })
    .catch((error) => {
      showBanner(`Error creating data!`)
    })
}
/*** section:startTask ***/

/*** section:endTask ***/
const endTaskDialog = ref(false)
const startNew = ref('')
const currentTaskForUpdate = ref({})

watch(endTaskDialog, (newVal, oldVal) => {
  if (!newVal) {
    currentTaskForUpdate.value = {}
  }
})

async function updateTask() {
  const errors = validateParams(validations.update, currentTaskForUpdate.value)

  if (Object.keys(errors).length > 0) {
    showBanner(`Error submitting task!`)
    return
  }

  const params = formatDataForSave(currentTaskForUpdate.value)

  await dataAccess
    .update(`${worklogsUrl}/${currentTaskForUpdate.value.id}`, params)
    .then((result) => {
      showBanner(`Ended task successfully!`)
      loadToday()
      closeEndTaskDialog()

      if (startNew.value === 'quick') {
        quickStartTask()
      } else if (startNew.value === 'input') {
        setTimeout(startTask, 1000)
      }
    })
    .catch((error) => {
      showBanner(`Error submiting task!`)
    })
}

function endTask() {
  currentTaskForUpdate.value = Object.assign({}, currentTask.value)
  currentTaskForUpdate.value.startTime = formatDataForShow('startTime', currentTaskForUpdate.value)
  currentTaskForUpdate.value.tags = formatDataForShow('tags', currentTaskForUpdate.value)
  currentTaskForUpdate.value.endTime = new Date()
  endTaskDialog.value = true
}

function endTaskAndStartTask() {
  endTask()
  startNew.value = 'input'
}

function endTaskAndQuickStartTask() {
  endTask()
  startNew.value = 'quick'
}

function closeEndTaskDialog() {
  currentTaskForUpdate.value = {}
  endTaskDialog.value = false
}
/*** section:endTask ***/

/*** section:banner ***/
function showBanner(message) {
  banner.show(message)
  setTimeout(hideBanner, 5000)
}

function hideBanner() {
  banner.hide()
}
/*** section:banner ***/

/*** section:events ***/
events.registerListener(
  'loadTodayLogs',
  {
    id: 'TodayLog',
    invoke: (payload) => {
      loadToday()
    }
  }
)
/*** section:events ***/

async function loadSchemas() {
  await dataAccess
    .schemas(schemasUrl)
    .then((result) => {
      const fields = result.fields
      combinedDataFields.value = formatDataFields(fields)
    })
    .catch((error) => {
      showBanner(`Error loading schemas!`)
      console.log(error)
    })
}

async function loadToday() {
  const params = {
    include: includeKeys.value,
    filters: {
      startTime: {
        startDate: startOfToday.value,
        endDate: endOfToday.value
      }
    },
    sort: {
      field: 'startTime',
      order: 'desc'
    }
  }

  await dataAccess
    .list(worklogsUrl, params)
    .then((result) => {
      todayLogs.value = formatWorkLogs(result.data)
      currentTask.value = formatExistingTask(todayLogs.value[0])
    })
    .catch((error) => {
      showBanner(`Error loading work logs!`)
      console.log(error)
    })
}

onMounted(async () => {
  await loadToday()
  await loadSchemas()
})
</script>

<template>
  <div class="today-logs-container">
    <div class="controls">
      <div
        v-if="!openTask"
        class="button"
        @click="startTask"
      >
        Start New Task
      </div>

      <div
        v-if="!openTask"
        class="button"
        @click="quickStartTask"
      >
        Quick Start New Task
      </div>

      <div
        v-if="openTask"
        class="button"
        @click="endTask"
      >
        End Current Task
      </div>

      <div
        v-if="openTask"
        class="button"
        @click="endTaskAndStartTask"
      >
        End and Start New
      </div>

      <div
        v-if="openTask"
        class="button"
        @click="endTaskAndQuickStartTask"
      >
        End and Quick Start
      </div>
    </div> <!-- controls -->

    <div class="logs">
      <div
        class="total"
      >
        Today's total: 0 h 0 m 0 s
      </div>

      <div
        v-for="log in todayLogs"
        class="log"
      >
        <div class="divider"></div>

        <div class="duration">
          <div class="start-time">{{ formatShortTime(log.startTime) }}</div>

          <div
            v-if="notEmpty(log.endTime)"
            class="end-time"
          >
            to {{ formatShortTime(log.endTime) }}
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
