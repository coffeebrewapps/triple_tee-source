export function useErrors() {
  return {
    required: 'Field is required',
    unique: 'Value must be unique',
    foreign: 'Foreign key value not found',
    isUsed: 'Record is used'
  }
}
