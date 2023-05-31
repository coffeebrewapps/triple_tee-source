module.exports = ({ routes, stores }) => {
  function create(stores) {
    return routes.withFileUpload('logo', (req, res) => {
      const { path, originalname, mimetype } = req.file;
      const params = Object.assign({}, req.body, { logo: { path, originalname, mimetype } });
      const result = stores.create(params);

      if (result.success) {
        res.status(201).send(result);
      } else {
        res.status(400).send(result);
      }
    });
  }

  function update(stores) {
    return routes.withFileUpload('logo', (req, res) => {
      const id = req.params.id;
      const { path, originalname, mimetype } = req.file;
      const params = Object.assign({}, req.body, { logo: { path, originalname, mimetype } });
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
      { method: 'post', path: '/', handler: create(stores) },
      { method: 'put', path: '/:id', handler: update(stores) },
      { method: 'delete', path: '/:id', handler: routes.remove(stores) },
    ],
  };
};
