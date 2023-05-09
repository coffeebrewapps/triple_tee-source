const express = require('express');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

const cors = require('cors');

const common = require('./common');
const store = require('./server/stores/dataAccess');

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
        const plugin = require(path.join(__dirname, 'server/modules', file, 'index.js'));
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
    await store.initData();
    console.log(`Refreshed data`);
  })();
});

app.get('/api/schemas/:schema', function(req, res){
  const modelClass = req.params.schema;
  res.send(store.viewSchemas(modelClass));
});
/*** end:Routes ***/

(async () => {
  await store.initData();

  await loadPlugins(app);

  console.log(`Server starting at port ${port}`);

  server = app.listen(port);
})();

module.exports = {
  server
};
