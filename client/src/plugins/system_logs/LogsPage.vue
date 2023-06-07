<script setup>
/** import:global **/
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
/** import:global **/

/** import:utils **/
import { useDataAccess } from '@/utils/dataAccess';
/** import:utils **/

/** section:utils **/
const dataAccess = useDataAccess();
/** section:utils **/

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

onMounted(() => {
  streamDebugLogs();
});

onBeforeUnmount(() => {
  clearInterval(streamDebugLogsIntervalId.value);
});
</script>

<template>
  <div class="page-container">
    <div class="title">
      Streaming the last 20 entries every second.
    </div>

    <div class="logs">
      <pre>{{ logsContent }}</pre>
    </div>
  </div>
</template>

<style scoped>
.title {
  padding: 1rem 0;
}

.logs {
  margin-top: 1rem;
  padding: 1rem;
  width: 90vw;
  height: 70vh;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: auto;
}

.logs pre {
  font-size: 0.8rem;
  white-space: break-spaces;
}
</style>
