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
    const result = store.create(params);

    if (result.success) {
      res.status(201).send(result);
    } else {
      res.status(400).send(result);
    }
  }
};

exports.view = function(store) {
  return function(req, res) {
    const params = req.query;
    const id = req.params.id;
    logger.log(`Viewing record`, { id, params });

    res.send(store.view(id, params));
  }
};

exports.update = function(store) {
  return function(req, res) {
    const params = req.body;
    const id = req.params.id;

    logger.log(`Updating record`, { id, params })
    const result = store.update(id, params);

    if (result.success) {
      res.status(200).send(result);
    } else {
      res.status(400).send(result);
    }
  }
};

exports.remove = function(store) {
  return function(req, res) {
    const params = req.params;
    const id = params.id;
    logger.log(`Removing record`, { id });
    const result = store.remove(id);

    if (result.success) {
      res.status(200).send(result);
    } else {
      res.status(400).send(result);
    }
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
