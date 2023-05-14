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

  const errorFields = constraint.filter((field) => {
    if (!uniqueIndexes[field]) { return false; }

    return uniqueIndexes[field].find(v => v === record[field])
  })

  if (errorFields.length > 0) {
    return [{
      error: 'Violates unique constraint',
      fields: errorFields
    }]
  } else {
    return []
  }
}

function validateRequired(modelClass, record, constraint, data) {
  const errorFields = constraint.filter((field) => {
    return !record[field]
  })

  if (errorFields.length > 0) {
    return [{
      error: 'Violates required constraint',
      fields: errorFields
    }]
  } else {
    return []
  }
}

function validateForeign(modelClass, record, constraint, data) {
  const errorFields = Object.keys(constraint).filter((foreignKey) => {
    const foreignValue = record[foreignKey]
    if (!foreignValue) { return true; }

    const referenceModel = constraint[foreignKey].reference
    const referenceData = Object.values(data[referenceModel] || {})
    return !referenceData[foreignValue]
  })

  if (errorFields.length > 0) {
    return [{
      error: 'Violates foreign key constraint',
      fields: errorFields
    }]
  } else {
    return []
  }
}

module.exports = {
  validate
}
