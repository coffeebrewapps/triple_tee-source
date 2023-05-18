export function useValidations() {
  function notEmpty(value) {
    return !notEmpty(value)
  }

  function isEmpty(value) {
    return Object.is(value, undefined) || Object.is(value, null)
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

  function futureDate(record, dateToCheckField) {
    const dateToCheck = record[dateToCheckField]

    if (!dateToCheck) { return }

    const now = new Date()
    if (dateToCheck > now) {
      return {
        name: 'futureDate',
        params: {}
      }
    }
  }

  function pastDate(record, dateToCheckField) {
    const dateToCheck = record[dateToCheckField]

    if (!dateToCheck) { return }

    const now = new Date()
    if (dateToCheck < now) {
      return {
        name: 'futureDate',
        params: {}
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

  function greaterThanOrEqual(record, numberToCheckField, compareValue) {
    const numberToCheck = record[numberToCheckField]

    if (isEmpty(numberToCheck)) { return }
    if (numberToCheck >= compareValue) { return }

    return {
      name: 'greaterThanOrEqual',
      params: { compareValue }
    }
  }

  function lessThan(record, numberToCheckField, compareValue) {
    const numberToCheck = record[numberToCheckField]

    if (isEmpty(numberToCheck)) { return }
    if (numberToCheck < compareValue) { return }

    return {
      name: 'lessThan',
      params: { compareValue }
    }
  }

  function lessThanOrEqual(record, numberToCheckField, compareValue) {
    const numberToCheck = record[numberToCheckField]

    if (isEmpty(numberToCheck)) { return }
    if (numberToCheck <= compareValue) { return }

    return {
      name: 'lessThanOrEqual',
      params: { compareValue }
    }
  }

  const dateValidations = {
    notEarlierThan,
    futureDate,
    pastDate
  }

  const numberValidations = {
    greaterThan,
    greaterThanOrEqual,
    lessThan,
    lessThanOrEqual
  }

  return Object.assign(
    {},
    { notEmpty, isEmpty },
    dateValidations,
    numberValidations
  )
}
