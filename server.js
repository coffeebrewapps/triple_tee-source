const express = require('express');
const path = require('path');

const common = require('./common');

const app = express();
const port = process.env.PORT || common.DEFAULT_PORT;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.send('Server is ready!');
});

const server = app.listen(port);
console.log(`Server starting at port ${port}`);

module.exports = {
  server
};
