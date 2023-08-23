export const DEFAULT_STARTING_BALANCE = '500.00';

export function compareBalance(balance: string, amount: string): boolean {
  const balanceVal = Number(balance), amountVal = Number(amount);
  if (Number.isNaN(balanceVal) || Number.isNaN(amountVal) || amountVal < 0) {
    return false;
  }
  return (balanceVal - amountVal) >= 0;
}
