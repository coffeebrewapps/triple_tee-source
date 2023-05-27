export function useDataValidations() {
  function notEmpty(value) {
    return !isEmpty(value)
  }

  function isEmpty(value) {
    return Object.is(value, undefined) || Object.is(value, null)
  }

  function validateUnique(modelClass, indexes, record, constraint, data, errors) {
    const uniqueIndexes = indexes[modelClass];
    if (!uniqueIndexes) { return []; }

    const errorFields = constraint.filter((key) => {
      const uniqueValues = uniqueIndexes[key];
      if (!uniqueValues) { return false; }

      const keys = key.split('|');
      const values = keys.map(c => record[c]).join('|');

      const foundIndex = uniqueValues[values];
      return foundIndex && foundIndex !== record.id;
    });

    errorFields.forEach((compositeField) => {
      const fields = compositeField.split('|');
      fields.forEach((field) => {
        const fieldErrors = errors[field] || [];
        fieldErrors.push('unique');
        errors[field] = fieldErrors;
      });
    });
  }

  function validateRequired(modelClass, schemas, record, constraint, data, errors) {
    const errorFields = constraint.filter((field) => {
      const fieldDefault = schemas[field].default
      return isEmpty(record[field]) && isEmpty(fieldDefault);
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

  function validate(modelClass, record, schemas, indexes, data, check = { unique: true, required: true, foreign: true }) {
    const constraints = schemas[modelClass].constraints;
    const modelSchemas = schemas[modelClass].fields;
    const errors = {};

    if (check.unique) {
      const uniqueConstraint = constraints.unique;
      validateUnique(modelClass, indexes.unique, record, uniqueConstraint, data, errors);
    }

    if (check.required) {
      const requiredConstraint = constraints.required;
      validateRequired(modelClass, modelSchemas, record, requiredConstraint, data, errors);
    }

    if (check.foreign) {
      const foreignConstraint = constraints.foreign;
      validateForeign(modelClass, record, foreignConstraint, data, errors);
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors: errors
    };
  }

  function isUsed(modelClass, record, schemas, indexes, data) {
    const foreignIndexes = indexes.foreign[modelClass];
    if (isEmpty(foreignIndexes)) { return false; }

    const associations = foreignIndexes[record.id]
    if (isEmpty(associations)) { return false; }

    const someAssociated = Object.values(associations).filter((associatedData) => {
      return associatedData.length > 0;
    });

    return someAssociated.length > 0;
  }

  return {
    notEmpty,
    isEmpty,
    validate,
    isUsed
  }
}
