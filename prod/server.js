const path = require('path');
const { startServer } = require('./dist/index');
const port = process.env.PORT;

const appRootDir = path.join(__dirname, './');
const appConfigPath = path.join(__dirname, './app_config.json');
startServer({ port, appConfigPath, appRootDir, logsRootDir: appRootDir });
