import shouldRenderBasedOnError from './shouldRenderBasedOnError';

describe('shouldUpdateWithError', () => {
  it('should return true when error message empty and error exists', () => {
    expect(
      shouldRenderBasedOnError({
        errors: {},
        name: 'test',
        error: { test: 'test' } as any,
        validFields: new Set(),
        fieldsWithValidation: new Set(),
      }),
    ).toBeTruthy();
  });

  it('should return false when form is valid and field is valid', () => {
    expect(
      shouldRenderBasedOnError({
        errors: {},
        name: 'test',
        error: {},
        validFields: new Set(),
        fieldsWithValidation: new Set(),
      }),
    ).toBeFalsy();
  });

  it('should return true when error disappeared', () => {
    expect(
      shouldRenderBasedOnError({
        errors: { test: 'test' } as any,
        name: 'test',
        error: {},
        validFields: new Set(),
        fieldsWithValidation: new Set(),
      }),
    ).toBeTruthy();
  });

  it('should return true when error return and not found in error message', () => {
    expect(
      shouldRenderBasedOnError({
        errors: { test: 'test' } as any,
        name: '',
        error: { data: 'bill' } as any,
        validFields: new Set(),
        fieldsWithValidation: new Set(),
      }),
    ).toBeTruthy();
  });

  it('should return true when error type or message not match in error message', () => {
    expect(
      shouldRenderBasedOnError({
        errors: { test: { type: 'test' } } as any,
        name: 'test',
        error: { test: { type: 'bill' } } as any,
        validFields: new Set(),
        fieldsWithValidation: new Set(),
      }),
    ).toBeTruthy();
  });

  it('should return false if nothing matches', () => {
    expect(
      shouldRenderBasedOnError({
        errors: { test: { message: 'test', type: 'input' } } as any,
        name: 'test',
        error: { test: { type: 'input', message: 'test' } } as any,
        validFields: new Set(),
        fieldsWithValidation: new Set(),
      }),
    ).toBeFalsy();
  });

  it('should not clear error when it is set manually', () => {
    expect(
      shouldRenderBasedOnError({
        errors: {
          test: { message: 'test', type: 'input' },
        } as any,
        name: 'test',
        error: { test: { type: 'input', message: 'test' } } as any,
        validFields: new Set(),
        fieldsWithValidation: new Set(),
      }),
    ).toBeFalsy();
  });

  it('should return true when new validate field is been introduced', () => {
    expect(
      shouldRenderBasedOnError({
        errors: { test: { message: 'test', type: 'input' } } as any,
        name: 'test1',
        error: {},
        validFields: new Set(['test']),
        fieldsWithValidation: new Set(['test1']),
      }),
    ).toBeTruthy();
  });

  it('should return false when same valid input been triggered', () => {
    expect(
      shouldRenderBasedOnError({
        errors: { test: { message: 'test', type: 'input' } } as any,
        name: 'test',
        error: {},
        validFields: new Set(['test']),
        fieldsWithValidation: new Set(['test']),
      }),
    ).toBeFalsy();
  });

  it('should return true when schema errors is different', () => {
    expect(
      shouldRenderBasedOnError({
        errors: { test: { message: 'test', type: 'input' } } as any,
        name: 'test',
        error: {},
        validFields: new Set(),
        fieldsWithValidation: new Set(),
      }),
    ).toBeTruthy();
  });
});
