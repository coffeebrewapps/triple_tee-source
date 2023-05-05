'use strict'

const usersStore = require('../stores/users');

exports.list = function(req, res){
  const params = req.query;
  console.log(`Requesting all users: ${JSON.stringify(params)}`);
  res.send(usersStore.list(params));
};

exports.view = function(req, res){
  res.send({
    user: usersStore.view(req.params.id)
  });
};

exports.update = function(req, res){
  const params = req.params;
  const id = params.id;

  res.send({
    user: usersStore.edit(id, params)
  });
};
