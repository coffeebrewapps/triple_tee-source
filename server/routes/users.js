'use strict'

// Fake user database

const users = [
  { id: 1, name: 'TJ', email: 'tj@vision-media.ca' },
  { id: 2, name: 'Tobi', email: 'tobi@vision-media.ca' }
];

exports.list = function(req, res){
  console.log(`requesting all users`);
  res.send({ data: users });
};

exports.load = function(req, res, next){
  const id = req.params.id;
  req.user = users[id];
  if (req.user) {
    next();
  } else {
    const err = new Error('cannot find user ' + id);
    err.status = 404;
    next(err);
  }
};

exports.view = function(req, res){
  const user = users.find(u => u.id === req.params.id);
  res.send({
    user: user
  });
};

exports.update = function(req, res){
  // Normally you would handle all kinds of
  // validation and save back to the db
  const params = req.body.user;
  const idx = users.findIndex(u => u.id === params.id);

  const user = users.splice(idx, 1);
  const updatedUser = Object.assign(user, params);
  users.push(updatedUser);

  res.send({
    user: updatedUser
  });
};
