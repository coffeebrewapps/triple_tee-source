'use strict'

const usersStore = require('../stores/users');

exports.list = function(req, res) {
  const params = req.query;
  console.log(`Requesting all users: ${JSON.stringify(params)}`);
  res.send(usersStore.list(params));
};

exports.view = function(req, res) {
  const params = req.params;
  const id = parseInt(params.id);
  console.log(`Viewing user: ${id}`);

  res.send(usersStore.view(id));
};

exports.update = function(req, res) {
  const params = req.body;
  const id = parseInt(req.params.id);
  delete params.id;

  console.log(`Updating user[${id}]: ${JSON.stringify(params)}`)
  res.send({
    record: usersStore.update(id, params)
  });
};

exports.remove = function(req, res) {
  const params = req.params;
  const id = parseInt(params.id);
  console.log(`Removing user: ${id}`);

  res.send({
    success: usersStore.remove(id)
  });
};
