import { Liquid } from 'liquidjs';

import html2pdf from 'html2pdf.js';
const liquidEngine = new Liquid();

export function useStore(dataStore) {
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

  async function downloadPdf(modelClass, id, params) {
    const template = dataStore.view(modelClass, id, {}).record;
    const htmlString = await createHtmlString(template, params);

    return new Promise((resolve, reject) => {
      html2pdf().from(htmlString).outputPdf('arraybuffer')
        .then((result) => {
          console.log(`Parsing complete!`);
          resolve({
            data: result,
          });
        })
        .catch((error) => {
          console.log(`Error parsing template!`, error);
          reject(error);
        });
    });
  }

  return {
    downloadPdf,
  };
}
