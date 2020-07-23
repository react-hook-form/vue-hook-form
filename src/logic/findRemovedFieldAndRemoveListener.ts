import removeAllEventListeners from "./removeAllEventListeners";
import getFieldValue from "./getFieldValue";
import isRadioInput from "../utils/isRadioInput";
import isCheckBoxInput from "../utils/isCheckBoxInput";
import isDetached from "../utils/isDetached";
import isArray from "../utils/isArray";
import unset from "../utils/unset";
import unique from "../utils/unique";
import isUndefined from "../utils/isUndefined";
import { Field, FieldRefs, FieldValues, Ref } from "../types/form";

const isSameRef = (fieldValue: Field, ref: Ref) =>
  fieldValue && fieldValue.ref === ref;

export default function findRemovedFieldAndRemoveListener<
  TFieldValues extends FieldValues
>(
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>,
  handleChange: ({ type, target }: Event) => Promise<void | boolean>,
  field: Field,
  unmountFieldsStateRef: React.MutableRefObject<Record<string, any>>,
  shouldUnregister?: boolean,
  forceDelete?: boolean
): void {
  const {
    ref,
    ref: { name, type },
    mutationWatcher
  } = field;
  const fieldRef = fieldsRef[name] as Field;

  if (!shouldUnregister) {
    const value = getFieldValue(fieldsRef, name, unmountFieldsStateRef);

    if (!isUndefined(value)) {
      unmountFieldsStateRef[name] = value;
    }
  }

  if (!type) {
    delete fieldsRef[name];
    return;
  }

  if ((isRadioInput(ref) || isCheckBoxInput(ref)) && fieldRef) {
    const { options } = fieldRef;

    if (isArray(options) && options.length) {
      unique(options).forEach(
        (option, index): void => {
          const { ref, mutationWatcher } = option;
          if (
            (ref && isDetached(ref) && isSameRef(option, ref)) ||
            forceDelete
          ) {
            removeAllEventListeners(ref, handleChange);

            if (mutationWatcher) {
              mutationWatcher.disconnect();
            }

            unset(options, `[${index}]`);
          }
        }
      );

      if (options && !unique(options).length) {
        delete fieldsRef[name];
      }
    } else {
      delete fieldsRef[name];
    }
  } else if ((isDetached(ref) && isSameRef(fieldRef, ref)) || forceDelete) {
    removeAllEventListeners(ref, handleChange);

    if (mutationWatcher) {
      mutationWatcher.disconnect();
    }

    delete fieldsRef[name];
  }
}
