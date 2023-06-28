import { useErrors } from '../../src/utils/errors.js';

const errors = useErrors();

describe('serverErrors', () => {
  describe('required', () => {
    test('should return message', () => {
      expect(errors.required()).toEqual('Field is required');
    });
  });

  describe('unique', () => {
    test('should return message', () => {
      expect(errors.unique()).toEqual('Value must be unique');
    });
  });

  describe('foreign', () => {
    test('should return message', () => {
      expect(errors.foreign()).toEqual('Foreign key value not found');
    });
  });

  describe('isUsed', () => {
    test('should return message', () => {
      expect(errors.isUsed()).toEqual('Record is used');
    });
  });

  describe('invalidFile', () => {
    test('should return message', () => {
      expect(errors.invalidFile()).toEqual('File is invalid');
    });
  });

  describe('notFound', () => {
    test('should return message', () => {
      expect(errors.notFound()).toEqual('Not found');
    });
  });

  describe('greaterThanOrEqualZero', () => {
    test('should return message', () => {
      expect(errors.greaterThanOrEqualZero()).toEqual('Must be greater than or equal to 0');
    });
  });

  describe('ENOENT', () => {
    test('should return message', () => {
      expect(errors.ENOENT()).toEqual('File directory does not exist');
    });
  });

  describe('notReversible', () => {
    test('should return message', () => {
      expect(errors.notReversible()).toEqual('Transaction is not reversible');
    });
  });
});

describe('dateErrors', () => {
  describe('earlierThan', () => {
    test('should return message', () => {
      expect(errors.earlierThan({ compareDate: 'effectiveStart' })).toEqual('Cannot be earlier than effectiveStart');
    });
  });

  describe('futureDate', () => {
    test('should return message', () => {
      expect(errors.futureDate()).toEqual('Must be future date');
    });
  });

  describe('pastDate', () => {
    test('should return message', () => {
      expect(errors.pastDate()).toEqual('Must be past date');
    });
  });
});

describe('numberErrors', () => {
  describe('greaterThan', () => {
    test('should return message', () => {
      expect(errors.greaterThan({ compareValue: 1 })).toEqual('Must be greater than 1');
    });
  });

  describe('greaterThanOrEqual', () => {
    test('should return message', () => {
      expect(errors.greaterThanOrEqual({ compareValue: 1 })).toEqual('Must be greater than or equal to 1');
    });
  });

  describe('lessThan', () => {
    test('should return message', () => {
      expect(errors.lessThan({ compareValue: 1 })).toEqual('Must be less than 1');
    });
  });

  describe('lessThanOrEqual', () => {
    test('should return message', () => {
      expect(errors.lessThanOrEqual({ compareValue: 1 })).toEqual('Must be less than or equal to 1');
    });
  });

  describe('compareLessThan', () => {
    test('should return message', () => {
      expect(errors.compareLessThan({ compareNumber: 'maxIncome' })).toEqual('Must be less than maxIncome');
    });
  });

  describe('compareMoreThan', () => {
    test('should return message', () => {
      expect(errors.compareMoreThan({ compareNumber: 'minIncome' })).toEqual('Must be more than minIncome');
    });
  });
});

describe('enumErrors', () => {
  describe('invalidEnum', () => {
    test('should return message', () => {
      expect(errors.invalidEnum({ validValues: ['year', 'month'] })).toEqual('Must be one of: year, month');
    });
  });
});
