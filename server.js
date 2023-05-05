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

/*** start:Middleware ***/
app.use(express.json())
app.use(cors(corsConfig));
app.use(express.static(path.join(__dirname, 'public')));
/*** end:Middleware ***/

/*** start:Routes ***/
app.get('/', function(req, res){
  res.send('Server is ready!');
});

app.use('/api/users', users.router);
/*** end:Routes ***/

(async () => {
  await dataAccess.initData('users');

  console.log(`Server starting at port ${port}`);

  server = app.listen(port);
})();

module.exports = {
  server
};
