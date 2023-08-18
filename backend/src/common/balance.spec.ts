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

    it('should return false if one value is not in correct format', () => {
      const a = '10', b = '5.00', c = '0.001';
      expect(balance.compareBalance(a, b)).toBeFalsy();
      expect(balance.compareBalance(a, c)).toBeFalsy();
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

  describe('substractBalance', () => {
    it('should substract correctly', () => {
      const a = '10.00', b = '1.01';
      expect(balance.substractBalance(a, b)).toBe('8.99');
    });

    it('should throw error if one value is not in correct format', () => {
      const a = '10', b = '5.00', c = '1.005';
      expect(() => balance.substractBalance(a, b)).toThrow(InternalError);
      expect(() => balance.substractBalance(b, c)).toThrow(InternalError);
    });

    it('should throw error if one value is not numerical string', () => {
      const a = 'test', b = '5.00';
      expect(() => balance.substractBalance(a, b)).toThrow(InternalError);
    });
  });

  describe('incrementBalance', () => {
    it('should increment correctly', () => {
      const a = '10.00', b = '1.01';
      expect(balance.incrementBalance(a, b)).toBe('11.01');
    });

    it('should throw error if one value is not in correct format', () => {
      const a = '10', b = '5.00', c = '1.005';
      expect(() => balance.incrementBalance(a, b)).toThrow(InternalError);
      expect(() => balance.incrementBalance(b, c)).toThrow(InternalError);
    });

    it('should throw error if one value is not numerical string', () => {
      const a = 'test', b = '5.00';
      expect(() => balance.incrementBalance(a, b)).toThrow(InternalError);
    });
  });

  describe('stringToInt', () => {
    it('should convert correctly', () => {
      const a = '10.00', b = '0.01', c = '0.10', d = '-1.00';
      expect(balance.stringToInt(a)).toBe(1000);
      expect(balance.stringToInt(b)).toBe(1);
      expect(balance.stringToInt(c)).toBe(10);
      expect(balance.stringToInt(d)).toBe(-100);
    });

    it('should return NaN if value is not in correct format', () => {
      const a = '10.0', b = '.01', c = '0.001', d = '10';
      expect(balance.stringToInt(a)).toBeNaN();
      expect(balance.stringToInt(b)).toBeNaN();
      expect(balance.stringToInt(c)).toBeNaN();
      expect(balance.stringToInt(d)).toBeNaN();
    });

    it('should return Nan if value is not numerical string', () => {
      const a = 'test', b = 'te.st', c = '10.te';
      expect(balance.stringToInt(a)).toBeNaN();
      expect(balance.stringToInt(b)).toBeNaN();
      expect(balance.stringToInt(c)).toBeNaN();
    });
  });

  describe('intToString', () => {
    it('should convert correctly', () => {
      const a = 1000, b = 1, c = 10, d = -1;
      expect(balance.intToString(a)).toBe('10.00');
      expect(balance.intToString(b)).toBe('0.01');
      expect(balance.intToString(c)).toBe('0.10');
      expect(balance.intToString(d)).toBe('-0.01');
    });
  });
});
