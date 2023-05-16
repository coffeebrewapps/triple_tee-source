export function useValidations() {
  function notEmpty(value) {
    return (typeof value !== 'undefined') && value !== null
  }

  function isEmpty(value) {
    return !notEmpty(value)
  }

  function notEarlierThan(record, dateToCheckField, compareDateField) {
    const dateToCheck = record[dateToCheckField]
    const compareDate = record[compareDateField]

    if (!dateToCheck || !compareDate) { return }

    if (dateToCheck < compareDate) {
      return {
        name: 'earlierThan',
        params: {
          compareDate: compareDateField
        }
      }
    }
  }

  function greaterThan(record, numberToCheckField, compareValue) {
    const numberToCheck = record[numberToCheckField]

    if (isEmpty(numberToCheck)) { return }
    if (numberToCheck > compareValue) { return }

    return {
      name: 'greaterThan',
      params: { compareValue }
    }
  }

  return {
    notEarlierThan,
    greaterThan
  }
}
