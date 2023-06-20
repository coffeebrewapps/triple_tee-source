import { default as utils } from '#/utils.js';

export function useValidations() {
  function notEarlierThan(record, dateToCheckField, compareDateField) {
    const dateToCheck = record[dateToCheckField];
    const compareDate = record[compareDateField];

    if (utils.isEmpty(dateToCheck) || utils.isEmpty(compareDate)) { return; }

    if (dateToCheck < compareDate) {
      return {
        name: 'earlierThan',
        params: {
          compareDate: compareDateField,
        },
      };
    }
  }

  function futureDate(record, dateToCheckField) {
    const dateToCheck = record[dateToCheckField];

    if (utils.isEmpty(dateToCheck)) { return; }

    const now = new Date();
    if (dateToCheck > now) {
      return {
        name: 'futureDate',
        params: {},
      };
    }
  }

  function pastDate(record, dateToCheckField) {
    const dateToCheck = record[dateToCheckField];

    if (utils.isEmpty(dateToCheck)) { return; }

    const now = new Date();
    if (dateToCheck < now) {
      return {
        name: 'futureDate',
        params: {},
      };
    }
  }

  function greaterThan(record, numberToCheckField, compareValue) {
    const numberToCheck = record[numberToCheckField];

    if (utils.isEmpty(numberToCheck)) { return; }
    if (numberToCheck > compareValue) { return; }

    return {
      name: 'greaterThan',
      params: { compareValue },
    };
  }

  function greaterThanOrEqual(record, numberToCheckField, compareValue) {
    const numberToCheck = record[numberToCheckField];

    if (utils.isEmpty(numberToCheck)) { return; }
    if (numberToCheck >= compareValue) { return; }

    return {
      name: 'greaterThanOrEqual',
      params: { compareValue },
    };
  }

  function lessThan(record, numberToCheckField, compareValue) {
    const numberToCheck = record[numberToCheckField];

    if (utils.isEmpty(numberToCheck)) { return; }
    if (numberToCheck < compareValue) { return; }

    return {
      name: 'lessThan',
      params: { compareValue },
    };
  }

  function lessThanOrEqual(record, numberToCheckField, compareValue) {
    const numberToCheck = record[numberToCheckField];

    if (utils.isEmpty(numberToCheck)) { return; }
    if (numberToCheck <= compareValue) { return; }

    return {
      name: 'lessThanOrEqual',
      params: { compareValue },
    };
  }

  function compareLessThan(record, numberToCheckField, compareNumberField) {
    const numberToCheck = record[numberToCheckField];
    const compareNumber = record[compareNumberField];

    if (utils.isEmpty(numberToCheck) || utils.isEmpty(compareNumber)) { return; }

    if (numberToCheck > compareNumber) {
      return {
        name: 'compareLessThan',
        params: {
          compareNumber: compareNumberField,
        },
      };
    }
  }

  function compareMoreThan(record, numberToCheckField, compareNumberField) {
    const numberToCheck = record[numberToCheckField];
    const compareNumber = record[compareNumberField];

    if (utils.isEmpty(numberToCheck) || utils.isEmpty(compareNumber)) { return; }

    if (numberToCheck < compareNumber) {
      return {
        name: 'compareMoreThan',
        params: {
          compareNumber: compareNumberField,
        },
      };
    }
  }

  const dateValidations = {
    notEarlierThan,
    futureDate,
    pastDate,
  };

  const numberValidations = {
    greaterThan,
    greaterThanOrEqual,
    lessThan,
    lessThanOrEqual,
    compareLessThan,
    compareMoreThan,
  };

  return Object.assign(
    {},
    utils,
    dateValidations,
    numberValidations
  );
}
