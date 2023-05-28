const path = require('path')
const fs = require('fs');

const rootDir = path.dirname(__filename);

function readConfigFile() {
  const configFile = path.join(rootDir, '../app_config.json');
  const result = fs.readFileSync(configFile, { encoding: 'utf8' });
  const parsedResult = JSON.parse(result);

  const dataDir = path.join(rootDir, parsedResult.dataDir);
  const logFile = path.join(rootDir, parsedResult.logFile);
  const modulesDir = path.join(rootDir, parsedResult.modulesDir);

  return Object.assign(
    {},
    parsedResult,
    {
      dataDir,
      logFile,
      modulesDir
    }
  )
}

module.exports = {
  readConfigFile
}
