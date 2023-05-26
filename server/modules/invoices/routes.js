'use strict'

module.exports = (routes, stores, logger) => {
  function createWithLines(stores) {
    return function(req, res) {
      const params = req.body;

      const result = stores.createWithLines(params);

      if (result.success) {
        res.status(201).send(result);
      } else {
        res.status(400).send(result);
      }
    }
  }

  return {
    prefix: '/api/invoices',
    routes: [
      { method: 'get', path: '/download', handler: routes.download(stores) },
      { method: 'get', path: '/', handler: routes.list(stores) },
      { method: 'get', path: '/:id', handler: routes.view(stores) },
      { method: 'post', path: '/', handler: routes.create(stores) },
      { method: 'put', path: '/:id', handler: routes.update(stores) },
      { method: 'delete', path: '/:id', handler: routes.remove(stores) },
      { method: 'post', path: '/generate_with_lines', handler: createWithLines(stores) }
    ]
  }
}
