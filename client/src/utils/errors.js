export function useErrors() {
  return {
    required: (_) => { return 'Field is required' },
    unique: (_) => { return 'Value must be unique' },
    foreign: (_) => { return 'Foreign key value not found' },
    isUsed: (_) => { return 'Record is used' },
    earlierThan: ({ compareDate }) => {
      return `Cannot be earlier than ${compareDate}`
    },
    greaterThan: ({ compareValue }) => {
      return `Must be greater than ${compareValue}`
    }
  }
}
