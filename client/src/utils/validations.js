export function useValidations() {
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

  return {
    notEarlierThan
  }
}
