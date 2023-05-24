const fs = require('fs');
const path = require('path');

const log_file = fs.createWriteStream(path.join(__dirname, '../debug.log'), { flags : 'w' });
const log_stdout = process.stdout;

const log = function(message, params = {}) {
  log_stdout.write(`[LOG] ${message}: ${JSON.stringify(params)}\n`);
  log_file.write(`[LOG] ${message}: ${JSON.stringify(params)}\n`);
}

const error = function(message, params = {}) {
  log_stdout.write(`[ERROR] ${message}: ${JSON.stringify(params)}\n`);
  log_file.write(`[ERROR] ${message}: ${JSON.stringify(params)}\n`);
}

const warn = function(message, params = {}) {
  log_stdout.write(`[WARN] ${message}: ${JSON.stringify(params)}\n`);
  log_file.write(`[WARN] ${message}: ${JSON.stringify(params)}\n`);
}

module.exports = {
  log,
  error,
  warn
}
