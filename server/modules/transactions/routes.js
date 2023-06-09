module.exports = ({ routes, stores }) => {
  function reverseTransaction(stores) {
    return function(req, res) {
      const id = req.params.id;

      const result = stores.reverseTransaction(id);

      if (result.success) {
        res.status(200).send(result);
      } else {
        res.status(400).send(result);
      }
    };
  }

  return {
    prefix: '/api/transactions',
    routes: [
      { method: 'get', path: '/download', handler: routes.download(stores) },
      { method: 'get', path: '/', handler: routes.list(stores) },
      { method: 'get', path: '/:id', handler: routes.view(stores) },
      { method: 'post', path: '/', handler: routes.create(stores) },
      { method: 'put', path: '/:id', handler: routes.update(stores) },
      { method: 'delete', path: '/:id', handler: routes.remove(stores) },
      { method: 'put', path: '/:id/reverse', handler: reverseTransaction(stores) },
    ],
  };
};
