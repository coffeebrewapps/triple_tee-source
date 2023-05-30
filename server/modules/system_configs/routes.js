module.exports = (routes, stores, logger, utils) => {
  function viewLatest(stores) {
    return function(req, res) {
      const result = stores.viewLatest();

      if (result.success) {
        res.status(200).send(result);
      } else {
        res.status(400).send(result);
      }
    };
  }

  function replaceLatest(stores) {
    return function(req, res) {
      const params = req.body;
      const result = stores.replaceLatest(params);

      if (result.success) {
        res.status(200).send(result);
      } else {
        res.status(400).send(result);
      }
    };
  }

  return {
    prefix: '/api/system_configs',
    routes: [
      { method: 'get', path: '/download', handler: routes.download(stores) },
      { method: 'get', path: '/', handler: routes.list(stores) },
      { method: 'get', path: '/latest', handler: viewLatest(stores) },
      { method: 'post', path: '/replace', handler: replaceLatest(stores) },
      { method: 'get', path: '/:id', handler: routes.view(stores) },
      { method: 'post', path: '/', handler: routes.create(stores) },
      { method: 'put', path: '/:id', handler: routes.update(stores) },
      { method: 'delete', path: '/:id', handler: routes.remove(stores) },
    ],
  };
};
