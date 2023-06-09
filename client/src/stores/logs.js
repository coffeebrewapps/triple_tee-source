import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useLogsStore = defineStore('logs', () => {
  const logs = ref([]);

  function saveLog(message) {
    logs.value.unshift(message);
    if (logs.value.length > 20) {
      logs.value.splice(logs.value.length - 1, 1);
    }
  }

  function tailLog() {
    return logs.value.join('\n');
  }

  return { saveLog, tailLog };
});
