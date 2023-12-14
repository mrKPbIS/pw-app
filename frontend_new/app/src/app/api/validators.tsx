export const validateString = (value: string): boolean => {
  return value.length === 0;
}

export const validatePassword = (value: string): boolean => {
  return value.length < 6;
}

export const validateEmail = (value: string): boolean => {
  return !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
}

export const validateConfirmPassword = (password: string, confirmPassword: string): boolean => {
  return password !== confirmPassword;
}

interface validateNumberStringOptions {
  min?: number;
  decimalDigits?: number;
}

export const validateNumberString = (value: string, options: validateNumberStringOptions): boolean => {
  let res = true;
  const valueToNumber = Number(value);
  res = res && typeof value === 'string' && valueToNumber !== Number.NaN;
  if (options.hasOwnProperty('min') && options.min !== undefined) {
    res = res && valueToNumber > options.min;
  }
  if (options.hasOwnProperty('decimalDigits') && options.decimalDigits !== undefined) {
    const [whole, decimal] = value.split('.');
    res = res && decimal.length === options.decimalDigits;
  }
  return !res;
}