/** Returns true on failed validation. Checks that string is not empty*/
export const validateString = (value: string): boolean => {
  return value.length === 0;
};

/** Returns true on failed validation*/
export const validatePassword = (value: string): boolean => {
  return value.length < 6;
};

/** Returns true on failed validation*/
export const validateEmail = (value: string): boolean => {
  return !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
};

/** Returns true on failed validation*/
export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
): boolean => {
  return password !== confirmPassword;
};

interface validateNumberStringOptions {
  min?: number;
  decimalDigits?: number;
}

/** Returns true on failed validation*/
export const validateNumberString = (
  value: string,
  options: validateNumberStringOptions,
): boolean => {
  let res = true;
  const valueToNumber = Number(value);
  res = res && typeof value === "string" && valueToNumber !== Number.NaN;
  if (options.hasOwnProperty("min") && options.min !== undefined) {
    res = res && valueToNumber > options.min;
  }
  if (
    options.hasOwnProperty("decimalDigits") &&
    options.decimalDigits !== undefined
  ) {
    const [_, decimal] = value.split(".");
    res = res && decimal.length === options.decimalDigits;
  }
  return !res;
};
