import { ref } from "vue";
import getFieldsValues from "./logic/getFieldsValues";
import getFieldValue from "./logic/getFieldValue";
import {
  Field,
  FieldElement,
  FieldErrors,
  FieldName,
  FieldValue,
  FieldValues,
  FlatFieldErrors,
  InternalFieldName,
  Ref,
  UnpackNestedValue,
  UseFormOptions,
  ValidationRules
} from "./types/form";
import isString from "./utils/isString";
import isArray from "./utils/isArray";
import { EVENTS, UNDEFINED, VALIDATION_MODE } from "./constants";
import isUndefined from "./utils/isUndefined";
import isRadioOrCheckboxFunction from "./utils/isRadioOrCheckbox";
import onDomRemove from "./utils/onDomRemove";
import unique from "./utils/unique";
import { get } from "./utils";
import isEmptyObject from "./utils/isEmptyObject";
import isNameInFieldArray from "./logic/isNameInFieldArray";
import findRemovedFieldAndRemoveListener from "./logic/findRemovedFieldAndRemoveListener";
import isObject from "./utils/isObject";
import modeChecker from "./utils/validationModeChecker";
import attachEventListeners from "./logic/attachEventListeners";
import isSelectInput from "./utils/isSelectInput";
import skipValidation from "./logic/skipValidation";
import getFieldArrayParentName from "./logic/getFieldArrayParentName";
import set from "./utils/set";
import unset from "./utils/unset";
import getIsFieldsDifferent from "./logic/getIsFieldsDifferent";
import isHTMLElement from "./utils/isHTMLElement";
import isNullOrUndefined from "./utils/isNullOrUndefined";
import { DeepPartial } from "./types/utils";
import validateField from "./logic/validateField";
import shouldRenderBasedOnError from "./logic/shouldRenderBasedOnError";

const isWindowUndefined = typeof window === UNDEFINED;
const isWeb =
  typeof document !== UNDEFINED &&
  !isWindowUndefined &&
  !isUndefined(window.HTMLElement);
const isProxyEnabled = isWeb ? "Proxy" in window : typeof Proxy !== UNDEFINED;

