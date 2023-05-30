import { describe, test, expect } from 'vitest';
import { URL } from 'node:url';
import { parseCookie } from './parse-cookie';

describe('parseCookie', () => {
  const exampleUrl = new URL('https:/example.com');
  test('parses valid cookies', () => {
    const cookies = [
      '0=0',
      '1=a; Expires=Wed, 21 Oct 2015 07:28:00 GMT ',
      '2=b; Max-Age=200',
      '3=c; Domain=.example.com',
      '4=d; Path=/foo/bar',
      '5=e; Secure',
      '6=f; HttpOnly',
      '7=a; SameSite=None; Secure',
      '8=b; SameSite=Lax',
      '9=c; SameSite=Strict',
      '10=d',
      '"11"="e"',
    ].map((str) => parseCookie(exampleUrl, str));
    expect(cookies[0]).toMatchObject({ key: '0', value: '0' });
    expect(cookies[1].expires).toBe(Date.UTC(2015, 9, 21, 7, 28));
    expect(cookies[2].expires).toBeGreaterThan(Date.now() + 199_000);
    expect(cookies[3].allowSubDomains).toBe(true);
    expect(cookies[4].path).toBe('/foo/bar');
    expect(cookies[5].secure).toBe(true);
    expect(cookies[6]).toMatchObject({ key: '6', value: 'f' });
    expect(cookies[7].sameSite).toBe('None');
    expect(cookies[8].sameSite).toBe('Lax');
    expect(cookies[9].sameSite).toBe('Strict');
    expect(cookies[10].sameSite).toBe('Lax');
    expect(cookies[11]).toMatchObject({ key: '11', value: 'e' });
  });
  test('Max-Age takes precedence over Expires', () => {
    const cookies = [
      '0=0; Max-Age=50; Expires=Wed, 21 Oct 2015 07:28:00 GMT',
      '1=0; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Max-Age=50',
    ].map((str) => parseCookie(exampleUrl, str));
    expect(cookies[0].expires).toBeGreaterThan(Date.now());
    expect(cookies[1].expires).toBeGreaterThan(Date.now());
  });
  test('Leading dot in domain is discarded', () => {
    const cookie = parseCookie(exampleUrl, '0=0; Domain=.example.com');
    expect(cookie.domain).toBe('example.com');
  });
});
