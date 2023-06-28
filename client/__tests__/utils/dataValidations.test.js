import { default as validator } from '../../../lib/dist/validator.js';
import { useValidations } from '../../src/utils/validations';
import { useDataValidations } from '../../src/utils/dataValidations.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useDataValidations', () => {
  test('should return validation functions', () => {
    const dataValidations = useDataValidations();
    expect(dataValidations).toEqual(expect.objectContaining({
      notEmpty: expect.anything(),
      isEmpty: expect.anything(),
      validate: expect.anything(),
      isUsed: expect.anything(),
    }));
  });
});
