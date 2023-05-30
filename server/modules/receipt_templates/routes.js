module.exports = (routes, stores) => {
  return {
    prefix: '/api/receipt_templates',
    routes: [
      { method: 'get', path: '/download', handler: routes.download(stores) },
      { method: 'get', path: '/', handler: routes.list(stores) },
      { method: 'get', path: '/:id', handler: routes.view(stores) },
      { method: 'post', path: '/', handler: routes.create(stores) },
      { method: 'put', path: '/:id', handler: routes.update(stores) },
      { method: 'delete', path: '/:id', handler: routes.remove(stores) },
      { method: 'post', path: '/:id/pdf', handler: routes.downloadPdf('receipt_templates', stores) },
    ],
  };
};
