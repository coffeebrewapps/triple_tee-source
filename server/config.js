const path = require('path');
const fs = require('fs');

const rootDir = path.dirname(__filename);

function readConfigFile() {
  const configFile = path.join(rootDir, '../app_config.json');
  const result = fs.readFileSync(configFile, { encoding: 'utf8' });
  const parsedResult = JSON.parse(result);

  let dataDir = null;
  if (path.isAbsolute(parsedResult.dataDir)) {
    dataDir = parsedResult.dataDir;
  } else {
    dataDir = path.join(rootDir, parsedResult.dataDir);
  }

  let logFile = null;
  if (path.isAbsolute(parsedResult.logFile)) {
    logFile = parsedResult.logFile;
  } else {
    logFile = path.join(rootDir, parsedResult.logFile);
  }

  let modulesDir = null;
  if (path.isAbsolute(parsedResult.modulesDir)) {
    modulesDir = parsedResult.modulesDir;
  } else {
    modulesDir = path.join(rootDir, parsedResult.modulesDir);
  }

  return Object.assign(
    {},
    parsedResult,
    {
      dataDir,
      logFile,
      modulesDir,
    }
  );
}

module.exports = {
  readConfigFile,
};
