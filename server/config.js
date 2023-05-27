const path = require('path')

const rootDir = path.dirname(require.main.filename);

module.exports = {
  dataStore: 'fs',
  dataDir: path.join(rootDir, 'data'),
  logFile: path.join(rootDir, 'debug.log'),
  modulesDir: path.join(rootDir, 'server/modules'),
  schemas: '_schemas',
  indexes: '_indexes'
}
