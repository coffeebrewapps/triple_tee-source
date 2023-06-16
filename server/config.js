const path = require('path');
const fs = require('fs');

function readConfigFile({ utils, appConfigPath, appRootDir, logsRootDir }) {
  const result = fs.readFileSync(appConfigPath, { encoding: 'utf8' });
  const parsedResult = JSON.parse(result);
  const dataRootDir = parsedResult.dataRootDir || appRootDir;

  let dataDir = null;
  if (utils.isEmpty(parsedResult.dataDir)) {
    dataDir = path.join(dataRootDir, 'data');
  } else if (path.isAbsolute(parsedResult.dataDir)) {
    dataDir = parsedResult.dataDir;
  } else {
    dataDir = path.join(dataRootDir, parsedResult.dataDir);
  }

  let logFile = null;
  if (utils.isEmpty(parsedResult.logFile)) {
    logFile = path.join(logsRootDir, 'debug.log');
  } else if (path.isAbsolute(parsedResult.logFile)) {
    logFile = parsedResult.logFile;
  } else {
    logFile = path.join(logsRootDir, parsedResult.logFile);
  }

  let modulesDir = null;
  if (utils.isEmpty(parsedResult.modulesDir)) {
    modulesDir = path.join(appRootDir, 'modules');
  } else if (path.isAbsolute(parsedResult.modulesDir)) {
    modulesDir = parsedResult.modulesDir;
  } else {
    modulesDir = path.join(appRootDir, parsedResult.modulesDir);
  }

  let uploadDir = null;
  if (utils.isEmpty(parsedResult.uploadDir)) {
    uploadDir = path.join(dataRootDir, 'uploads');
  } else if (path.isAbsolute(parsedResult.uploadDir)) {
    uploadDir = parsedResult.uploadDir;
  } else {
    uploadDir = path.join(dataRootDir, parsedResult.uploadDir);
  }

  return Object.assign(
    {},
    parsedResult,
    {
      dataDir,
      logFile,
      modulesDir,
      uploadDir,
    }
  );
}

module.exports = {
  readConfigFile,
};
