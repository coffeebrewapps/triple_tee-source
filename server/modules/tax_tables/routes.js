module.exports = ({ routes, stores, logger, utils }) => {
  function viewWithTiers(stores) {
    return function(req, res) {
      const params = req.query;
      const id = req.params.id;

      const result = stores.viewWithTiers(id, params);

      if (result.success) {
        res.status(200).send(result);
      } else {
        res.status(400).send(result);
      }
    };
  }

  return {
    prefix: '/api/tax_tables',
    routes: [
      { method: 'get', path: '/download', handler: routes.download(stores) },
      { method: 'get', path: '/', handler: routes.list(stores) },
      { method: 'get', path: '/:id', handler: routes.view(stores) },
      { method: 'post', path: '/', handler: routes.create(stores) },
      { method: 'put', path: '/:id', handler: routes.update(stores) },
      { method: 'delete', path: '/:id', handler: routes.remove(stores) },
      { method: 'get', path: '/:id/with_tiers', handler: viewWithTiers(stores) },
    ],
  };
};
