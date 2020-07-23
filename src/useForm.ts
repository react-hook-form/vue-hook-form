import getFieldsValues from "./logic/getFieldsValues";

export function useForm() {
  const fields = {};

  const getValues = () => {
    return getFieldsValues(fields);
  };

  return {
    formState: {},
    getValues,
    register: rules => ref => {
      const { name } = ref;
      fields[name] = {
        ref,
        ...rules
      };
    },
    handleSubmit: () => async (e): Promise<void> => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }

      let fieldErrors = {};

      console.log(getValues());
      // let fieldValues = this.getValues;

      // if (readFormStateRef.current.isSubmitting) {
      //   isSubmittingRef.current = true;
      //   reRender();
      // }
      //
      // try {
      //   if (resolverRef.current) {
      //     const { errors, values } = await resolverRef.current(
      //       fieldValues as TFieldValues,
      //       contextRef.current,
      //       isValidateAllFieldCriteria
      //     );
      //     errorsRef.current = errors;
      //     fieldErrors = errors;
      //     fieldValues = values;
      //   } else {
      //     for (const field of Object.values(fieldsRef.current)) {
      //       if (field) {
      //         const {
      //           ref: { name }
      //         } = field;
      //
      //         const fieldError = await validateField(
      //           fieldsRef,
      //           isValidateAllFieldCriteria,
      //           field,
      //           unmountFieldsStateRef
      //         );
      //
      //         if (fieldError[name]) {
      //           set(fieldErrors, name, fieldError[name]);
      //           validFieldsRef.current.delete(name);
      //         } else if (fieldsWithValidationRef.current.has(name)) {
      //           unset(errorsRef.current, name);
      //           validFieldsRef.current.add(name);
      //         }
      //       }
      //     }
      //   }
      //
      //   if (
      //     isEmptyObject(fieldErrors) &&
      //     Object.keys(errorsRef.current).every(name =>
      //       Object.keys(fieldsRef.current).includes(name)
      //     )
      //   ) {
      //     errorsRef.current = {};
      //     reRender();
      //     await callback(
      //       fieldValues as UnpackNestedValue<TSubmitFieldValues>,
      //       e
      //     );
      //   } else {
      //     errorsRef.current = {
      //       ...errorsRef.current,
      //       ...fieldErrors
      //     };
      //     if (shouldFocusError) {
      //       focusOnErrorField(fieldsRef.current, fieldErrors);
      //     }
      //   }
      // } finally {
      //   isSubmittedRef.current = true;
      //   isSubmittingRef.current = false;
      //   submitCountRef.current = submitCountRef.current + 1;
      //   reRender();
      // }
    }
  };
}
