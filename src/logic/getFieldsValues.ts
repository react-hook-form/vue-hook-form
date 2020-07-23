import getFieldValue from './getFieldValue';
import isString from '../utils/isString';
import isArray from '../utils/isArray';
import isUndefined from '../utils/isUndefined';
import { InternalFieldName, FieldValues, FieldRefs } from '../types/form';
import transformToNestObject from './transformToNestObject';

export default <TFieldValues extends FieldValues>(
  fieldsRef,
  unmountFieldsStateRef?,
  search?:
    | InternalFieldName<TFieldValues>
    | InternalFieldName<TFieldValues>[]
    | { nest: boolean },
) => {
  const output = {} as TFieldValues;

  for (const name in fieldsRef) {
    if (
      isUndefined(search) ||
      (isString(search)
        ? name.startsWith(search)
        : isArray(search) && search.find((data) => name.startsWith(data)))
    ) {
      output[name as InternalFieldName<TFieldValues>] = getFieldValue(
        fieldsRef,
        name,
      );
    }
  }

  return {
    ...transformToNestObject((unmountFieldsStateRef || {}).current || {}),
    ...transformToNestObject(output),
  };
};
