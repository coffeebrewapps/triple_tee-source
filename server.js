const express = require('express');
const path = require('path');

const common = require('./common');
const users = require('./server/routes/users');

const app = express();
const port = process.env.PORT || common.DEFAULT_PORT;

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
