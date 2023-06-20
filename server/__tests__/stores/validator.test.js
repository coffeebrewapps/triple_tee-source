const path = require('path');

const utils = require('../../utils.js');

const validator = require('../../stores/validator.js')({ utils });

const sharedValidator = {
  validate: () => {},
  isUsed: () => {},
}
;
jest.mock('../../../lib/src/validator.js', () => {
  return ({ utils }) => {
    return sharedValidator;
  };
});

describe('validator', () => {
  const modelClass = 'tags';
  const record = { category: 'company', name: 'company-abc' };
  const schemas = {};
  const indexes = {};
  const data = {};

  test('validate', () => {
    const validatorSpy = jest.spyOn(sharedValidator, 'validate');

    validator.validate(modelClass, record, schemas, indexes, data);

    expect(validatorSpy).toHaveBeenCalledWith(modelClass, record, schemas, indexes, data);
  });

  test('isUsed', () => {
    const validatorSpy = jest.spyOn(sharedValidator, 'isUsed');

    validator.isUsed(modelClass, record, schemas, indexes, data);

    expect(validatorSpy).toHaveBeenCalledWith(modelClass, record, schemas, indexes, data);
  });
});
