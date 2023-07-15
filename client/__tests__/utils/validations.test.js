import { useValidations } from '../../src/utils/validations.js';

const validations = useValidations();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2023-04-12T12:34:56.123Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('utils', () => {
  describe('isEmpty', () => {
    test('when value undefined should return true', () => {
      expect(validations.isEmpty(undefined)).toBeTruthy();
    });

    test('when value null should return true', () => {
      expect(validations.isEmpty(null)).toBeTruthy();
    });

    test('when value is empty string should return false', () => {
      expect(validations.isEmpty('')).toBeFalsy();
    });

    test('when value is empty array should return false', () => {
      expect(validations.isEmpty([])).toBeFalsy();
    });

    test('when value is empty object should return false', () => {
      expect(validations.isEmpty({})).toBeFalsy();
    });

    test('when value is 0 should return false', () => {
      expect(validations.isEmpty(0)).toBeFalsy();
    });
  });

  describe('notEmpty', () => {
    test('when value undefined should return false', () => {
      expect(validations.notEmpty(undefined)).toBeFalsy();
    });

    test('when value null should return false', () => {
      expect(validations.notEmpty(null)).toBeFalsy();
    });

    test('when value is empty string should return true', () => {
      expect(validations.notEmpty('')).toBeTruthy();
    });

    test('when value is empty array should return true', () => {
      expect(validations.notEmpty([])).toBeTruthy();
    });

    test('when value is empty object should return true', () => {
      expect(validations.notEmpty({})).toBeTruthy();
    });

    test('when value is 0 should return true', () => {
      expect(validations.notEmpty(0)).toBeTruthy();
    });
  });
});

describe('dateValidations', () => {
  describe('notEarlierThan', () => {
    test('when value is not earlier than should return undefined', () => {
      const result = validations.notEarlierThan(
        { startDate: '2023-01-03', endDate: '2023-01-02' },
        'startDate', 'endDate'
      );

      expect(result).toBeUndefined();
    });

    test('when value is earlier than should return error', () => {
      const result = validations.notEarlierThan(
        { startDate: '2023-01-01', endDate: '2023-01-02' },
        'startDate', 'endDate'
      );

      expect(result).toEqual({
        name: 'earlierThan',
        params: {
          compareDate: 'endDate',
        },
      });
    });

    test('when value is empty than should return undefined', () => {
      const result = validations.notEarlierThan(
        { endDate: '2023-01-02' },
        'startDate', 'endDate'
      );

      expect(result).toBeUndefined();
    });

    test('when compare value is empty than should return undefined', () => {
      const result = validations.notEarlierThan(
        { startDate: '2023-01-02' },
        'startDate', 'endDate'
      );

      expect(result).toBeUndefined();
    });
  });

  describe('futureDate', () => {
    test('when value is future date should return undefined', () => {
      const result = validations.futureDate(
        { startDate: '2023-04-13' },
        'startDate'
      );

      expect(result).toBeUndefined();
    });

    test('when value is not future date should return error', () => {
      const result = validations.futureDate(
        { startDate: '2023-04-11' },
        'startDate'
      );

      expect(result).toEqual({
        name: 'futureDate',
        params: {},
      });
    });

    test('when value is empty than should return undefined', () => {
      const result = validations.futureDate(
        {},
        'startDate'
      );

      expect(result).toBeUndefined();
    });
  });

  describe('pastDate', () => {
    test('when value is past date should return undefined', () => {
      const result = validations.pastDate(
        { startDate: '2023-04-12' },
        'startDate'
      );

      expect(result).toBeUndefined();
    });

    test('when value is not past date should return error', () => {
      const result = validations.pastDate(
        { startDate: '2023-04-13' },
        'startDate'
      );

      expect(result).toEqual({
        name: 'pastDate',
        params: {},
      });
    });

    test('when value is empty than should return undefined', () => {
      const result = validations.pastDate(
        {},
        'startDate'
      );

      expect(result).toBeUndefined();
    });
  });
});

