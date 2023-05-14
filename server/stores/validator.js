const logger = require('../logger')

function validate(modelClass, record, schemas, indexes, data) {
  const constraints = schemas[modelClass].constraints;

  const uniqueConstraint = constraints.unique;
  const requiredConstraint = constraints.required;
  const foreignConstraint = constraints.foreign;

  let errors = [];

  errors = errors.concat(validateUnique(modelClass, indexes.unique, record, uniqueConstraint, data));
  errors = errors.concat(validateRequired(modelClass, record, requiredConstraint, data));
  errors = errors.concat(validateForeign(modelClass, record, foreignConstraint, data));

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

function validateUnique(modelClass, indexes, record, constraint, data) {
  const uniqueIndexes = indexes[modelClass];
  if (!uniqueIndexes) { return []; }

  const errorFields = constraint.filter((key) => {
    const uniqueValues = uniqueIndexes[key];
    if (!uniqueValues) { return false; }

    const keys = key.split('|');
    const values = keys.map(c => record[c]).join('|');

    return uniqueValues.find(v => v === values);
  })

  if (errorFields.length > 0) {
    return [{
      error: 'Violates unique constraint',
      fields: errorFields
    }];
  } else {
    return [];
  }
}

function validateRequired(modelClass, record, constraint, data) {
  const errorFields = constraint.filter((field) => {
    return !record[field];
  });

  if (errorFields.length > 0) {
    return [{
      error: 'Violates required constraint',
      fields: errorFields
    }];
  } else {
    return [];
  }
}

function validateForeign(modelClass, record, constraint, data) {
  const errorFields = Object.keys(constraint).filter((foreignKey) => {
    const foreignValue = [record[foreignKey]].flat().filter(v => !!v);
    if (foreignValue.length === 0) { return false; }

    const referenceModel = constraint[foreignKey].reference;
    const referenceData = data[referenceModel] || {};
    return !foreignValue.reduce((check, value) => {
      return check && !!referenceData[value];
    }, true)
  });

  if (errorFields.length > 0) {
    return [{
      error: 'Violates foreign key constraint',
      fields: errorFields
    }];
  } else {
    return [];
  }
}

module.exports = {
  validate
}
