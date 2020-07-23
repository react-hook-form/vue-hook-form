import isEmptyObject from '../utils/isEmptyObject';
import isSameError from '../utils/isSameError';
import get from '../utils/get';
import {
  FieldValues,
  InternalFieldName,
  FieldErrors,
  FlatFieldErrors,
} from '../types/form';

export default function shouldRenderBasedOnError<
  TFieldValues extends FieldValues
>({
  errors,
  name,
  error,
  validFields,
  fieldsWithValidation,
}: {
  errors: FieldErrors<TFieldValues>;
  error: FlatFieldErrors<TFieldValues>;
  name: InternalFieldName<TFieldValues>;
  validFields: Set<InternalFieldName<TFieldValues>>;
  fieldsWithValidation: Set<InternalFieldName<TFieldValues>>;
}): boolean {
  const isFieldValid = isEmptyObject(error);
  const isFormValid = isEmptyObject(errors);
  const currentFieldError = get(error, name);
  const existFieldError = get(errors, name);

  if (isFieldValid && validFields.has(name)) {
    return false;
  }

  if (
    isFormValid !== isFieldValid ||
    (!isFormValid && !existFieldError) ||
    (isFieldValid && fieldsWithValidation.has(name) && !validFields.has(name))
  ) {
    return true;
  }

  return currentFieldError && !isSameError(existFieldError, currentFieldError);
}
