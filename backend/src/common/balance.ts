import { InternalError } from '../middleware/errors.middleware';

export const DEFAULT_STARTING_BALANCE = '500.00';

const DECIMAL_UNITS_COUNT = 2;

export function compareBalance(balance: string, amount: string): boolean {
  const balanceVal = stringToInt(balance), amountVal = stringToInt(amount);
  if (Number.isNaN(balanceVal) || Number.isNaN(amountVal) || amountVal < 0) {
    return false;
  }
  return balanceVal >= amountVal;
}

export function substractBalance(balance: string, amount: string): string {
  const balanceVal = stringToInt(balance), amountVal = stringToInt(amount);
  if (Number.isNaN(balanceVal) || Number.isNaN(amountVal)) {
    throw new InternalError('unable to calculate');
  }

  return intToString(balanceVal - amountVal);
}

export function incrementBalance(balance: string, amount: string): string {
  const balanceVal = stringToInt(balance), amountVal = stringToInt(amount);
  if (Number.isNaN(balanceVal) || Number.isNaN(amountVal)) {
    throw new InternalError('unable to calculate');
  }

  return intToString(balanceVal + amountVal);
}

export function stringToInt(value: string): number {
  const [whole, fraction] = value.split('.');
  if (!fraction || fraction.length !== DECIMAL_UNITS_COUNT) {
    return NaN;
  }
  return Number(whole + fraction);
}

export function intToString(value: number): string {
  const str = Math.abs(value).toString();
  const [whole, fraction] = [str.slice(0, -DECIMAL_UNITS_COUNT), str.slice(-DECIMAL_UNITS_COUNT)];
  return `${
    value < 0? '-': ''
  }${
    whole.length === 0? '0': whole
  }.${
    fraction
  }${
    fraction.length < DECIMAL_UNITS_COUNT? '0'.repeat(DECIMAL_UNITS_COUNT-fraction.length): ''
  }`;
}
