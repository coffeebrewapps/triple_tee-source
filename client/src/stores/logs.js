import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useLogsStore = defineStore('logs', () => {
  const logs = ref([]);

  function saveLog(message) {
    logs.value.unshift(message);
  }

  function tailLog() {
    return logs.value.slice(0, 20).join('\n');
  }

  return { saveLog, tailLog };
});
