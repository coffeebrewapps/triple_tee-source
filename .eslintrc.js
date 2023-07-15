module.exports = {
  globals: {
    'vi': true,
    'expect': true,
    'beforeEach': true,
    'afterEach': true,
    'test': true,
    'describe': true
  },
  extends: [
    'standard',
    'plugin:vue/vue3-recommended',
    'plugin:vitest/recommended'
  ],
  plugins: [
    'vitest'
  ],
  rules: {
    'comma-dangle': ['error', { 'arrays': 'always-multiline', 'objects': 'always-multiline' }],
    'max-len': ['error', { 'code': 120, 'ignoreTrailingComments': true }],
    'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
    'semi': ['error', 'always'],
    'space-before-function-paren': ['error', 'never'],
    'strict': ['error', 'global']
  }
}
