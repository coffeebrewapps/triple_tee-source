<script setup>
import { ref, computed, watch, onMounted } from 'vue'

import useConfig from '@/config'
import { useValidations } from '@/utils/validations'
import { useDataAccess } from '@/utils/dataAccess'
import { useFormatter } from '@/utils/formatter'

const config = useConfig()
const {
  isEmpty
} = useValidations()
const dataAccess = useDataAccess()

const {
  formatLongDate
} = useFormatter()

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
    await loadWeekly()
  }
})

const selectedWeek = ref('this')

const prevWeekTabStyle = computed(() => {
  if (selectedWeek.value === 'prev') {
    return `weekly-tab active`
  } else {
    return `weekly-tab`
  }
})

const thisWeekTabStyle = computed(() => {
  if (selectedWeek.value === 'this') {
    return `weekly-tab active`
  } else {
    return `weekly-tab`
  }
})

const nextWeekTabStyle = computed(() => {
  if (selectedWeek.value === 'next') {
    return `weekly-tab active`
  } else {
    return `weekly-tab`
  }
})

async function prevWeek() {
  currentWeek.value = currentWeek.value - 1
  selectedWeek.value = 'prev'
  await loadWeekly()
}

async function thisWeek() {
  currentWeek.value = 0
  selectedWeek.value = 'this'
  await loadWeekly()
}

async function nextWeek() {
  currentWeek.value = currentWeek.value + 1
  selectedWeek.value = 'next'
  await loadWeekly()
}

const weeklyData = ref({})
const currentWeek = ref(0)

const weekStart = computed(() => {
  const today = new Date()
  const date = new Date()
  const offset = currentWeek.value * 7

  if (selectedWeek.value === 'prev') {
    date.setDate(date.getDate() + offset)
    date.setDate(date.getDate() - today.getDay())
  } else if (selectedWeek.value === 'next') {
    date.setDate(date.getDate() + offset)
    date.setDate(date.getDate() - today.getDay())
  } else { // this week
    date.setDate(date.getDate() - today.getDay())
  }

  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)

  return date
})

const weekEnd = computed(() => {
  const date = new Date()
  date.setDate(weekStart.value.getDate() + 6)
  date.setHours(23)
  date.setMinutes(59)
  date.setSeconds(59)
  return date
})

const weekDays = computed(() => {
  return Array.from(Array(7)).map((_, i) => {
    const date = new Date(weekStart.value)
    date.setDate(weekStart.value.getDate() + i)
    date.setHours(0)
    date.setMinutes(0)
    date.setSeconds(0)
    return date
  })
})

const weeklyFilters = computed(() => {
  return {
    startTime: {
      startDate: weekStart.value,
      endDate: weekEnd.value
    }
  }
})

const weeklyTotalDuration = computed(() => {
  return Object.entries(weeklyData.value).reduce((weekTotal, [date, { total }]) => {
    return weekTotal + total
  }, 0)
})

function dailyTotalDuration(entries) {
  return entries.reduce((total, entry) => {
    return entry.duration + total
  }, 0)
}

function dayEntries(day) {
  if (weeklyData.value[day]) {
    return weeklyData.value[day]
  } else {
    return {
      total: 0,
      entries: []
    }
  }
}

function formatDuration(ms) {
  const days = Math.floor(ms / 1000 / 60 / 60 / 24)
  const daysInMs = days * 1000 * 60 * 60 * 24

  const hours = Math.floor((ms - daysInMs) / 1000 / 60 / 60)
  const hoursInMs = hours * 1000 * 60 * 60

  const minutes = Math.floor((ms - daysInMs - hoursInMs) / 1000 / 60)
  const minutesInMs = minutes * 1000 * 60

  const seconds = Math.floor((ms - daysInMs - hoursInMs - minutesInMs) / 1000)

  const parts = []

  if (days > 0) {
    parts.push(`${days} d`)
  }

  if (hours > 0) {
    parts.push(`${hours} h`)
  }

  if (minutes > 0) {
    parts.push(`${minutes} m`)
  }

  if (seconds > 0) {
    parts.push(`${seconds} s`)
  }

  return parts.join(' ')
}

function calculateDuration(entry) {
  if (isEmpty(entry.endTime)) {
    return ((new Date()) - (new Date(entry.startTime)))
  } else {
    return ((new Date(entry.endTime)) - (new Date(entry.startTime)))
  }
}

function formatDayEntries(entries) {
  return entries.map((entry) => {
    const totaled = Object.assign({}, entry)
    totaled.duration = calculateDuration(entry)
    return totaled
  })
}

