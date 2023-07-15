import { useFormatter } from '@/utils/formatter';
import { useLogsStore } from '@/stores/logs';
import { useSystemConfigsStore } from '@/stores/systemConfigs';

export function useLogger() {
  const logs = useLogsStore();
  const formatter = useFormatter();
  const systemConfigsStore = useSystemConfigsStore();

  const logLevels = {
    log: 'LOG',
    error: 'ERROR',
    warn: 'WARN',
    debug: 'DEBUG',
  };

  function formatMessage(level, message, params) {
    const systemConfigs = systemConfigsStore.getSystemConfigs();
    const now = formatter.formatTimestamp(new Date(), systemConfigs.timezone);
    return `[${now}][${level}] ${message}: ${JSON.stringify(params)}\n`;
  }

  function log(message, params = {}) {
    const formattedMessage = formatMessage(logLevels.log, message, params);
    logs.saveLog(formattedMessage);
    console.log(formattedMessage);
  }

  function error(message, params = {}) {
    const formattedMessage = formatMessage(logLevels.error, message, params);
    logs.saveLog(formattedMessage);
    console.error(formattedMessage);
  }

  function warn(message, params = {}) {
    const formattedMessage = formatMessage(logLevels.warn, message, params);
    logs.saveLog(formattedMessage);
    console.warn(formattedMessage);
  }

  function debug(message, params = {}) {
    const formattedMessage = formatMessage(logLevels.debug, message, params);
    logs.saveLog(formattedMessage);
    console.debug(formattedMessage);
  }

  return {
    log,
    error,
    warn,
    debug,
    tailLog: logs.tailLog,
  };
}
