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