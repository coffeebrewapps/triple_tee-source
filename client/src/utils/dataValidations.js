import { default as validator } from '#/validator.js';
import { useValidations } from './validations';

export function useDataValidations() {
  const utils = useValidations();
  const { isEmpty, notEmpty } = utils;
  const { validate, isUsed } = validator({ utils });

  return {
    notEmpty,
    isEmpty,
    validate,
    isUsed,
  };
}
