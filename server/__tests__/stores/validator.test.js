const path = require('path');

const {
  validateNoError,
  validateWithForeignKeyNoError,
  validateRequired,
  validateNotUnique,
  validateValidForeignKey,
  validateInvalidForeignKey,
  recordIsUsed,
  recordNotUsed,
} = require('../__fixtures__/validator.js');

const config = {};
const logger = {
  log: () => {},
  error: () => {},
};
const utils = require('../../utils.js');

const initDir = path.join(__dirname, '../../../_init');
const initSchemas = require(path.join(initDir, 'schemas.json'));

const validator = require('../../stores/validator.js')({ config, logger, utils });

describe('validator', () => {
  test('validate - no error', () => {
    const { modelClass, record, indexes, data } = validateNoError();

    const result = validator.validate(
      modelClass, record, initSchemas, indexes, data
    );

    expect(result.valid).toBeTruthy();
  });

  test('validate - with foreign keys no error', () => {
    const { modelClass, record, indexes, data } = validateWithForeignKeyNoError();

    const result = validator.validate(
      modelClass, record, initSchemas, indexes, data
    );

    expect(result.valid).toBeTruthy();
  });

  test('validate - valid foreign key', () => {
    const { modelClass, record, indexes, data } = validateValidForeignKey();

    const result = validator.validate(
      modelClass, record, initSchemas, indexes, data
    );

    expect(result.valid).toBeTruthy();
  });

  test('validate - missing required', () => {
    const { modelClass, record, indexes, data } = validateRequired();

    const result = validator.validate(
      modelClass, record, initSchemas, indexes, data
    );

    expect(result.valid).toBeFalsy();
    expect(result.errors).toMatchObject({ name: ['required'] });
  });

  test('validate - not unique', () => {
    const { modelClass, record, indexes, data } = validateNotUnique();

    const result = validator.validate(
      modelClass, record, initSchemas, indexes, data
    );

    expect(result.valid).toBeFalsy();
    expect(result.errors).toMatchObject({ code: ['unique'] });
  });

  test('validate - invalid foreign key', () => {
    const { modelClass, record, indexes, data } = validateInvalidForeignKey();

    const result = validator.validate(
      modelClass, record, initSchemas, indexes, data
    );

    expect(result.valid).toBeFalsy();
    expect(result.errors).toMatchObject({ tags: ['foreign'] });
  });

  test('isUsed - is used', () => {
    const { modelClass, record, indexes, data } = recordIsUsed();

    const result = validator.isUsed(
      modelClass, record, initSchemas, indexes, data
    );

    expect(result).toBeTruthy();
  });

  test('isUsed - not used', () => {
    const { modelClass, record, indexes, data } = recordNotUsed();

    const result = validator.isUsed(
      modelClass, record, initSchemas, indexes, data
    );

    expect(result).toBeFalsy();
  });
});
