'use strict'

function downloadPdf(stores) {
  return async function(req, res) {
    const id = req.params.id;
    const result = stores.view(id, {});
    const template = result.record;

    if (Object.keys(template).length === 0) {
      res.status(400).send({ errors: 'Record not found' });
      return;
    }

    const content = [];

    content.push(`<html>`);
    content.push(`<head>`);

    content.push(`<style>`);
    content.push(template.contentStyles);
    content.push(`</style>`)

    content.push(`</head>`)

    content.push(`<body>`)
    content.push(template.contentMarkup)
    content.push(`</body>`)

    content.push(`</html>`)

    const filename = `invoice_templates_${id}.pdf`;
    const htmlString = content.join('')

    try {
      await res.html2pdf({
        filename: filename,
        htmlString: htmlString,
      });
    } catch(error) {
      console.log(error);
    }
  }
}

module.exports = (routes, stores) => {
  return {
    prefix: '/api/invoice_templates',
    routes: [
      { method: 'get', path: '/download', handler: routes.download(stores) },
      { method: 'get', path: '/', handler: routes.list(stores) },
      { method: 'get', path: '/:id', handler: routes.view(stores) },
      { method: 'post', path: '/', handler: routes.create(stores) },
      { method: 'put', path: '/:id', handler: routes.update(stores) },
      { method: 'delete', path: '/:id', handler: routes.remove(stores) }
    ],
    middlewares: [
      { path: '/:id/pdf', handler: downloadPdf(stores) }
    ]
  }
}