function formatWeeklyData(data) {
  const days = weekDays.value.reduce((o, day) => {
    o[day] = {
      entries: [],
      total: 0
    }
    return o
  }, {})

  data.forEach((worklog) => {
    const time = new Date(worklog.startTime)
    const startOfDay = (new Date(time.getFullYear(), time.getMonth(), time.getDate(), 0, 0, 0))
    const duration = calculateDuration(worklog)
    days[startOfDay].entries.push(Object.assign({}, worklog, { duration: duration }))
    days[startOfDay].total = days[startOfDay].total + duration
  })

  return days
}

async function loadWeekly() {
  const params = {
    filters: weeklyFilters.value
  }

  await dataAccess
    .list(worklogsUrl, params)
    .then((result) => {
      weeklyData.value = formatWeeklyData(result.data)
    })
    .catch((error) => {
      console.log(error)
    })
    .finally(() => {
      dataLoading.value = false
    })
}

onMounted(async () => {
  await loadWeekly()
})
</script>

<template>
  <div class="weekly-tab-container">
    <div class="weekly-tabs">
      <div
        :class="prevWeekTabStyle"
        @click="prevWeek"
      >
        <i class="fa-solid fa-angle-left"></i>
        Prev Week
      </div>

      <div
        :class="thisWeekTabStyle"
        @click="thisWeek"
      >
        This Week
      </div>

      <div
        :class="nextWeekTabStyle"
        @click="nextWeek"
      >
        Next Week
        <i class="fa-solid fa-angle-right"></i>
      </div>
    </div> <!-- weekly-tabs -->

    <div
      class="weekly-tab-content"
    >
      <div
        v-if="weeklyTotalDuration > 0"
        class="total"
      >
        Week's total: {{ formatDuration(weeklyTotalDuration) }}
      </div>

      <div
        v-if="weeklyTotalDuration === 0"
        class="total"
      >
        Week's total: 0 h 0 m 0 s
      </div>

      <div class="timeline">
        <div
          v-for="day in weekDays"
          class="day"
        >
          <div class="divider">
          </div>

          <div class="heading">
            <div class="date">
              {{ formatLongDate(day) }}
            </div>

            <div
              v-if="dayEntries(day).total > 0"
              class="duration"
            >
              ({{ formatDuration(dayEntries(day).total) }})
            </div>

            <div
              v-if="dayEntries(day).total === 0"
              class="duration"
            >
              (0 h 0 m 0 s)
            </div>
          </div>

          <div class="entries">
            <div
              v-if="dayEntries(day).entries.length === 0"
            >
              No entry
            </div>

            <div
              v-for="entry in dayEntries(day).entries"
              class="entry"
            >
              <div class="description">
                {{ entry.description }}
              </div>

              <div class="duration">
                {{ formatDuration(entry.duration) }}
              </div>
            </div> <!-- entry -->
          </div> <!-- entries -->
        </div> <!-- day -->
      </div> <!-- timeline -->
    </div> <!-- weekly-tab-content -->
  </div> <!-- weekly-tab-container -->
</template>

<style scoped>
.weekly-tabs {
  display: flex;
  justify-content: center;
}

.weekly-tab {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.weekly-tab.active {
  border-bottom: 3px solid var(--color-border);
}

.weekly-tab:hover {
  cursor: pointer;
  background-color: var(--color-border-hover);
  transition: background-color 0.5s linear;
}

.weekly-tab-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: center;
  place-items: center;
  padding: 1rem;
}

.weekly-tab-content .total {
  padding: 1rem;
  background-color: var(--color-background-soft);
  border-radius: 4px;
  text-align: center;
  width: 30%;
  font-weight: 600;
}

.weekly-tab-content .timeline {
  display: flex;
  flex-direction: column;
  width: 500px;
}

.weekly-tab-content .timeline .day {
  padding: 1rem 1rem 3rem 2rem;
  border-left: 5px solid var(--color-border);
}

.weekly-tab-content .timeline .day .divider {
  position: absolute;
  top: 1rem;
  left: -13px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--color-text);
  border: 5px double rgba(255, 255, 255, 0.4);
}

.weekly-tab-content .timeline .day .heading {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 4px;
}

.weekly-tab-content .timeline .day .heading .date,
.weekly-tab-content .timeline .day .heading .duration {
  font-weight: 900;
}

.weekly-tab-content .timeline .day .heading .duration {
  font-size: 0.8rem;
  font-style: oblique;
}

.weekly-tab-content .timeline .day .entries {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.weekly-tab-content .timeline .day .entry {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}

.weekly-tab-content .timeline .day .entry .description {
  display: flex;
  flex-wrap: wrap;
}

.weekly-tab-content .timeline .day .entry .duration {
  font-size: 0.8rem;
  font-weight: 600;
  font-style: oblique;
}
</style>
