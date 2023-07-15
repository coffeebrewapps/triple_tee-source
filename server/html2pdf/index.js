// Reference: https://github.com/hyfi06/node-html2pdf

const puppeteer = require('puppeteer');
const { Duplex } = require('stream');

const { Liquid } = require('liquidjs');
const liquidEngine = new Liquid();

module.exports = (logger) => {
  async function convertToPdf(htmlString) {
    logger.log(`Launching puppeteer browser...`);
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--disable-file-system',
        '--no-sandbox',
      ],
    });
    logger.log(`Launched puppeteer browser`);

    logger.log(`Creating new page...`);
    const page = await browser.newPage();
    logger.log(`Created new page`);

    await page.setJavaScriptEnabled(false);
    await page.setContent(htmlString);
    await page.emulateMediaType('print');

    logger.log(`Converting page pdf...`);
    const buffer = await page.pdf({});
    logger.log(`Created pdf page`);

    logger.log(`Closing browser...`);
    await browser.close();
    logger.log(`Browser closed`);

    logger.log(`Creating stream...`);
    const stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    logger.log(`Writing to stream...`);

    return stream;
  }

  async function createHtmlString(template, params) {
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
    content.push(`</style>`);

    content.push(`</head>`);

    content.push(`<body>`);
    content.push(template.contentMarkup);
    content.push(`</body>`);

    content.push(`</html>`);

    const htmlString = content.join('');

    return liquidEngine.parseAndRender(htmlString, params);
  }

  return {
    convertToPdf,
    createHtmlString,
  };
};
