const express = require('express');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

const cors = require('cors');

const common = require('./common');
const dataAccess = require('./server/stores/dataAccess');
const routes = require('./server/routes/shared');

const app = express();
const port = process.env.PORT || common.DEFAULT_PORT;

let server = null;

let corsConfig = {}

if (process.env.NODE_ENV === 'development') {
  corsConfig = {
    origin: 'http://localhost'
  }
}

async function loadPlugins(app) {
  await fsPromises.readdir(path.join(__dirname, 'server/modules'))
    .then((files) => {
      for (const file of files) {
        const plugin = require(path.join(__dirname, 'server/modules', file, 'index.js'))(dataAccess, routes);
        const pluginRouter = plugin.router;
        pluginRouter.routes.forEach((route) => {
          app[route.method](`${pluginRouter.prefix}${route.path}`, route.handler);
        });
        console.log(`Loaded plugin: ${plugin.name}`);
      }
    })
    .catch((err) => {
      console.error(err);
    })
}

/*** start:Middleware ***/
app.use(express.json())
app.use(cors(corsConfig));
app.use(express.static(path.join(__dirname, 'public')));
/*** end:Middleware ***/

/*** start:Routes ***/
app.get('/', function(req, res){
  (async () => {
    await dataAccess.initData();
    console.log(`Refreshed data`);
  })();
});

app.get('/api/schemas/:schema', function(req, res){
  const modelClass = req.params.schema;
  res.send(dataAccess.viewSchemas(modelClass));
});
/*** end:Routes ***/

(async () => {
  await dataAccess.initData();

  await loadPlugins(app);

  // fallback
  app.get('/*', function(req, res){
    res.redirect('/');
  });

  console.log(`Server starting at port ${port}`);

  server = app.listen(port);
})();

module.exports = {
  server
};
