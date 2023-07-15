const fs = require('fs');

module.exports = ({ config }) => {
  const logToFile = fs.createWriteStream(config.logFile, { flags: 'w' });
  const logToStdout = process.stdout;
  const lastCachedLogs = [];

  const logLevels = {
    log: 'LOG',
    error: 'ERROR',
    warn: 'WARN',
  };

  function cacheLog(message) {
    lastCachedLogs.unshift(message);
    if (lastCachedLogs.length > 20) {
      lastCachedLogs.splice(lastCachedLogs.length - 1, 1);
    }
  }

  function tailLog() {
    return lastCachedLogs.join('');
  }

  function formatMessage(level, message, params) {
    const now = (new Date()).toLocaleString({ dateStyle: 'long' });
    return `[${now}][${level}] ${message}: ${JSON.stringify(params)}\n`;
  }

  const log = function(message, params = {}) {
    const formattedMessage = formatMessage(logLevels.log, message, params);
    cacheLog(formattedMessage);
    logToStdout.write(formattedMessage);
    logToFile.write(formattedMessage);
  };

  const error = function(message, params = {}) {
    const formattedMessage = formatMessage(logLevels.error, message, params);
    cacheLog(formattedMessage);
    logToStdout.write(formattedMessage);
    logToFile.write(formattedMessage);
  };

  const warn = function(message, params = {}) {
    const formattedMessage = formatMessage(logLevels.warn, message, params);
    cacheLog(formattedMessage);
    logToStdout.write(formattedMessage);
    logToFile.write(formattedMessage);
  };

  return {
    log,
    error,
    warn,
    tailLog,
  };
};
