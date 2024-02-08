import api from './api';
import { toCamel, toSnake, stringifyQuery } from './utils';

describe('utils', () => {
  beforeEach(() => {
    api.init('test', 'pk_test');
  });

  describe('toCamel', () => {
    it('should preserve $ prefixed keys', () => {
      const obj = toCamel({ $cache: true, other_stuff: true });
      expect(obj).toEqual({
        $cache: true,
        otherStuff: true,
      });
    });

    it('should preserve deep $ prefixed keys', () => {
      const obj = toCamel({
        $cache: true,
        other_stuff: true,
        obj: { $locale: true },
      });
      expect(obj).toEqual({
        $cache: true,
        otherStuff: true,
        obj: { $locale: true },
      });
    });

    it('should not break arrays', () => {
      const obj = toCamel([{ quantity_value: 1 }]);
      expect(obj).toEqual([{ quantityValue: 1 }]);
    });
  });

  describe('toSnake', () => {
    it('should preserve $ prefixed keys', () => {
      const obj = toSnake({ $cache: true, otherStuff: true });
      expect(obj).toEqual({
        $cache: true,
        other_stuff: true,
      });
    });

    it('should preserve deep $ prefixed keys', () => {
      const obj = toSnake({
        $cache: true,
        otherStuff: true,
        obj: { $locale: true },
      });
      expect(obj).toEqual({
        $cache: true,
        other_stuff: true,
        obj: { $locale: true },
      });
    });

    it('should not break arrays', () => {
      const obj = toSnake([{ quantityValue: 1 }]);
      expect(obj).toEqual([{ quantity_value: 1 }]);
    });

    it('should handle _[num] correctly', () => {
      const obj1 = toSnake([{ address1: 1 }]);
      expect(obj1).toEqual([{ address1: 1 }]);
      const obj2 = toSnake([{ address1Test: 1 }]);
      expect(obj2).toEqual([{ address1_test: 1 }]);
      const obj3 = toSnake([{ address1Test2: 1 }]);
      expect(obj3).toEqual([{ address1_test2: 1 }]);
    });
  });

  describe('stringifyQuery', () => {
    it('should encode $ prefixed keys', () => {
      const str = stringifyQuery({ $cache: true, other_stuff: true });
      expect(str).toEqual('%24cache=true&other_stuff=true');
    });
  });
});