describe('numberValidations', () => {
  describe('greaterThan', () => {
    test('when value is greater than should return undefined', () => {
      const result = validations.greaterThan(
        { startingNumber: 2 },
        'startingNumber', 1
      );

      expect(result).toBeUndefined();
    });

    test('when value is same as compare value should return error', () => {
      const result = validations.greaterThan(
        { startingNumber: 1 },
        'startingNumber', 1
      );

      expect(result).toEqual({
        name: 'greaterThan',
        params: {
          compareValue: 1,
        },
      });
    });

    test('when value is not greater than should return error', () => {
      const result = validations.greaterThan(
        { startingNumber: 0 },
        'startingNumber', 1
      );

      expect(result).toEqual({
        name: 'greaterThan',
        params: {
          compareValue: 1,
        },
      });
    });

    test('when value is empty should return undefined', () => {
      const result = validations.greaterThan(
        {},
        'startingNumber', 1
      );

      expect(result).toBeUndefined();
    });
  });

  describe('greaterThanOrEqual', () => {
    test('when value is greater than should return undefined', () => {
      const result = validations.greaterThanOrEqual(
        { startingNumber: 2 },
        'startingNumber', 1
      );

      expect(result).toBeUndefined();
    });

    test('when value is same as compare value should return undefined', () => {
      const result = validations.greaterThanOrEqual(
        { startingNumber: 1 },
        'startingNumber', 1
      );

      expect(result).toBeUndefined();
    });

    test('when value is not greater than should return error', () => {
      const result = validations.greaterThanOrEqual(
        { startingNumber: 0 },
        'startingNumber', 1
      );

      expect(result).toEqual({
        name: 'greaterThanOrEqual',
        params: {
          compareValue: 1,
        },
      });
    });

    test('when value is empty should return undefined', () => {
      const result = validations.greaterThanOrEqual(
        {},
        'startingNumber', 1
      );

      expect(result).toBeUndefined();
    });
  });

  describe('lessThan', () => {
    test('when value is less than should return undefined', () => {
      const result = validations.lessThan(
        { endingNumber: 9 },
        'endingNumber', 10
      );

      expect(result).toBeUndefined();
    });

    test('when value is same as compare value should return error', () => {
      const result = validations.lessThan(
        { endingNumber: 10 },
        'endingNumber', 10
      );

      expect(result).toEqual({
        name: 'lessThan',
        params: {
          compareValue: 10,
        },
      });
    });

    test('when value is not less than should return error', () => {
      const result = validations.lessThan(
        { endingNumber: 11 },
        'endingNumber', 10
      );

      expect(result).toEqual({
        name: 'lessThan',
        params: {
          compareValue: 10,
        },
      });
    });

    test('when value is empty should return undefined', () => {
      const result = validations.lessThan(
        {},
        'endingNumber', 10
      );

      expect(result).toBeUndefined();
    });
  });

  describe('lessThanOrEqual', () => {
    test('when value is less than should return undefined', () => {
      const result = validations.lessThanOrEqual(
        { endingNumber: 9 },
        'endingNumber', 10
      );

      expect(result).toBeUndefined();
    });

    test('when value is same as compare value should return undefined', () => {
      const result = validations.lessThanOrEqual(
        { endingNumber: 10 },
        'endingNumber', 10
      );

      expect(result).toBeUndefined();
    });

    test('when value is not less than should return error', () => {
      const result = validations.lessThanOrEqual(
        { endingNumber: 11 },
        'endingNumber', 10
      );

      expect(result).toEqual({
        name: 'lessThanOrEqual',
        params: {
          compareValue: 10,
        },
      });
    });

    test('when value is empty should return undefined', () => {
      const result = validations.lessThanOrEqual(
        {},
        'endingNumber', 10
      );

      expect(result).toBeUndefined();
    });
  });

  describe('compareLessThan', () => {
    test('when value is less than compare value should return undefined', () => {
      const result = validations.compareLessThan(
        { minNumber: 9, maxNumber: 10 },
        'minNumber', 'maxNumber'
      );

      expect(result).toBeUndefined();
    });

    test('when value is same as compare value should return error', () => {
      const result = validations.compareLessThan(
        { minNumber: 10, maxNumber: 10 },
        'minNumber', 'maxNumber'
      );

      expect(result).toEqual({
        name: 'compareLessThan',
        params: {
          compareNumber: 'maxNumber',
        },
      });
    });

    test('when value is not less than compare value should return error', () => {
      const result = validations.compareLessThan(
        { minNumber: 11, maxNumber: 10 },
        'minNumber', 'maxNumber'
      );

      expect(result).toEqual({
        name: 'compareLessThan',
        params: {
          compareNumber: 'maxNumber',
        },
      });
    });

    test('when value is empty should return undefined', () => {
      const result = validations.compareLessThan(
        { maxNumber: 10 },
        'minNumber', 'maxNumber'
      );

      expect(result).toBeUndefined();
    });

    test('when compare value is empty should return undefined', () => {
      const result = validations.compareLessThan(
        { minNumber: 10 },
        'minNumber', 'maxNumber'
      );

      expect(result).toBeUndefined();
    });
  });

  describe('compareMoreThan', () => {
    test('when value is more than compare value should return undefined', () => {
      const result = validations.compareMoreThan(
        { minNumber: 9, maxNumber: 10 },
        'maxNumber', 'minNumber'
      );

      expect(result).toBeUndefined();
    });

    test('when value is same as compare value should return error', () => {
      const result = validations.compareMoreThan(
        { minNumber: 10, maxNumber: 10 },
        'maxNumber', 'minNumber'
      );

      expect(result).toEqual({
        name: 'compareMoreThan',
        params: {
          compareNumber: 'minNumber',
        },
      });
    });

    test('when value is not more than compare value should return error', () => {
      const result = validations.compareMoreThan(
        { minNumber: 11, maxNumber: 10 },
        'maxNumber', 'minNumber'
      );

      expect(result).toEqual({
        name: 'compareMoreThan',
        params: {
          compareNumber: 'minNumber',
        },
      });
    });

    test('when value is empty should return undefined', () => {
      const result = validations.compareMoreThan(
        { minNumber: 10 },
        'maxNumber', 'minNumber'
      );

      expect(result).toBeUndefined();
    });

    test('when compare value is empty should return undefined', () => {
      const result = validations.compareMoreThan(
        { maxNumber: 10 },
        'maxNumber', 'minNumber'
      );

      expect(result).toBeUndefined();
    });
  });
});
