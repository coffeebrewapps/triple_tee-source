const log = function(message, params = {}) {
  console.log(`[LOG] ${message}: ${JSON.stringify(params)}`);
}

const error = function(message, params = {}) {
  console.log(`[ERROR] ${message}: ${JSON.stringify(params)}`);
}

const warn = function(message, params = {}) {
  console.log(`[WARN] ${message}: ${JSON.stringify(params)}`);
}

module.exports = {
  log,
  error,
  warn
}
