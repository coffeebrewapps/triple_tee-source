module.exports = ({ routes, stores, logger }) => {
  function create(stores) {
    return routes.withFileUpload(['logo'], (req, res) => {
      const params = Object.assign({}, req.body);

      if (req.files.logo) {
        params.logo = req.files.logo;
      }

      const result = stores.create(params);
      if (result.success) {
        res.status(201).send(result);
      } else {
        res.status(400).send(result);
      }
    });
  }

  function update(stores) {
    return routes.withFileUpload(['logo'], (req, res) => {
      const id = req.params.id;
      const params = Object.assign({}, req.body);

      if (req.files.logo) {
        params.logo = req.files.logo;
      }

      const result = stores.update(id, params);

      if (result.success) {
        res.status(200).send(result);
      } else {
        res.status(400).send(result);
      }
    });
  }

  return {
    prefix: '/api/contacts',
    routes: [
      { method: 'get', path: '/download', handler: routes.download(stores) },
      { method: 'get', path: '/', handler: routes.list(stores) },
      { method: 'get', path: '/:id', handler: routes.view(stores) },
      { method: 'post', path: '/', handler: create(stores), multipart: true },
      { method: 'put', path: '/:id', handler: update(stores), multipart: true },
      { method: 'delete', path: '/:id', handler: routes.remove(stores) },
    ],
  };
};
