function isEmpty(val) {
  return Object.is(val, undefined) || Object.is(val, null);
}

function notEmpty(val) {
  return !isEmpty(val);
}

module.exports = {
  isEmpty,
  notEmpty
}
