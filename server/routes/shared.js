'use strict'

const logger = require('../logger');

exports.list = function(store) {
  return function(req, res) {
    const params = req.query;
    logger.log(`Requesting all data`, params);
    res.send(store.list(params));
  }
};

exports.create = function(store) {
  return function(req, res) {
    const params = req.body;

    logger.log(`Creating record`, params)
    res.send({
      record: store.create(params)
    });
  }
};

exports.view = function(store) {
  return function(req, res) {
    const params = req.params;
    const id = parseInt(params.id);
    logger.log(`Viewing record`, { id });

    res.send(store.view(id));
  }
};

exports.update = function(store) {
  return function(req, res) {
    const params = req.body;
    const id = parseInt(req.params.id);
    delete params.id;

    logger.log(`Updating record`, { id, params })
    res.send({
      record: store.update(id, params)
    });
  }
};

exports.remove = function(store) {
  return function(req, res) {
    const params = req.params;
    const id = parseInt(params.id);
    logger.log(`Removing record`, { id });

    res.send({
      success: store.remove(id)
    });
  }
};

exports.download = function(store) {
  return function(req, res) {
    const params = req.query;
    logger.log(`Downloading data`, params);
    const data = store.list(params);
    const filename = `${store.modelClass}.json`;
    res.send({
      filename: filename,
      data: JSON.stringify(data)
    });
  }
};
