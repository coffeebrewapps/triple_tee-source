const logger = {
  log: () => {},
  error: () => {},
};

const {
  convertToPdf,
  createHtmlString,
} = require('../../html2pdf/index')(logger);

const puppeteer = require('puppeteer');
const { Duplex } = require('stream');

jest.mock('stream', () => {
  function Duplex() {
    this.buffer = [];
    return this.buffer;
  }

  return {
    Duplex,
  };
});

jest.mock('puppeteer', () => {
  const page = {
    buffer: null,
    setJavaScriptEnabled: jest.fn(() => { return Promise.resolve(true); }),
    emulateMediaType: jest.fn((type) => { return Promise.resolve(true); }),
  };
  page.setContent = jest.fn((htmlString) => {
    page.buffer = htmlString;
    return Promise.resolve(true);
  });
  page.pdf = jest.fn((options) => { return Promise.resolve(page.buffer); });

  const browser = {
    newPage: jest.fn(() => { return Promise.resolve(page); }),
    close: jest.fn(() => { return Promise.resolve(true); }),
  };

  return {
    launch: jest.fn((options) => {
      return Promise.resolve(browser);
    }),
  };
});

describe('html2pdf', () => {
  describe('createHtmlString', () => {
    test('success result', async () => {
      const template = {
        contentStyles: `.tag { font-size: 0.6rem; }`,
        contentMarkup: `<div class="tag">{{ category }}:{{ name }}</div>`,
      };
      const params = { category: 'company', name: 'company-abc' };

      const htmlString = await createHtmlString(template, params);
      expect(htmlString).toEqual(expect.stringContaining(`<html>`));
      expect(htmlString).toEqual(expect.stringContaining(`<head>`));
      expect(htmlString).toEqual(expect.stringContaining(`<style>`));
      expect(htmlString).toEqual(expect.stringContaining(`@page {`));
      expect(htmlString).toEqual(expect.stringContaining(`size: A4 portrait;`));
      expect(htmlString).toEqual(expect.stringContaining(`margin: 0 0 0 -12px;`));
      expect(htmlString).toEqual(expect.stringContaining(`font-family: Roboto, sans-serif`));
      expect(htmlString).toEqual(expect.stringContaining(`font-size: 12px;`));

      expect(htmlString).toEqual(expect.stringContaining(`@page landscape {`));
      expect(htmlString).toEqual(expect.stringContaining(`size: A4 landscape;`));

      expect(htmlString).toEqual(expect.stringContaining(`@page portrait {`));
      expect(htmlString).toEqual(expect.stringContaining(`size: A4 portrait;`));

      expect(htmlString).toEqual(expect.stringContaining(`.tag { font-size: 0.6rem; }`));
      expect(htmlString).toEqual(expect.stringContaining(`</style>`));
      expect(htmlString).toEqual(expect.stringContaining(`</head>`));

      expect(htmlString).toEqual(expect.stringContaining(`<body>`));
      expect(htmlString).toEqual(expect.stringContaining(`<div class="tag">company:company-abc</div>`));
      expect(htmlString).toEqual(expect.stringContaining(`</body>`));
      expect(htmlString).toEqual(expect.stringContaining(`</html>`));
    });
  });

  describe('convertToPdf', () => {
    test('success result', async () => {
      const htmlString = `<div class="tag">company:company-abc</div>`;

      const stream = await convertToPdf(htmlString);
      expect(stream).toEqual(expect.arrayContaining([
        htmlString,
        null,
      ]));
    });
  });
});
