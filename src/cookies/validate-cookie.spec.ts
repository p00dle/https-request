import { describe, test, expect } from 'vitest';
import { URL } from 'node:url';
import { parseCookie } from './parse-cookie';
import { validateCookie } from './validate-cookie';

describe('validateCookie', () => {
  const exampleUrl = new URL('https:/example.com');
  const httpExampleUrl = new URL('http:/example.com');
  test('rejects cookies with invalid key, value, or attribute', () => {
    const cookies = [
      '0"=0',
      '1= 1',
      '(1=a)',
      '@2=b',
      '3=c,; Domain=example.com',
      '4=\\d; Path=/foo/bar',
      '\u00105=e; Secure',
      '6=f\u0100; HttpOnly',
      '7=g; InvalidAttribute',
      '8=h; SameSite=Duh',
      '9=i; Max-Age=abc',
      '10=k; Expires=INVALID DATE',
    ].map((str) => parseCookie(exampleUrl, str));
    expect(cookies).toHaveLength(12);
    expect(cookies.filter((cookie) => validateCookie(exampleUrl, cookie))).toHaveLength(0);
  });
  test('rejects cookies from insecure site with secure attribute', () => {
    const cookie = parseCookie(httpExampleUrl, '0=0; Secure');
    expect(cookie).toMatchObject({ key: '0', value: '0' });
    expect(validateCookie(httpExampleUrl, cookie)).toBeFalsy();
  });
  test('allows cookies from insecure localhost with secure attribute', () => {
    const localhostUrl = new URL('http://localhost');
    const cookie = parseCookie(localhostUrl, '0=0; Secure');
    expect(cookie).toMatchObject({ key: '0', value: '0' });
    expect(validateCookie(localhostUrl, cookie)).toBeTruthy();
  });

  test('if cookie key starts with __Secure- allow only https and secure cookies', () => {
    const cookieStrings = ['__Secure-0=0; Secure', '__Secure-1=0'];
    const httpCookies = cookieStrings.map((str) => parseCookie(httpExampleUrl, str));
    const httpsCookies = cookieStrings.map((str) => parseCookie(exampleUrl, str));
    expect(httpCookies).toHaveLength(2);
    expect(httpsCookies).toHaveLength(2);
    expect(httpCookies.filter((cookie) => validateCookie(httpExampleUrl, cookie))).toHaveLength(0);
    expect(httpsCookies.filter((cookie) => validateCookie(httpExampleUrl, cookie))).toHaveLength(0);
  });
  test('if cookie key starts with __Host- allow only https and secure cookies with unspecified domain and path', () => {
    const cookieStrings = [
      '__Host-0=0',
      '__Host-1=0; Secure', // allow only on https
      '__Host-2=0; Secure; Domain=example.com',
      '__Host-3=0; Secure; Path=/foo/bar',
    ];
    const httpCookies = cookieStrings.map((str) => parseCookie(httpExampleUrl, str));
    const httpsCookies = cookieStrings.map((str) => parseCookie(exampleUrl, str));
    expect(httpCookies).toHaveLength(4);
    expect(httpsCookies).toHaveLength(4);
    expect(httpCookies.filter((cookie) => validateCookie(httpExampleUrl, cookie))).toHaveLength(0);
    expect(httpsCookies.filter((cookie) => validateCookie(exampleUrl, cookie))).toHaveLength(1);
  });
  test('rejects insecure cookies with SameSite=None', () => {
    const cookies = [
      '0=0; SameSite=None; Secure', // allow
      '1=0; SameSite=None',
    ].map((str) => parseCookie(exampleUrl, str));
    expect(cookies).toHaveLength(2);
    expect(cookies.filter((cookie) => validateCookie(exampleUrl, cookie))).toHaveLength(1);
  });
  test('rejects cookies with top domain different than host domain', () => {
    const cookies = [
      '0=0; Domain=.example.com', // allow
      '1=0; Domain=example.com; Path=/foo/bar', // allow,
      '2=0; Domain=another.com',
      '3=0; Domain=subdomain.example.com', // allow
    ].map((str) => parseCookie(exampleUrl, str));
    expect(cookies).toHaveLength(4);
    expect(cookies.filter((cookie) => validateCookie(exampleUrl, cookie))).toHaveLength(3);
  });
});
