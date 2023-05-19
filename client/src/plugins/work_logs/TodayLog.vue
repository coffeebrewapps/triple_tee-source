<script setup>
import { ref, computed, watch, onMounted } from 'vue'

import useConfig from '@/config'
import { useValidations } from '@/utils/validations'
import { useDataAccess } from '@/utils/dataAccess'
import { useFormatter } from '@/utils/formatter'

import { useWorkLogUtils } from './utils'

const config = useConfig()
const {
  isEmpty,
  notEmpty
} = useValidations()
const dataAccess = useDataAccess()

const {
  formatShortTime
} = useFormatter()

const {
  formatDuration,
  calculateDuration
} = useWorkLogUtils()

const worklogsUrl = `${config.baseUrl}/api/work_logs`

const props = defineProps({
  loadData: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:loadData'])

const dataLoading = computed({
  get: () => {
    return props.loadData
  },
  set: (val) => {
    emit('update:loadData', val)
  }
})

watch(dataLoading, async (newVal, oldVal) => {
  if (newVal) {
    await loadToday()
  }
})

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

  const latestEntry = todayLogs.value[0]

  return isEmpty(latestEntry.endTime)
})

function startTask() {
}

function quickStartTask() {
}

function endTask() {
}

function endTaskAndStartTask() {
  endTask()
  startTask()
}

function endTaskAndQuickStartTask() {
  endTask()
  quickStartTask()
}

function submitTaskForm() {
}

function formatWorkLogs(data) {
  return data.map((record) => {
    record.duration = calculateDuration(record)
    return record
  })
}

async function loadToday() {
  const params = {
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
    })
    .catch((error) => {
      console.log(error)
    })
    .finally(() => {
      dataLoading.value = false
    })
}

onMounted(async () => {
  await loadToday()
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
  </div> <!-- today-logs-container -->
</template>

<style scoped>
.today-logs-container {
  display: flex;
  gap: 1rem;
  margin: 1rem 0 0 0;
}

.today-logs-container .controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  width: 50%;
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
