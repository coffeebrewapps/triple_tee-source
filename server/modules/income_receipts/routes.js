module.exports = ({ routes, stores, logger, utils }) => {
  function previewReceipt(stores) {
    return function(req, res) {
      const params = req.body;

      const result = stores.previewReceipt(params);

      if (result.success) {
        res.status(200).send(result);
      } else {
        res.status(400).send(result);
      }
    };
  }

  function createWithTransaction(stores) {
    return function(req, res) {
      const params = req.body;

      const result = stores.createWithTransaction(params);

      if (result.success) {
        res.status(201).send(result);
      } else {
        res.status(400).send(result);
      }
    };
  }

  function viewTemplateData(stores) {
    return function(req, res) {
      const id = req.params.id;

      const result = stores.viewTemplateData(id);

      if (result.success) {
        res.status(200).send(result);
      } else {
        res.status(400).send(result);
      }
    };
  }

  return {
    prefix: '/api/income_receipts',
    routes: [
      { method: 'get', path: '/download', handler: routes.download(stores) },
      { method: 'get', path: '/', handler: routes.list(stores) },
      { method: 'get', path: '/:id', handler: routes.view(stores) },
      { method: 'post', path: '/', handler: routes.create(stores) },
      { method: 'put', path: '/:id', handler: routes.update(stores) },
      { method: 'delete', path: '/:id', handler: routes.remove(stores) },
      { method: 'post', path: '/preview_receipt', handler: previewReceipt(stores) },
      { method: 'post', path: '/generate_with_transaction', handler: createWithTransaction(stores) },
      { method: 'get', path: '/:id/template_data', handler: viewTemplateData(stores) },
    ],
  };
};
