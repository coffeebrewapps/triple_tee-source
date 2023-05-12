function validate(modelClass, record, schemas, data) {
  const constraints = schemas[modelClass].constraints;

  const uniqueConstraint = constraints.unique;
  const requiredConstraint = constraints.required;
  const foreignConstraint = constraints.foreign;

  let errors = [];

  errors = errors.concat(validateUnique(modelClass, record, uniqueConstraint, data));
  errors = errors.concat(validateRequired(modelClass, record, requiredConstraint, data));
  errors = errors.concat(validateForeign(modelClass, record, foreignConstraint, data));

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

function validateUnique(modelClass, record, constraint, data) {
  const sameModelData = Object.entries(data[modelClass] || {})
  const errorFields = constraint.filter((field) => {
    sameModelData.find(m => m[field] === record[field])
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
    const referenceModel = constraint[foreignKey].reference
    const foreignPrimaryKey = constraint[foreignKey].primary
    const referenceData = Object.entries(data[referenceModel] || {})
    !referenceData.find(f => f[foreignPrimaryKey])
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
