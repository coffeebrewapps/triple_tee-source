module.exports = ({ routes, stores, uploader }) => {
  function create(stores) {
    return function(req, res) {
      const logoUpload = uploader.single('logo');
      logoUpload(req, res, (err) => {
        if (err) {
          res.status(400).send({
            success: false,
            errors: { logo: ['invalid'] }
          });
        } else {
          const params = req.body;
          const result = stores.create(params);

          if (result.success) {
            res.status(201).send(result);
          } else {
            res.status(400).send(result);
          }
        }
      });
    }
  }
  function update(stores) {
    return function(req, res) {
      const logoUpload = uploader.single('logo');
      logoUpload(req, res, (err) => {
        if (err) {
          res.status(400).send({
            success: false,
            errors: { logo: ['invalid'] }
          });
        } else {
          const id = req.params.id;
          const logoPath = req.file.path;
          const params = Object.assign({}, req.body, { logo: logoPath });
          const result = stores.update(id, params);

          if (result.success) {
            res.status(200).send(result);
          } else {
            res.status(400).send(result);
          }
        }
      });
    }
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
