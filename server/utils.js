function isEmpty(val) {
  return Object.is(val, undefined) || Object.is(val, null);
}

function notEmpty(val) {
  return !isEmpty(val);
}

function wrapArray(val) {
  if (Array.isArray(val)) {
    return val;
  } else {
    return [val];
  }
}

module.exports = {
  isEmpty,
  notEmpty,
  wrapArray
}
