const express = require('express');
const path = require('path');

const cors = require('cors');

const common = require('./common');
const users = require('./server/routes/users');

const app = express();
const port = process.env.PORT || common.DEFAULT_PORT;

let corsConfig = {}

if (process.env.NODE_ENV === 'development') {
  corsConfig = {
    origin: 'http://localhost'
  }
}

app.use(cors(corsConfig));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.send('Server is ready!');
});

// Users
app.get('/api/users', users.list);
app.get('/api/users/:id', users.view);
app.put('/api/users/:id', users.update);

const server = app.listen(port);
console.log(`Server starting at port ${port}`);

module.exports = {
  server
};
