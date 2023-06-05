const path = require('path');
const { startServer } = require('../server/index.js');
const port = process.env.PORT;
const configPath = path.join(__dirname, '../app_config.json');

startServer(port, configPath);
