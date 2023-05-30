module.exports = {
  extends: [
    'standard'
  ],
  rules: {
    'comma-dangle': ['error', { 'arrays': 'always-multiline', 'objects': 'always-multiline' }],
    'max-len': ['error', { 'code': 120, 'ignoreTrailingComments': true }],
    'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
    'semi': ['error', 'always'],
    'space-before-function-paren': ['error', 'never']
  }
}
