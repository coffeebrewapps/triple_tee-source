const dataAccess = {
  list: () => {},
  view: () => {},
  create: () => {},
  update: () => {},
  remove: () => {},
};

const logger = {
  log: () => {},
  error: () => {},
};

const utils = require('../../src/utils.js');

const {
  modelClass,
  list,
  view,
  create,
  update,
  remove,
  chartData,
} = require('../../src/contacts/stores.js')({ dataAccess, logger, utils });

const {
  contactsData,
} = require('../__fixtures__/contacts.js');

afterEach(() => {
  jest.resetAllMocks();
});

describe('contacts store', () => {
  describe('default methods', () => {
    test('modelClass', () => {
      expect(modelClass).toBe('contacts');
    });

    test('list', () => {
      const dataAccessSpy = jest.spyOn(dataAccess, 'list');

      const filters = {};
      const result = list(filters);

      expect(dataAccessSpy).toHaveBeenCalledWith(modelClass, filters);
    });

    test('view', () => {
      const dataAccessSpy = jest.spyOn(dataAccess, 'view');

      const id = '1';
      const params = {};
      const result = view(id, params);

      expect(dataAccessSpy).toHaveBeenCalledWith(modelClass, id, params);
    });

    test('create - without logo', () => {
      const dataAccessSpy = jest.spyOn(dataAccess, 'create').mockImplementation((modelClass, params) => {
        if (modelClass === 'contacts') {
          return {
            success: true,
            record: Object.assign({}, params, { id: '4' }),
          };
        } else {
          return {
            success: true,
            record: Object.assign({}, params, { id: '1' }),
          };
        }
      });

      const params = {
        name: 'Company ACME',
        country: 'SGP',
      };
      const result = create(params);

      expect(dataAccessSpy).toHaveBeenCalledWith(modelClass, expect.objectContaining(params));
      expect(dataAccessSpy).not.toHaveBeenCalledWith('documents', expect.anything());
      expect(result.success).toBeTruthy();
      expect(result.record).toEqual(expect.objectContaining({
        id: '4',
        name: 'Company ACME',
        country: 'SGP',
      }));
    });

    test('create - with logo', () => {
      const dataAccessSpy = jest.spyOn(dataAccess, 'create').mockImplementation((modelClass, params) => {
        if (modelClass === 'contacts') {
          return {
            success: true,
            record: Object.assign({}, params, { id: '4' }),
          };
        } else {
          return {
            success: true,
            record: Object.assign({}, params, { id: '1' }),
          };
        }
      });

      const params = {
        name: 'Company ACME',
        country: 'SGP',
        logo: {
          path: 'uploads/logo.png',
          originalname: 'logo.png',
          mimetype: 'image/png',
        },
      };
      const result = create(params);

      expect(dataAccessSpy).toHaveBeenCalledWith(modelClass, expect.objectContaining(
        Object.assign(
          {},
          params,
          { logo: '1' }
        )
      ));
      expect(dataAccessSpy).toHaveBeenCalledWith('documents', expect.objectContaining({
        filename: 'logo.png',
        mimeType: 'image/png',
        filePath: 'uploads/logo.png',
      }));
      expect(result.success).toBeTruthy();
      expect(result.record).toEqual(expect.objectContaining({
        id: '4',
        name: 'Company ACME',
        country: 'SGP',
        logo: '1',
      }));
    });

    test('create - with logo but create document failed', () => {
      const dataAccessSpy = jest.spyOn(dataAccess, 'create').mockImplementation((modelClass, params) => {
        if (modelClass === 'contacts') {
          return {
            success: true,
            record: Object.assign({}, params, { id: '4' }),
          };
        } else {
          return {
            success: false,
            errors: { filename: ['required'] },
          };
        }
      });

      const params = {
        name: 'Company ACME',
        country: 'SGP',
        logo: {
          path: 'uploads/logo.png',
          originalname: 'logo.png',
          mimetype: 'image/png',
        },
      };
      const result = create(params);

      expect(dataAccessSpy).not.toHaveBeenCalledWith(modelClass, expect.anything());
      expect(result.success).toBeFalsy();
      expect(result.errors).toEqual(expect.objectContaining({
        filename: ['required'],
      }));
    });

    test('update - without logo', () => {
      const createDocumentSpy = jest.spyOn(dataAccess, 'create');
      const updateContactSpy = jest.spyOn(dataAccess, 'update').mockImplementation((modelClass, id, params) => {
        return {
          success: true,
          record: Object.assign({}, contactsData[id], params),
        };
      });

      const id = '1';
      const params = {
        accountNumber: '124-46352-733',
      };
      const result = update(id, params);

      expect(createDocumentSpy).not.toHaveBeenCalledWith('documents', expect.anything());
      expect(updateContactSpy).toHaveBeenCalledWith(modelClass, id, expect.objectContaining({
        accountNumber: '124-46352-733',
      }));

      expect(result.success).toBeTruthy();
      expect(result.record).toEqual(expect.objectContaining({
        id: '1',
        name: 'Coffee Brew Apps',
        accountNumber: '124-46352-733',
        country: 'SGP',
      }));
    });

    test('update - with logo', () => {
      const createDocumentSpy = jest.spyOn(dataAccess, 'create').mockImplementation((modelClass, params) => {
        return {
          success: true,
          record: Object.assign({}, params, { id: '2' }),
        };
      });

      const updateContactSpy = jest.spyOn(dataAccess, 'update').mockImplementation((modelClass, id, params) => {
        return {
          success: true,
          record: Object.assign({}, contactsData[id], params),
        };
      });

      const id = '1';
      const params = {
        accountNumber: '124-46352-733',
        logo: {
          path: 'uploads/logo.png',
          originalname: 'logo.png',
          mimetype: 'image/png',
        },
      };
      const result = update(id, params);

      expect(updateContactSpy).toHaveBeenCalledWith(modelClass, id, expect.objectContaining({
        accountNumber: '124-46352-733',
        logo: '2',
      }));

      expect(createDocumentSpy).toHaveBeenCalledWith('documents', expect.objectContaining({
        filename: 'logo.png',
        mimeType: 'image/png',
        filePath: 'uploads/logo.png',
      }));

      expect(result.success).toBeTruthy();
      expect(result.record).toEqual(expect.objectContaining({
        id: '1',
        name: 'Coffee Brew Apps',
        accountNumber: '124-46352-733',
        country: 'SGP',
        logo: '2',
      }));
    });

    test('remove', () => {
      const dataAccessSpy = jest.spyOn(dataAccess, 'remove');

      const id = '1';
      const result = remove(id);

      expect(dataAccessSpy).toHaveBeenCalledWith(modelClass, id);
    });
  });
});
