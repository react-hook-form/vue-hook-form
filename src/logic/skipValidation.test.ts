import skipValidation from './skipValidation';

describe('should skip validation', () => {
  it('when is onChange mode and blur event', () => {
    expect(
      skipValidation({
        isOnChange: true,
        isBlurEvent: false,
        isReValidateOnChange: true,
        isOnBlur: true,
        isReValidateOnBlur: false,
        isSubmitted: false,
      }),
    ).toBeTruthy();
  });

  it('when is onSubmit mode and re-validate on Submit', () => {
    expect(
      skipValidation({
        isOnChange: false,
        isReValidateOnChange: false,
        isBlurEvent: false,
        isOnBlur: false,
        isReValidateOnBlur: false,
        isSubmitted: false,
      }),
    ).toBeTruthy();
  });

  it('when is onSubmit mode and not submitted yet', () => {
    expect(
      skipValidation({
        isOnChange: false,
        isBlurEvent: false,
        isReValidateOnChange: true,
        isOnBlur: false,
        isReValidateOnBlur: false,
        isSubmitted: false,
      }),
    ).toBeTruthy();
  });

  it('when on blur mode, not blur event and error gets clear', () => {
    expect(
      skipValidation({
        isOnChange: false,
        isBlurEvent: false,
        isReValidateOnChange: true,
        isOnBlur: true,
        isReValidateOnBlur: false,
        isSubmitted: false,
      }),
    ).toBeTruthy();
  });

  it('when re-validate mode is blur, not blur event and has error ', () => {
    expect(
      skipValidation({
        isOnChange: false,
        isBlurEvent: false,
        isReValidateOnChange: true,
        isOnBlur: false,
        isReValidateOnBlur: true,
        isSubmitted: true,
      }),
    ).toBeTruthy();
  });

  it('when is re-validate mode on submit and have error', () => {
    expect(
      skipValidation({
        isOnChange: false,
        isBlurEvent: false,
        isOnBlur: false,
        isReValidateOnChange: false,
        isReValidateOnBlur: false,
        isSubmitted: true,
      }),
    ).toBeTruthy();
  });
});

describe('should validate the input', () => {
  it('when form is submitted and there is error', () => {
    expect(
      skipValidation({
        isOnChange: false,
        isBlurEvent: false,
        isReValidateOnChange: true,
        isOnBlur: false,
        isReValidateOnBlur: false,
        isSubmitted: true,
      }),
    ).toBeFalsy();
  });

  it('when user blur input and there is no more error', () => {
    expect(
      skipValidation({
        isOnChange: false,
        isBlurEvent: true,
        isReValidateOnChange: true,
        isOnBlur: true,
        isReValidateOnBlur: false,
        isSubmitted: false,
      }),
    ).toBeFalsy();
  });

  it('when user blur and there is an error', () => {
    expect(
      skipValidation({
        isOnChange: false,
        isBlurEvent: true,
        isReValidateOnChange: true,
        isOnBlur: true,
        isReValidateOnBlur: false,
        isSubmitted: false,
      }),
    ).toBeFalsy();
  });
});
