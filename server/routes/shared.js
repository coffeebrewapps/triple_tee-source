'use strict'

exports.list = function(store) {
  return function(req, res) {
    const params = req.query;
    console.log(`Requesting all data: ${JSON.stringify(params)}`);
    res.send(store.list(params));
  }
};

exports.create = function(store) {
  return function(req, res) {
    const params = req.body;

    console.log(`Creating record: ${JSON.stringify(params)}`)
    res.send({
      record: store.create(params)
    });
  }
};

exports.view = function(store) {
  return function(req, res) {
    const params = req.params;
    const id = parseInt(params.id);
    console.log(`Viewing record[${id}]`);

    res.send(store.view(id));
  }
};

exports.update = function(store) {
  return function(req, res) {
    const params = req.body;
    const id = parseInt(req.params.id);
    delete params.id;

    console.log(`Updating record[${id}]: ${JSON.stringify(params)}`)
    res.send({
      record: store.update(id, params)
    });
  }
};

exports.remove = function(store) {
  return function(req, res) {
    const params = req.params;
    const id = parseInt(params.id);
    console.log(`Removing record[${id}]`);

    res.send({
      success: store.remove(id)
    });
  }
};
