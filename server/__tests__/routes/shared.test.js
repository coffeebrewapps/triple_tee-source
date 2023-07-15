const config = {};
const logger = {
  log: () => {},
  error: () => {},
};
const utils = require('../../utils.js');
const uploader = require('../../uploader.js')({ config });

const {
  list,
  create,
  view,
  update,
  remove,
  download,
  downloadPdf,
  withFileUpload,
} = require('../../routes/shared.js')({ config, logger, utils, uploader });

jest.mock('../../routes/pdf', () => {
  return (templateType, store, logger) => {
    return {
      downloadPdf: (req, res) => {
        res.send('<div>company:company-abc</div> - Arbitrary Bank Corporation');
      },
    };
  };
});

jest.mock('../../uploader', () => {
  return ({ config }) => {
    return {
      single: (fileField) => {
        return (req, res, cb) => {
          req.file = fileField;
          cb();
        };
      },
    };
  };
});

afterEach(() => {
  jest.resetAllMocks();
});

const store = {
  modelClass: 'tags',
  list: jest.fn(),
  create: jest.fn(),
  view: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const send = jest.fn((result) => { return result; });
const status = jest.fn();
const header = jest.fn((name, value) => {});

const res = {
  send,
  status,
  header,
};

describe('shared routes implemented', () => {
  describe('list', () => {
    const req = {
      query: { id: [1, 2, 3] },
    };

    const route = list(store);

    test('success result', () => {
      const storeSpy = jest.spyOn(store, 'list').mockImplementation((params) => {
        return {
          total: 3,
          data: [1, 2, 3],
        };
      });
      const resSendSpy = jest.spyOn(res, 'send');

      route(req, res);

      expect(storeSpy).toHaveBeenCalledWith({ id: [1, 2, 3] });
      expect(resSendSpy).toHaveBeenCalledWith({
        total: 3,
        data: [1, 2, 3],
      });
    });
  });

  describe('view', () => {
    const req = {
      params: { id: '1' },
      query: { include: ['tags'] },
    };

    const route = view(store);

    test('success result', () => {
      const storeSpy = jest.spyOn(store, 'view').mockImplementation((id, params) => {
        return {
          success: true,
          record: {
            id: '1',
            description: 'New task',
            tags: ['1'],
            includes: { tags: { 1: { category: 'company', name: 'company-abc', description: 'ABC' } } },
          },
        };
      });

      const resStatusSpy = jest.spyOn(res, 'status').mockReturnValue({ send });

      route(req, res);
      expect(storeSpy).toHaveBeenCalledWith('1', { include: ['tags'] });
      expect(send).toHaveBeenCalledWith({
        success: true,
        record: {
          id: '1',
          description: 'New task',
          tags: ['1'],
          includes: { tags: { 1: { category: 'company', name: 'company-abc', description: 'ABC' } } },
        },
      });
      expect(resStatusSpy).toHaveBeenCalledWith(200);
    });

    test('failure result', () => {
      const storeSpy = jest.spyOn(store, 'view').mockImplementation((id, params) => {
        return {
          success: false,
          errors: { id: ['notFound'] },
        };
      });

      const resStatusSpy = jest.spyOn(res, 'status').mockReturnValue({ send });

      route(req, res);
      expect(storeSpy).toHaveBeenCalledWith('1', { include: ['tags'] });
      expect(send).toHaveBeenCalledWith({
        success: false,
        errors: { id: ['notFound'] },
      });
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
  });

  describe('create', () => {
    const req = {
      body: { category: 'company', name: 'company-abc', description: 'Company ABC' },
    };

    const route = create(store);

    test('success result', () => {
      const storeSpy = jest.spyOn(store, 'create').mockImplementation((params) => {
        return {
          success: true,
          record: { id: '1', category: 'company', name: 'company-abc', description: 'Company ABC' },
        };
      });

      const resStatusSpy = jest.spyOn(res, 'status').mockReturnValue({ send });

      route(req, res);

      expect(storeSpy).toHaveBeenCalledWith({ category: 'company', name: 'company-abc', description: 'Company ABC' });
      expect(send).toHaveBeenCalledWith({
        success: true,
        record: { id: '1', category: 'company', name: 'company-abc', description: 'Company ABC' },
      });
      expect(resStatusSpy).toHaveBeenCalledWith(201);
    });

    test('failure result', () => {
      const storeSpy = jest.spyOn(store, 'create').mockImplementation((params) => {
        return {
          success: false,
          errors: { category: ['unique'] },
        };
      });

      const resStatusSpy = jest.spyOn(res, 'status').mockReturnValue({ send });

      route(req, res);

      expect(storeSpy).toHaveBeenCalledWith({ category: 'company', name: 'company-abc', description: 'Company ABC' });
      expect(send).toHaveBeenCalledWith({
        success: false,
        errors: { category: ['unique'] },
      });
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
  });

  describe('update', () => {
    const req = {
      params: { id: '1' },
      body: { category: 'company', name: 'company-abc', description: 'Arbitrary Bank Corporation' },
    };

    const route = update(store);

    test('success result', () => {
      const storeSpy = jest.spyOn(store, 'update').mockImplementation((params) => {
        return {
          success: true,
          record: { id: '1', category: 'company', name: 'company-abc', description: 'Arbitrary Bank Corporation' },
        };
      });

      const resStatusSpy = jest.spyOn(res, 'status').mockReturnValue({ send });

      route(req, res);
      expect(storeSpy).toHaveBeenCalledWith('1', {
        category: 'company', name: 'company-abc', description: 'Arbitrary Bank Corporation',
      });
      expect(send).toHaveBeenCalledWith({
        success: true,
        record: { id: '1', category: 'company', name: 'company-abc', description: 'Arbitrary Bank Corporation' },
      });
      expect(resStatusSpy).toHaveBeenCalledWith(200);
    });

    test('failure result', () => {
      const storeSpy = jest.spyOn(store, 'update').mockImplementation((params) => {
        return {
          success: false,
          errors: { description: ['required'] },
        };
      });

      const resStatusSpy = jest.spyOn(res, 'status').mockReturnValue({ send });

      route(req, res);
      expect(storeSpy).toHaveBeenCalledWith('1', {
        category: 'company', name: 'company-abc', description: 'Arbitrary Bank Corporation',
      });
      expect(send).toHaveBeenCalledWith({
        success: false,
        errors: { description: ['required'] },
      });
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
  });

  describe('remove', () => {
    const req = {
      params: { id: '1' },
    };

    const route = remove(store);

    test('success result', () => {
      const storeSpy = jest.spyOn(store, 'remove').mockImplementation((id) => {
        return {
          success: true,
          record: { id: '1', category: 'company', name: 'company-abc', description: 'Arbitrary Bank Corporation' },
        };
      });

      const resStatusSpy = jest.spyOn(res, 'status').mockReturnValue({ send });

      route(req, res);

      expect(storeSpy).toHaveBeenCalledWith('1');
      expect(send).toHaveBeenCalledWith({
        success: true,
        record: { id: '1', category: 'company', name: 'company-abc', description: 'Arbitrary Bank Corporation' },
      });
      expect(resStatusSpy).toHaveBeenCalledWith(200);
    });

    test('failure result', () => {
      const storeSpy = jest.spyOn(store, 'remove').mockImplementation((id) => {
        return {
          success: false,
          errors: { id: ['notFound'] },
        };
      });

      const resStatusSpy = jest.spyOn(res, 'status').mockReturnValue({ send });

      route(req, res);

      expect(storeSpy).toHaveBeenCalledWith('1');
      expect(send).toHaveBeenCalledWith({
        success: false,
        errors: { id: ['notFound'] },
      });
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
  });

  describe('download', () => {
    const req = {
      query: { id: [1, 2, 3] },
    };

    const route = download(store);

    test('success result', () => {
      const storeSpy = jest.spyOn(store, 'list').mockImplementation((params) => {
        return {
          total: 3,
          data: [1, 2, 3],
        };
      });
      const resSendSpy = jest.spyOn(res, 'send');

      route(req, res);

      expect(storeSpy).toHaveBeenCalledWith({ id: [1, 2, 3] });
      expect(resSendSpy).toHaveBeenCalledWith({
        filename: 'tags.json',
        data: JSON.stringify({
          total: 3,
          data: [1, 2, 3],
        }),
      });
    });
  });

  describe('downloadPdf', () => {
    const req = {
      params: { id: '1' },
      body: { category: 'company', name: 'company-abc', description: 'Arbitrary Bank Corporation' },
    };

    const templateType = 'invoice_templates';
    const route = downloadPdf(templateType, store);

    test('success result', () => {
      const resSendSpy = jest.spyOn(res, 'send');

      route(req, res);

      expect(resSendSpy).toHaveBeenCalledWith('<div>company:company-abc</div> - Arbitrary Bank Corporation');
    });
  });

  describe('withFileUpload', () => {
    const req = {
      body: { name: 'Company ABC', logo: {}, banner: {} },
    };

    const routes = withFileUpload(['logo', 'banner'], (req, res) => {
      res.status(200).send({
        success: true,
        record: {
          name: 'Company ABC', logo: 'logo', banner: 'banner',
        },
      });
    });

    test('success result', () => {
      jest.spyOn(res, 'status').mockReturnValue({ send });

      routes[0](req, res, () => {
        routes[1](req, res, () => {});
      });
      routes[2](req, res);

      expect(req.files).toStrictEqual({ logo: 'logo', banner: 'banner' });
      expect(send).toHaveBeenCalledWith({
        success: true,
        record: {
          name: 'Company ABC', logo: 'logo', banner: 'banner',
        },
      });
    });
  });
});
