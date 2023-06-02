<script setup>
/** import:global **/
import { ref, computed, onMounted } from 'vue';
/** import:global **/

/** import:utils **/
import { useDataAccess } from '@/utils/dataAccess';
import { useFormatter } from '@/utils/formatter';
import { useWorkLogUtils } from './utils';
/** import:utils **/

/** import:stores **/
import { useSystemConfigsStore } from '@/stores/systemConfigs';
import { useBannerStore } from '@/stores/banner';
import { useEventsStore } from '@/stores/events';
/** import:stores **/

/** section:props **/
defineProps({
  loadData: {
    type: Boolean,
    default: false,
  },
});
/** section:props **/

/** section:utils **/
const dataAccess = useDataAccess();
const systemConfigsStore = useSystemConfigsStore();
const systemConfigs = systemConfigsStore.getSystemConfigs();
const {
  formatLongDate,
} = useFormatter();
const {
  formatDuration,
  calculateDuration,
} = useWorkLogUtils();
const { flashMessage } = useBannerStore();
const events = useEventsStore();
/** section:utils **/

/** section:global **/
const selectedWeek = ref('this');
const weeklyData = ref({});
const currentWeek = ref(0);
const prevWeekTab = ref('prevWeekTab');
const thisWeekTab = ref('thisWeekTab');
const nextWeekTab = ref('nextWeekTab');

const weekStart = computed(() => {
  const today = new Date();
  const date = new Date();
  const offset = currentWeek.value * 7;

  if (selectedWeek.value === 'prev') {
    date.setDate(date.getDate() + offset);
    date.setDate(date.getDate() - today.getDay());
  } else if (selectedWeek.value === 'next') {
    date.setDate(date.getDate() + offset);
    date.setDate(date.getDate() - today.getDay());
  } else { // this week
    date.setDate(date.getDate() - today.getDay());
  }

  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);

  return date;
});

const weekEnd = computed(() => {
  const date = new Date();
  date.setDate(weekStart.value.getDate() + 6);
  date.setHours(23);
  date.setMinutes(59);
  date.setSeconds(59);
  return date;
});

const weekDays = computed(() => {
  return Array.from(Array(7)).map((_, i) => {
    const date = new Date(weekStart.value);
    date.setDate(weekStart.value.getDate() + i);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
  });
});

const weeklyFilters = computed(() => {
  return {
    startTime: {
      startDate: weekStart.value,
      endDate: weekEnd.value,
    },
  };
});

const weeklyTotalDuration = computed(() => {
  return Object.entries(weeklyData.value).reduce((weekTotal, [date, { total }]) => {
    return weekTotal + total;
  }, 0);
});

function dayEntries(day) {
  if (weeklyData.value[day]) {
    return weeklyData.value[day];
  } else {
    return {
      total: 0,
      entries: [],
    };
  }
}

function formatWeeklyData(data) {
  const days = weekDays.value.reduce((o, day) => {
    o[day] = {
      entries: [],
      total: 0,
    };
    return o;
  }, {});

  data.forEach((worklog) => {
    const time = new Date(worklog.startTime);
    const startOfDay = (new Date(time.getFullYear(), time.getMonth(), time.getDate(), 0, 0, 0));
    const duration = calculateDuration(worklog);
    days[startOfDay].entries.push(Object.assign({}, worklog, { duration }));
    days[startOfDay].total = days[startOfDay].total + duration;
  });

  return days;
}
/** section:global **/

/** section:events **/
events.registerListener(
  'loadWeeklyLogs',
  {
    id: 'WeekLog',
    invoke: (payload) => {
      loadWeekly();
    },
  }
);
/** section:events **/

/** section:styles **/
const prevWeekTabStyle = computed(() => {
  if (selectedWeek.value === 'prev') {
    return `weekly-tab active`;
  } else {
    return `weekly-tab`;
  }
});

const thisWeekTabStyle = computed(() => {
  if (selectedWeek.value === 'this') {
    return `weekly-tab active`;
  } else {
    return `weekly-tab`;
  }
});

const nextWeekTabStyle = computed(() => {
  if (selectedWeek.value === 'next') {
    return `weekly-tab active`;
  } else {
    return `weekly-tab`;
  }
});
/** section:styles **/

/** section:actions **/
async function prevWeek() {
  currentWeek.value = currentWeek.value - 1;
  selectedWeek.value = 'prev';
  prevWeekTab.value.blur();
  await loadWeekly();
}

async function thisWeek() {
  currentWeek.value = 0;
  selectedWeek.value = 'this';
  thisWeekTab.value.blur();
  await loadWeekly();
}

async function nextWeek() {
  currentWeek.value = currentWeek.value + 1;
  selectedWeek.value = 'next';
  nextWeekTab.value.blur();
  await loadWeekly();
}

function selectWeekTab(tab) {
  if (tab === 'prev') {
    prevWeekTab.value.focus();
  } else if (tab === 'next') {
    nextWeekTab.value.focus();
  } else {
    thisWeekTab.value.focus();
  }
}
/** section:actions **/

async function loadWeekly() {
  const params = {
    filters: weeklyFilters.value,
  };

  await dataAccess
    .list('work_logs', params)
    .then((result) => {
      weeklyData.value = formatWeeklyData(result.data);
    })
    .catch((error) => {
      flashMessage(`Error loading work logs!`);
      console.log(error);
    });
}

onMounted(async() => {
  await loadWeekly();
});
</script>

<template>
  <div class="weekly-tab-container">
    <div class="weekly-tabs">
      <div
        ref="prevWeekTab"
        :class="prevWeekTabStyle"
        tabindex="0"
        @click="prevWeek"
        @keydown.enter="prevWeek"
        @keydown.arrow-right="selectWeekTab('this')"
      >
        <i class="fa-solid fa-angle-left" />
        Prev Week
      </div>

      <div
        ref="thisWeekTab"
        :class="thisWeekTabStyle"
        tabindex="0"
        @click="thisWeek"
        @keydown.enter="thisWeek"
        @keydown.arrow-left="selectWeekTab('prev')"
        @keydown.arrow-right="selectWeekTab('next')"
      >
        This Week
      </div>

      <div
        ref="nextWeekTab"
        :class="nextWeekTabStyle"
        tabindex="0"
        @click="nextWeek"
        @keydown.enter="nextWeek"
        @keydown.arrow-left="selectWeekTab('this')"
      >
        Next Week
        <i class="fa-solid fa-angle-right" />
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
          v-for="(day, d) in weekDays"
          :key="d"
          class="day"
        >
          <div class="divider" />

          <div class="heading">
            <div class="date">
              {{ formatLongDate(day, systemConfigs.timezone) }}
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
              v-for="(entry, e) in dayEntries(day).entries"
              :key="e"
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
  outline: none;
}

.weekly-tab.active {
  border-bottom: 3px solid var(--color-border);
}

.weekly-tab:hover {
  cursor: pointer;
  background-color: var(--color-border-hover);
  transition: background-color 0.5s linear;
}

.weekly-tab:focus {
  outline: 5px solid var(--color-border-hover);
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
