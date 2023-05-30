const express = require('express');
const path = require('path');
const fsPromises = require('fs').promises;

const cors = require('cors');

const common = require('../common');
const utils = require('./utils.js');
const { readConfigFile } = require('./config.js');
const config = readConfigFile();

const logger = require('./logger.js')(config);
const dataAccess = require('./stores/dataAccess')(config, logger, utils);
const routes = require('./routes/shared')(config, logger, utils);

logger.log(`Loaded configs`, config);

const app = express();
const port = config.port || process.env.PORT || common.DEFAULT_PORT;

let server = null;

let corsConfig = {};

if (process.env.NODE_ENV === 'development') {
  corsConfig = {
    origin: 'http://localhost',
  };
}

process.on('uncaughtException', (error, origin) => {
  logger.error(`Uncaught error occurred`, { error, origin });
});

process.on('unhandledRejection', (error, origin) => {
  logger.error(`Unhandled rejection occurred`, { error, origin });
});

async function loadPlugins(app) {
  await fsPromises.readdir(config.modulesDir)
    .then((files) => {
      for (const file of files) {
        const plugin = require(path.join(config.modulesDir, file, 'index.js'))(dataAccess, routes, logger, utils);
        logger.log(`Loading plugin: ${plugin.name}`);
        const pluginRouter = plugin.router;
        pluginRouter.routes.forEach((route) => {
          app[route.method](`${pluginRouter.prefix}${route.path}`, route.handler);
        });
        logger.log(`Loaded plugin: ${plugin.name}`);
      }
    })
    .catch((err) => {
      logger.error(err);
    });
}

/** * start:Middleware ***/
app.use(express.json());
app.use(cors(corsConfig));
app.use(express.static(path.join(__dirname, 'public')));
/** * end:Middleware ***/

/** * start:Routes ***/
app.get('/', function(req, res) {
  (async() => {
    await dataAccess.initData();
    logger.log(`Refreshed data`);
  })();
});

app.get('/api/schemas', function(req, res) {
  res.send(dataAccess.listSchemas());
});

app.get('/api/schemas/:schema', function(req, res) {
  const modelClass = req.params.schema;
  res.send(dataAccess.viewSchemas(modelClass));
});

app.get('/api/schemas/:schema/download', function(req, res) {
  const modelClass = req.params.schema;
  res.send(dataAccess.download(modelClass));
});

app.put('/api/schemas/:schema/upload', function(req, res) {
  const modelClass = req.params.schema;
  const data = req.body;
  res.send(dataAccess.upload(modelClass, data));
});

app.get('/api/indexes', function(req, res) {
  res.send(dataAccess.downloadIndexes());
});

app.put('/api/indexes', function(req, res) {
  const data = req.body;
  res.send(dataAccess.uploadIndexes(data));
});

app.get('/api/countries', function(req, res) {
  const params = req.query;
  logger.log(`Requesting countries data`, params);
  res.send(dataAccess.list('countries', params));
});
/** * end:Routes ***/

(async() => {
  await dataAccess.initData();

  await loadPlugins(app);

  // fallback
  app.get('/*', function(req, res) {
    res.redirect('/');
  });

  logger.log(`Server starting at port ${port}`);

  server = app.listen(port);
})();

module.exports = {
  server,
};
