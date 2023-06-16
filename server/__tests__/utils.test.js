const { isEmpty, notEmpty, wrapArray } = require('../utils.js');

test('isEmpty()', () => {
  expect(isEmpty(null)).toBe(true);
  expect(isEmpty(undefined)).toBe(true);
  expect(isEmpty('null')).toBe(false);
  expect(isEmpty('undefined')).toBe(false);
  expect(isEmpty([])).toBe(false);
  expect(isEmpty('[]')).toBe(false);
  expect(isEmpty({})).toBe(false);
  expect(isEmpty('{}')).toBe(false);
  expect(isEmpty('')).toBe(false);
});

test('notEmpty()', () => {
  expect(notEmpty(null)).toBe(false);
  expect(notEmpty(undefined)).toBe(false);
  expect(notEmpty('null')).toBe(true);
  expect(notEmpty('undefined')).toBe(true);
  expect(notEmpty([])).toBe(true);
  expect(notEmpty('[]')).toBe(true);
  expect(notEmpty({})).toBe(true);
  expect(notEmpty('{}')).toBe(true);
  expect(notEmpty('')).toBe(true);
});

test('wrapArray()', () => {
  expect(wrapArray(null)).toStrictEqual([null]);
  expect(wrapArray(undefined)).toStrictEqual([undefined]);
  expect(wrapArray(1)).toStrictEqual([1]);
  expect(wrapArray('1')).toStrictEqual(['1']);
  expect(wrapArray([1])).toStrictEqual([1]);
  expect(wrapArray({ a: 1 })).toStrictEqual([{ a: 1 }]);
});
