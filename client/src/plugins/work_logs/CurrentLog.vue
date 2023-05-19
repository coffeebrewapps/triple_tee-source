<script setup>
import { ref, computed, watch, onMounted } from 'vue'

import useConfig from '@/config'
import { useValidations } from '@/utils/validations'
import { useDataAccess } from '@/utils/dataAccess'

const config = useConfig()
const {
  isEmpty
} = useValidations()
const dataAccess = useDataAccess()

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
    await loadLatest()
  }
})

const currentLog = ref()

const openTask = computed(() => {
  if (!currentLog.value) { return false }

  return isEmpty(currentLog.value.endTime)
})

async function loadLatest() {
  const params = {
    offset: 0,
    limit: 1,
    sort: {
      field: 'startTime',
      order: 'desc'
    }
  }

  await dataAccess
    .list(worklogsUrl, params)
    .then((result) => {
      if (result.total > 0) {
        currentLog.value = result.data[0]
      } else {
        currentLog.value = null
      }
    })
    .catch((error) => {
      console.log(error)
    })
    .finally(() => {
      dataLoading.value = false
    })
}

onMounted(async () => {
  await loadLatest()
})
</script>

<template>
  <div class="current-log-container">
    <div
      v-if="openTask"
      class="current-log"
    >
      You have an unfinished task.
      {{ currentLog }}
    </div>

    <div
      v-if="!openTask"
      class="no-log"
    >
      You have no open task.
    </div>
  </div>
</template>

<style scoped>
</style>
