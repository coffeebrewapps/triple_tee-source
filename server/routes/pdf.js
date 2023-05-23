'use strict'

const { Liquid } = require('liquidjs');
const liquidEngine = new Liquid();

module.exports = (templateType) => {
  function downloadPdf(stores) {
    return async function(req, res) {
      const params = req.body;
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
      content.push(`
      @page {
        size: A4 portrait;
        margin: 0 0 0 -12px;
        font-family: Roboto, sans-serif;
        font-size: 12px;
      }

      @page landscape {
        size: A4 landscape;
      }

      @page portrait {
        size: A4 portrait;
      }

      `);
      content.push(template.contentStyles);
      content.push(`</style>`)

      content.push(`</head>`)

      content.push(`<body>`)
      content.push(template.contentMarkup)
      content.push(`</body>`)

      content.push(`</html>`)

      const filename = `${templateType}_${id}.pdf`;
      const htmlString = content.join('')

      liquidEngine
        .parseAndRender(htmlString, params)
        .then((result) => {
          try {
            res.html2pdf({
              filename: filename,
              htmlString: result,
            });
          } catch(error) {
            console.log(error);
          }
        })
        .catch((error) => {
          res.status(400).send({ errors: error })
        })
    }
  }

  return {
    downloadPdf
  }
}
