module.exports = ({ routes, stores, logger, utils }) => {
  function previewInvoice(stores) {
    return function(req, res) {
      const params = req.body;

      const result = stores.previewInvoice(params);

      if (result.success) {
        res.status(200).send(result);
      } else {
        res.status(400).send(result);
      }
    };
  }

  function createWithLines(stores) {
    return function(req, res) {
      const params = req.body;

      const result = stores.createWithLines(params);

      if (result.success) {
        res.status(201).send(result);
      } else {
        res.status(400).send(result);
      }
    };
  }

  function viewTemplateData(stores) {
    return function(req, res) {
      const params = req.params;

      const result = stores.viewTemplateData(params);

      if (result.success) {
        res.status(200).send(result);
      } else {
        res.status(400).send(result);
      }
    };
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
      { method: 'post', path: '/preview_invoice', handler: previewInvoice(stores) },
      { method: 'post', path: '/generate_with_lines', handler: createWithLines(stores) },
      { method: 'get', path: '/:id/template_data', handler: viewTemplateData(stores) },
    ],
  };
};
