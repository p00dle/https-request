import { describe, expect, test } from 'vitest';
import { matchDomain } from './match-domain';

describe('matchDomain', () => {
  test('should match when strings are the same', () => expect(matchDomain('abc', 'abc')).toBeTruthy());
  test('should not match when strings are different', () => expect(matchDomain('abc', 'def')).toBeFalsy());
  test('should match when one is subdomain of the other', () => expect(matchDomain('sub.abc.com', 'abc.com')).toBeTruthy());
  test('should not match the other way round', () => expect(matchDomain('abc.com', 'sub.abc.com')).toBeFalsy());
  test('should not match when top domain is different', () => expect(matchDomain('subabc.com', 'abc.com')).toBeFalsy());
});