export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object
>({
  resolver,
  shouldUnregister,
  mode,
  context,
  criteriaMode,
  reValidateMode
}: UseFormOptions<TFieldValues, TContext> = {}) {
  let isDirtyRef = false;
  let isValidRef = false;
  const fieldsRef: any = {};
  const isUnMount = false;
  const validFieldsRef = new Set();
  const dirtyFieldsRef: any = ref({});
  const errorsRef: any = ref({});
  const defaultValuesAtRenderRef: any = ref({});
  const watchFieldsHookRef: any = ref({});
  const watchFieldsHookRenderRef: any = ref({});
  const fieldArrayNamesRef: any = new Set();
  const unmountFieldsStateRef = ref({});
  const defaultValuesRef = ref({});
  const touchedFieldsRef = ref({});
  const isWatchAllRef = false;
  const fieldsWithValidationRef = new Set();
  const isSubmittedRef = false;
  const watchFieldsRef = new Set();
  const { isOnBlur, isOnSubmit, isOnChange, isOnAll } = modeChecker(mode);
  const {
    isOnBlur: isReValidateOnBlur,
    isOnChange: isReValidateOnChange
  } = modeChecker(reValidateMode);
  const readFormStateRef = {
    isDirty: !isProxyEnabled,
    dirtyFields: !isProxyEnabled,
    isSubmitted: isOnSubmit,
    submitCount: !isProxyEnabled,
    touched: !isProxyEnabled,
    isSubmitting: !isProxyEnabled,
    isValid: !isProxyEnabled
  };
  const formState = ref({
    isSubmitting: false,
    isValid: false
  });
  const isValidateAllFieldCriteria = criteriaMode === VALIDATION_MODE.all;

  const isFieldWatched = (name: string) =>
    isWatchAllRef ||
    watchFieldsRef.has(name) ||
    watchFieldsRef.has((name.match(/\w+/) || [])[0]);

  const setDirty = (name: InternalFieldName<TFieldValues>): boolean => {
    const { isDirty, dirtyFields } = readFormStateRef;

    if (!fieldsRef[name] || (!isDirty && !dirtyFields)) {
      return false;
    }

    const isFieldDirty =
      defaultValuesAtRenderRef[name] !==
      getFieldValue(fieldsRef, name, unmountFieldsStateRef);
    const isDirtyFieldExist = get(dirtyFieldsRef, name);
    const isFieldArray = isNameInFieldArray(fieldArrayNamesRef, name);
    const previousIsDirty = isDirtyRef;

    if (isFieldDirty) {
      set(dirtyFieldsRef, name, true);
    } else {
      unset(dirtyFieldsRef, name);
    }

    isDirtyRef =
      (isFieldArray &&
        getIsFieldsDifferent(
          get(getValues(), getFieldArrayParentName(name)),
          get(defaultValuesRef, getFieldArrayParentName(name))
        )) ||
      !isEmptyObject(dirtyFieldsRef);

    return (
      (isDirty && previousIsDirty !== isDirtyRef) ||
      (dirtyFields && isDirtyFieldExist !== get(dirtyFieldsRef, name))
    );
  };

  const renderWatchedInputs = (name: string, found = true): boolean => {
    // if (!isEmptyObject(watchFieldsHookRef)) {
    //   for (const key in watchFieldsHookRef) {
    //     if (
    //       name === "" ||
    //       watchFieldsHookRef[key].has(name) ||
    //       watchFieldsHookRef[key].has(getFieldArrayParentName(name)) ||
    //       !watchFieldsHookRef[key].size
    //     ) {
    //       watchFieldsHookRenderRef[key]();
    //       found = false;
    //     }
    //   }
    // }

    return found;
  };

  const shouldRenderBaseOnError = (
    name: InternalFieldName<TFieldValues>,
    error: FlatFieldErrors<TFieldValues>,
    shouldRender: boolean | null = false
  ): boolean | void => {
    let shouldReRender =
      shouldRender ||
      shouldRenderBasedOnError<TFieldValues>({
        errors: errorsRef.current,
        error,
        name,
        validFields: validFieldsRef.current,
        fieldsWithValidation: fieldsWithValidationRef.current
      });
    const previousError = get(errorsRef.current, name);

    if (isEmptyObject(error)) {
      if (fieldsWithValidationRef.current.has(name) || resolverRef.current) {
        validFieldsRef.current.add(name);
        shouldReRender = shouldReRender || previousError;
      }

      errorsRef.current = unset(errorsRef.current, name);
    } else {
      validFieldsRef.current.delete(name);
      shouldReRender =
        shouldReRender ||
        !previousError ||
        !isSameError(previousError, error[name] as FieldError);

      set(errorsRef.current, name, error[name]);
    }

    if (shouldReRender && !isNullOrUndefined(shouldRender)) {
      reRender();
      return true;
    }
  };

  const handleChangeRef = async ({
    type,
    target
  }: Event): Promise<void | boolean> => {
    const name = (target as Ref)!.name;
    const field = fieldsRef[name];
    let error: FlatFieldErrors<TFieldValues>;

    if (field) {
      const isBlurEvent = type === EVENTS.BLUR;
      const shouldSkipValidation =
        !isOnAll &&
        skipValidation({
          isOnChange,
          isOnBlur,
          isBlurEvent,
          isReValidateOnChange,
          isReValidateOnBlur,
          isSubmitted: isSubmittedRef
        });
      let shouldRender = setDirty(name) || isFieldWatched(name);

      if (
        isBlurEvent &&
        !get(touchedFieldsRef, name) &&
        readFormStateRef.touched
      ) {
        set(touchedFieldsRef, name, true);
        shouldRender = true;
      }

      if (shouldSkipValidation) {
        renderWatchedInputs(name);
        return shouldRender && reRender();
      }

      if (resolver) {
        const { errors } = await resolver(
          getValues() as TFieldValues,
          context,
          isValidateAllFieldCriteria
        );
        const previousFormIsValid = isValidRef;
        isValidRef = isEmptyObject(errors);

        error = (get(errors, name)
          ? { [name]: get(errors, name) }
          : {}) as FlatFieldErrors<TFieldValues>;

        if (previousFormIsValid !== isValidRef) {
          shouldRender = true;
        }
      } else {
        error = await validateField<TFieldValues>(
          fieldsRef,
          isValidateAllFieldCriteria,
          field,
          unmountFieldsStateRef
        );
      }

      renderWatchedInputs(name);

      if (!shouldRenderBaseOnError(name, error) && shouldRender) {
        reRender();
      }
    }
  };

  const removeFieldEventListener = (field: Field, forceDelete?: boolean) =>
    findRemovedFieldAndRemoveListener(
      fieldsRef,
      handleChangeRef!,
      field,
      unmountFieldsStateRef,
      shouldUnregister,
      forceDelete
    );

  const removeFieldEventListenerAndRef = (
    field: Field | undefined,
    forceDelete?: boolean
  ) => {
    if (
      field &&
      (!isNameInFieldArray(fieldArrayNamesRef, field.ref.name) || forceDelete)
    ) {
      removeFieldEventListener(field, forceDelete);

      if (shouldUnregister) {
        [
          errorsRef,
          touchedFieldsRef,
          dirtyFieldsRef,
          defaultValuesAtRenderRef
        ].forEach(data => unset(data, field.ref.name));

        [fieldsWithValidationRef, validFieldsRef].forEach(data =>
          data.delete(field.ref.name)
        );

        if (
          readFormStateRef.isValid ||
          readFormStateRef.touched ||
          readFormStateRef.isDirty
        ) {
          isDirtyRef = !isEmptyObject(dirtyFieldsRef);
          reRender();

          if (resolverRef) {
            validateResolver();
          }
        }
      }
    }
  };

  const setFieldValue = (
    { ref, options }: Field,
    rawValue:
      | FieldValue<TFieldValues>
      | UnpackNestedValue<DeepPartial<TFieldValues>>
      | undefined
      | null
      | boolean
  ) => {
    const value =
      isWeb && isHTMLElement(ref) && isNullOrUndefined(rawValue)
        ? ""
        : rawValue;

    if (isRadioInput(ref) && options) {
      options.forEach(
        ({ ref: radioRef }: { ref: HTMLInputElement }) =>
          (radioRef.checked = radioRef.value === value)
      );
    } else if (isFileInput(ref) && !isString(value)) {
      ref.files = value as FileList;
    } else if (isMultipleSelect(ref)) {
      [...ref.options].forEach(
        selectRef =>
          (selectRef.selected = (value as string).includes(selectRef.value))
      );
    } else if (isCheckBoxInput(ref) && options) {
      options.length > 1
        ? options.forEach(
            ({ ref: checkboxRef }) =>
              (checkboxRef.checked = (value as string).includes(
                checkboxRef.value
              ))
          )
        : (options[0].ref.checked = !!value);
    } else {
      ref.value = value;
    }
  };

  const validateResolver = (values = {}) => {
    resolver(
      {
        ...defaultValuesRef,
        ...getValues(),
        ...values
      },
      context,
      isValidateAllFieldCriteria
    ).then(({ errors }) => {
      const previousFormIsValid = isValidRef;
      isValidRef = isEmptyObject(errors);

      if (previousFormIsValid !== isValidRef) {
        formState.value.isValid = isValidRef;
      }
    });
  };

  function registerFieldRef<TFieldElement extends FieldElement<TFieldValues>>(
    ref: TFieldElement & Ref,
    validateOptions: ValidationRules | null = {}
  ): ((name: InternalFieldName<TFieldValues>) => void) | void {
    if (process.env.NODE_ENV !== "production" && !ref.name) {
      // eslint-disable-next-line no-console
      return console.warn("Missing name @", ref);
    }

    const { name, type, value } = ref;
    const fieldRefAndValidationOptions = {
      ref,
      ...validateOptions
    };
    const fields = fieldsRef;
    const isRadioOrCheckbox = isRadioOrCheckboxFunction(ref);
    let field = fields[name];
    let isEmptyDefaultValue = true;
    let isFieldArray;
    let defaultValue;

    if (
      field &&
      (isRadioOrCheckbox
        ? isArray(field.options) &&
          unique(field.options).find(option => {
            return value === option.ref.value && option.ref === ref;
          })
        : ref === field.ref)
    ) {
      fields[name] = {
        ...field,
        ...validateOptions
      };
      return;
    }

    if (type) {
      const mutationWatcher = onDomRemove(ref, () =>
        removeFieldEventListenerAndRef(field)
      );

      field = isRadioOrCheckbox
        ? {
            options: [
              ...unique((field && field.options) || []),
              {
                ref,
                mutationWatcher
              }
            ],
            ref: { type, name },
            ...validateOptions
          }
        : {
            ...fieldRefAndValidationOptions,
            mutationWatcher
          };
    } else {
      field = fieldRefAndValidationOptions;
    }

    fields[name] = field;

    const isEmptyUnmountFields = isUndefined(get(unmountFieldsStateRef, name));

    if (!isEmptyObject(defaultValuesRef) || !isEmptyUnmountFields) {
      defaultValue = get(
        isEmptyUnmountFields ? defaultValuesRef : unmountFieldsStateRef,
        name
      );
      isEmptyDefaultValue = isUndefined(defaultValue);
      isFieldArray = isNameInFieldArray(fieldArrayNamesRef, name);

      if (!isEmptyDefaultValue && !isFieldArray) {
        setFieldValue(field, defaultValue);
      }
    }

    if (resolver && !isFieldArray && readFormStateRef.isValid) {
      validateResolver();
    } else if (!isEmptyObject(validateOptions)) {
      fieldsWithValidationRef.add(name);

      if (!isOnSubmit && readFormStateRef.isValid) {
        validateField(
          fieldsRef,
          isValidateAllFieldCriteria,
          field,
          unmountFieldsStateRef
        ).then((error: FieldErrors) => {
          const previousFormIsValid = isValidRef;

          isEmptyObject(error)
            ? validFieldsRef.add(name)
            : (isValidRef = false) && validFieldsRef.delete(name);

          if (previousFormIsValid !== isValidRef) {
            formState.value.isValid = isValidRef;
          }
        });
      }
    }

    if (
      !defaultValuesAtRenderRef[name] &&
      !(isFieldArray && isEmptyDefaultValue)
    ) {
      const fieldValue = getFieldValue(fieldsRef, name, unmountFieldsStateRef);
      defaultValuesAtRenderRef[name] = isEmptyDefaultValue
        ? isObject(fieldValue)
          ? { ...fieldValue }
          : fieldValue
        : defaultValue;
    }

    if (type) {
      attachEventListeners(
        isRadioOrCheckbox && field.options
          ? field.options[field.options.length - 1]
          : field,
        isRadioOrCheckbox || isSelectInput(ref),
        handleChangeRef
      );
    }
  }

  function register<TFieldElement extends FieldElement<TFieldValues>>(
    rules?: ValidationRules
  ): (ref: (TFieldElement & Ref) | null) => void;
  function register(
    name: FieldName<TFieldValues>,
    rules?: ValidationRules
  ): void;
  function register<TFieldElement extends FieldElement<TFieldValues>>(
    ref: (TFieldElement & Ref) | null,
    rules?: ValidationRules
  ): void;
  function register<TFieldElement extends FieldElement<TFieldValues>>(
    refOrValidationOptions?:
      | FieldName<TFieldValues>
      | ValidationRules
      | (TFieldElement & Ref)
      | null,
    rules?: ValidationRules
  ): ((ref: (TFieldElement & Ref) | null) => void) | void {
    if (!isWindowUndefined) {
      if (isString(refOrValidationOptions)) {
        registerFieldRef({ name: refOrValidationOptions }, rules);
      } else if (
        isObject(refOrValidationOptions) &&
        "name" in refOrValidationOptions
      ) {
        registerFieldRef(refOrValidationOptions, rules);
      } else {
        return (ref: (TFieldElement & Ref) | null) =>
          ref && registerFieldRef(ref, refOrValidationOptions);
      }
    }
  }

  function getValues(): UnpackNestedValue<TFieldValues>;
  function getValues<TFieldName extends string, TFieldValue extends unknown>(
    name: TFieldName
  ): TFieldName extends keyof TFieldValues
    ? UnpackNestedValue<TFieldValues>[TFieldName]
    : TFieldValue;
  function getValues<TFieldName extends keyof TFieldValues>(
    names: TFieldName[]
  ): UnpackNestedValue<Pick<TFieldValues, TFieldName>>;
  function getValues(payload?: string | string[]): unknown {
    if (isString(payload)) {
      return getFieldValue(fieldsRef, payload, unmountFieldsStateRef);
    }

    if (isArray(payload)) {
      return payload.reduce(
        (previous, name) => ({
          ...previous,
          [name]: getFieldValue(fieldsRef, name, unmountFieldsStateRef)
        }),
        {}
      );
    }

    return getFieldsValues(fieldsRef, unmountFieldsStateRef);
  }

  return {
    formState,
    getValues,
    register,
    errors: errorsRef,
    handleSubmit: () => async (e): Promise<void> => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }

      console.log(getValues());

      // let fieldErrors = {};
      // let fieldValues = getValues();
      //
      // if (readFormStateRef.isSubmitting) {
      //   formState.value = {
      //     ...formState.value,
      //     isSubmitting: true
      //   };
      // }
      //
      // try {
      //   if (resolverRef) {
      //     const { errors, values } = await resolverRef(
      //       fieldValues as TFieldValues,
      //       contextRef,
      //       isValidateAllFieldCriteria
      //     );
      //     errorsRef = errors;
      //     fieldErrors = errors;
      //     fieldValues = values;
      //   } else {
      //     for (const field of Object.values(fieldsRef)) {
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
      //           validFieldsRef.delete(name);
      //         } else if (fieldsWithValidationRef.has(name)) {
      //           unset(errorsRef, name);
      //           validFieldsRef.add(name);
      //         }
      //       }
      //     }
      //   }
      //
      //   if (
      //     isEmptyObject(fieldErrors) &&
      //     Object.keys(errorsRef).every(name =>
      //       Object.keys(fieldsRef).includes(name)
      //     )
      //   ) {
      //     errorsRef = {};
      //     reRender();
      //     await callback(
      //       fieldValues as UnpackNestedValue<TSubmitFieldValues>,
      //       e
      //     );
      //   } else {
      //     errorsRef = { ...errorsRef, ...fieldErrors };
      //     if (shouldFocusError) {
      //       focusOnErrorField(fieldsRef, fieldErrors);
      //     }
      //   }
      // } finally {
      //   isSubmittedRef = true;
      //   isSubmittingRef = false;
      //   submitCountRef = submitCountRef + 1;
      //   reRender();
      // }
    }
  };
}
