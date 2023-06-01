export function useErrors() {
  const serverErrors = {
    required: (_) => { return 'Field is required'; },
    unique: (_) => { return 'Value must be unique'; },
    foreign: (_) => { return 'Foreign key value not found'; },
    isUsed: (_) => { return 'Record is used'; },
    invalidFile: (_) => { return 'File is invalid'; },
    notFound: (_) => { return 'Not found'; },
    greaterThanOrEqualZero: (_) => { return 'Must be greater than or equal to 0'; },
    ENOENT: (_) => { return 'File directory does not exist'; },
  };

  const dateErrors = {
    earlierThan: ({ compareDate }) => {
      return `Cannot be earlier than ${compareDate}`;
    },
    futureDate: (_) => { return `Must be future date`; },
    pastDate: (_) => { return `Must be past date`; },
  };

  const numberErrors = {
    greaterThan: ({ compareValue }) => {
      return `Must be greater than ${compareValue}`;
    },
    greaterThanOrEqual: ({ compareValue }) => {
      return `Must be greater than or equal to ${compareValue}`;
    },
    lessThan: ({ compareValue }) => {
      return `Must be less than ${compareValue}`;
    },
    lessThanOrEqual: ({ compareValue }) => {
      return `Must be less than or equal to ${compareValue}`;
    },
    compareLessThan: ({ compareNumber }) => {
      return `Must be less than ${compareNumber}`;
    },
    compareMoreThan: ({ compareNumber }) => {
      return `Must be more than ${compareNumber}`;
    },
  };

  return Object.assign(
    {},
    serverErrors,
    dateErrors,
    numberErrors
  );
}
