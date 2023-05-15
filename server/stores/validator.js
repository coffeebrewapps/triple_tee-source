const logger = require('../logger')

function validate(modelClass, record, schemas, indexes, data) {
  const constraints = schemas[modelClass].constraints;

  const uniqueConstraint = constraints.unique;
  const requiredConstraint = constraints.required;
  const foreignConstraint = constraints.foreign;

  const errors = {};
  validateUnique(modelClass, indexes.unique, record, uniqueConstraint, data, errors);
  validateRequired(modelClass, record, requiredConstraint, data, errors);
  validateForeign(modelClass, record, foreignConstraint, data, errors);

  return {
    valid: Object.keys(errors).length === 0,
    errors: errors
  };
}

function validateUnique(modelClass, indexes, record, constraint, data, errors) {
  const uniqueIndexes = indexes[modelClass];
  if (!uniqueIndexes) { return []; }

  const errorFields = constraint.filter((key) => {
    const uniqueValues = uniqueIndexes[key];
    if (!uniqueValues) { return false; }

    const keys = key.split('|');
    const values = keys.map(c => record[c]).join('|');

    return uniqueValues.find(v => v === values);
  });

  errorFields.forEach((field) => {
    const fieldErrors = errors[field] || [];
    fieldErrors.push('unique');
    errors[field] = fieldErrors;
  });
}

function validateRequired(modelClass, record, constraint, data, errors) {
  const errorFields = constraint.filter((field) => {
    return !record[field];
  });

  errorFields.forEach((field) => {
    const fieldErrors = errors[field] || [];
    fieldErrors.push('required');
    errors[field] = fieldErrors;
  });
}

function validateForeign(modelClass, record, constraint, data, errors) {
  const errorFields = Object.keys(constraint).filter((foreignKey) => {
    const foreignValue = [record[foreignKey]].flat().filter(v => !!v);
    if (foreignValue.length === 0) { return false; }

    const referenceModel = constraint[foreignKey].reference;
    const referenceData = data[referenceModel] || {};
    return !foreignValue.reduce((check, value) => {
      return check && !!referenceData[value];
    }, true)
  });

  errorFields.forEach((field) => {
    const fieldErrors = errors[field] || [];
    fieldErrors.push('foreign');
    errors[field] = fieldErrors;
  });
}

module.exports = {
  validate
}
