import { InternalError } from '../middleware/errors.middleware';
import * as balance from './balance';


describe('common/balance', () => {
  describe('compareBalance', () => {
    it('should compare two valid values', () => {
      const a = '10.00', b = '5.00';
      expect(balance.compareBalance(a, b)).toBeTruthy();
    });

    it('should return false if amount greater than balance', () => {
      const a = '10.00', b = '15.00';
      expect(balance.compareBalance(a, b)).toBeFalsy();
    });

    it('should return false if amount is negative', () => {
      const a = '10.00', b = '-1.00';
      expect(balance.compareBalance(a, b)).toBeFalsy();
    });

    it('shoud return false if one value is not numerical string', () => {
      const a = 'test', b = '5.00';
      expect(balance.compareBalance(a, b)).toBeFalsy();
      expect(balance.compareBalance(b, a)).toBeFalsy();
    });
  });
});
