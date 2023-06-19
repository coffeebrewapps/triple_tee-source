const templateType = 'invoice_templates';
const store = {
  view: () => {},
};
const logger = {
  log: () => {},
  error: () => {},
};

const {
  downloadPdf,
} = require('../../routes/pdf.js')(templateType, store, logger);

const send = jest.fn((result) => { return result; });
const status = jest.fn();
const header = jest.fn((name, value) => {});
const end = jest.fn();

const res = {
  send,
  status,
  header,
  end,
  body: null,
};

const convertToPdf = (htmlString) => {
  return new Promise((resolve, reject) => {
    resolve({
      pipe: (res) => { res.body = htmlString; },
      on: (event, cb) => { cb(); },
    });
  });
};

const createHtmlString = (template, params) => {
  return new Promise((resolve, reject) => {
    if (template.id === '1') {
      resolve('<div>124.23</div>');
    } else {
      reject(new Error('invalid template'));
    }
  });
};

jest.mock('../../html2pdf/index', () => {
  return (logger) => {
    return {
      createHtmlString,
      convertToPdf,
    };
  };
});

afterEach(() => {
  res.body = null;
  jest.resetAllMocks();
});

describe('downloadPdf', () => {
  const req = {
    params: { id: '1' },
    body: { totalAmount: 124.23 },
  };

  test('success result', async() => {
    jest.spyOn(store, 'view').mockImplementation((id, params) => {
      return {
        success: true,
        record: {
          id: '1',
          contentMarkup: '<div>{{ totalAmount }}</div>',
          contentStyles: '',
        },
      };
    });

    expect(res.body).toBe(null);
    await downloadPdf(req, res);
    expect(header).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(header).toHaveBeenCalledWith('Content-Disposition', 'inline; filename="invoice_templates_1.pdf"');
    expect(header).toHaveBeenCalledWith('Content-Transfer-Encoding', 'binary');
    expect(res.body).toBe('<div>124.23</div>');
  });

  test('template not found', async() => {
    jest.spyOn(store, 'view').mockImplementation((id, params) => {
      return {
        success: false,
        errors: { id: ['notFound'] },
      };
    });

    const resStatusSpy = jest.spyOn(res, 'status').mockReturnValue({ send });

    await downloadPdf(req, res);
    expect(send).toHaveBeenCalledWith({
      success: false,
      errors: { id: ['notFound'] },
    });
    expect(resStatusSpy).toHaveBeenCalledWith(400);
  });

  test('parse html failure', async() => {
    jest.spyOn(store, 'view').mockImplementation((id, params) => {
      return {
        success: true,
        record: {
          id: '2',
          contentMarkup: '',
          contentStyles: '',
        },
      };
    });

    const resStatusSpy = jest.spyOn(res, 'status').mockReturnValue({ send });

    await downloadPdf(req, res);
    expect(send).toHaveBeenCalledWith({
      success: false,
      errors: { contentMarkup: ['invalid'] },
    });
    expect(resStatusSpy).toHaveBeenCalledWith(400);
  });
});
