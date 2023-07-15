module.exports = (templateType, stores, logger) => {
  const html2pdf = require('../html2pdf/index')(logger);

  async function createResponse(res, htmlString, filename) {
    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', `inline; filename="${filename}"`);
    res.header('Content-Transfer-Encoding', 'binary');

    const pdfStream = await html2pdf.convertToPdf(htmlString);

    pdfStream.pipe(res);
    pdfStream.on('end', function() {
      res.end();
    });
  }

  async function downloadPdf(req, res) {
    const params = req.body;
    const id = req.params.id;
    const result = stores.view(id, {});

    if (!result.success) {
      res.status(400).send(result);
      return;
    }

    const template = result.record;

    const filename = `${templateType}_${id}.pdf`;
    const htmlString = await html2pdf.createHtmlString(template, params)
      .then((result) => {
        logger.log(`Parsing complete!`);
        return result;
      })
      .catch((error) => {
        logger.error(`Error parsing template!`, error);
        return;
      });

    if (htmlString) {
      await createResponse(res, htmlString, filename);
    } else {
      res.status(400).send({
        success: false,
        errors: { contentMarkup: ['invalid'] },
      });
    }
  }

  return {
    downloadPdf,
  };
};
