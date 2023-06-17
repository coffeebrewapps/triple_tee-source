const express = require('express');
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;
const { Duplex } = require('stream');

const app = express();
const cors = require('cors');

async function loadPlugins(app, modulesDir, dependencies) {
  await fsPromises.readdir(modulesDir)
    .then((files) => {
      for (const file of files) {
        dependencies.logger.log(`Loading plugin file`, { file });
        const plugin = require(path.join(modulesDir, file, 'index.js'))(dependencies);
        dependencies.logger.log(`Loading plugin`, { plugin });
        const pluginRouter = plugin.router;
        pluginRouter.routes.forEach((route) => {
          if (route.multipart) {
            app[route.method](`${pluginRouter.prefix}${route.path}`, route.handler);
          } else {
            app[route.method](`${pluginRouter.prefix}${route.path}`, dependencies.uploader.none(), route.handler);
          }
        });
        dependencies.logger.log(`Loaded plugin`, { name: plugin.name });
      }
    })
    .catch((err) => {
      dependencies.logger.error(err);
    });
}

async function startServer({ port, appConfigPath, appRootDir, logsRootDir }) {
  const utils = require('./utils.js');
  const { readConfigFile } = require('./config.js');
  const config = readConfigFile({ utils, appConfigPath, appRootDir, logsRootDir });

  const { uploader } = require('./uploader.js')({ config });

  const logger = require('./logger.js')({ config });
  const dataAccess = require('./stores/dataAccess')({ config, logger, utils });
  const routes = require('./routes/shared')({ config, logger, utils, uploader });

  logger.log(`Loaded configs`, config);

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

  app.post('/api/logs', async function(req, res) {
    res.header('Content-Type', 'text/plain');
    const stream = new Duplex();
    stream.push(logger.tailLog());
    stream.push(null);
    stream.pipe(res);
    stream.on('end', function() {
      res.end();
    });
  });
  /** * end:Routes ***/

  await dataAccess.initData();

  await loadPlugins(app, config.modulesDir, { dataAccess, routes, logger, utils, uploader });

  // fallback
  app.get('/*', function(req, res) {
    res.redirect('/');
  });

  logger.log(`Server starting at port ${port}`);

  app.listen(port);
}

module.exports = {
  startServer,
};
