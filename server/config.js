const path = require('path');
const fs = require('fs');

const rootDir = path.dirname(__filename);

function readConfigFile(appConfigPath) {
  const result = fs.readFileSync(appConfigPath, { encoding: 'utf8' });
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

  let uploadDir = null;
  if (path.isAbsolute(parsedResult.uploadDir)) {
    uploadDir = parsedResult.uploadDir;
  } else {
    uploadDir = path.join(rootDir, parsedResult.uploadDir);
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
