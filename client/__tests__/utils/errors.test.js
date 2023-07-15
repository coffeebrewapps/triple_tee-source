import { useErrors } from '../../src/utils/errors.js';

const errors = useErrors();

describe('serverErrors', () => {
  describe('required', () => {
    test('should return message', () => {
      expect(errors.required()).toBe('Field is required');
    });
  });

  describe('unique', () => {
    test('should return message', () => {
      expect(errors.unique()).toBe('Value must be unique');
    });
  });

  describe('foreign', () => {
    test('should return message', () => {
      expect(errors.foreign()).toBe('Foreign key value not found');
    });
  });

  describe('isUsed', () => {
    test('should return message', () => {
      expect(errors.isUsed()).toBe('Record is used');
    });
  });

  describe('invalidFile', () => {
    test('should return message', () => {
      expect(errors.invalidFile()).toBe('File is invalid');
    });
  });

  describe('notFound', () => {
    test('should return message', () => {
      expect(errors.notFound()).toBe('Not found');
    });
  });

  describe('greaterThanOrEqualZero', () => {
    test('should return message', () => {
      expect(errors.greaterThanOrEqualZero()).toBe('Must be greater than or equal to 0');
    });
  });

  describe('ENOENT', () => {
    test('should return message', () => {
      expect(errors.ENOENT()).toBe('File directory does not exist');
    });
  });

  describe('notReversible', () => {
    test('should return message', () => {
      expect(errors.notReversible()).toBe('Transaction is not reversible');
    });
  });
});

describe('dateErrors', () => {
  describe('earlierThan', () => {
    test('should return message', () => {
      expect(errors.earlierThan({ compareDate: 'effectiveStart' })).toBe('Cannot be earlier than effectiveStart');
    });
  });

  describe('futureDate', () => {
    test('should return message', () => {
      expect(errors.futureDate()).toBe('Must be future date');
    });
  });

  describe('pastDate', () => {
    test('should return message', () => {
      expect(errors.pastDate()).toBe('Must be past date');
    });
  });
});

describe('numberErrors', () => {
  describe('greaterThan', () => {
    test('should return message', () => {
      expect(errors.greaterThan({ compareValue: 1 })).toBe('Must be greater than 1');
    });
  });

  describe('greaterThanOrEqual', () => {
    test('should return message', () => {
      expect(errors.greaterThanOrEqual({ compareValue: 1 })).toBe('Must be greater than or equal to 1');
    });
  });

  describe('lessThan', () => {
    test('should return message', () => {
      expect(errors.lessThan({ compareValue: 1 })).toBe('Must be less than 1');
    });
  });

  describe('lessThanOrEqual', () => {
    test('should return message', () => {
      expect(errors.lessThanOrEqual({ compareValue: 1 })).toBe('Must be less than or equal to 1');
    });
  });

  describe('compareLessThan', () => {
    test('should return message', () => {
      expect(errors.compareLessThan({ compareNumber: 'maxIncome' })).toBe('Must be less than maxIncome');
    });
  });

  describe('compareMoreThan', () => {
    test('should return message', () => {
      expect(errors.compareMoreThan({ compareNumber: 'minIncome' })).toBe('Must be more than minIncome');
    });
  });
});

describe('enumErrors', () => {
  describe('invalidEnum', () => {
    test('should return message', () => {
      expect(errors.invalidEnum({ validValues: ['year', 'month'] })).toBe('Must be one of: year, month');
    });
  });
});
