const express = require('express');
const path = require('path');

const cors = require('cors');

const common = require('./common');
const users = require('./server/routes/users');

const dataAccess = require('./server/stores/dataAccess');

const app = express();
const port = process.env.PORT || common.DEFAULT_PORT;

let server = null;

let corsConfig = {}

if (process.env.NODE_ENV === 'development') {
  corsConfig = {
    origin: 'http://localhost'
  }
}

app.use(express.json())
app.use(cors(corsConfig));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.send('Server is ready!');
});

// Users
app.get('/api/users', users.list);
app.get('/api/users/:id', users.view);
app.put('/api/users/:id', users.update);
app.delete('/api/users/:id', users.remove);

(async () => {
  await dataAccess.initData('users');

  console.log(`Server starting at port ${port}`);

  server = app.listen(port);
})();

module.exports = {
  server
};
