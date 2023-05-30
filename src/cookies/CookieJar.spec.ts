import { describe, test, expect } from 'vitest';
import { URL } from 'node:url';
import { CookieJar } from './CookieJar';
import { makeCookie } from './make-cookie';

describe('CookieJar', () => {
  const exampleUrl = new URL('https:/example.com');
  test('addCookie overwrites with same key, domain, and path else adds', () => {
    const jar = new CookieJar([]);
    jar.addCookie(makeCookie({ key: 'a', value: 'b', domain: 'abc.com' }));
    expect(jar.toJSON()).toHaveLength(1);
    jar.addCookie(makeCookie({ key: 'a', value: 'c', domain: 'abc.com' }));
    expect(jar.toJSON()[0].value).toBe('c');
    jar.addCookie(makeCookie({ key: 'a', value: 'e', domain: 'abc.com', path: '/foo' }));
    expect(jar.toJSON()).toHaveLength(2);
    jar.addCookie(makeCookie({ key: 'a', value: 'g', domain: 'abc.com', path: '/foo' }));
    expect(jar.toJSON()).toHaveLength(2);
    jar.addCookie(makeCookie({ key: 'a', value: 'g', domain: 'bob.com', path: '/foo' }));
    expect(jar.toJSON()).toHaveLength(3);
    jar.addCookie(makeCookie({ key: 'a', value: 'g', domain: 'bob.com' }));
    expect(jar.toJSON()).toHaveLength(4);
  });
  test('removeCookie removes cookie that matches key, domain or path', () => {
    const jar = new CookieJar();
    jar.addCookie(makeCookie({ key: 'a', value: 'b', domain: 'abc.com' }));
    jar.addCookie(makeCookie({ key: 'a', value: 'e', domain: 'abc.com', path: '/foo' }));
    jar.addCookie(makeCookie({ key: 'a', value: 'g', domain: 'bob.com', path: '/foo' }));
    jar.addCookie(makeCookie({ key: 'a', value: 'h', domain: 'bob.com' }));
    jar.removeCookies({ path: '/foo' });
    expect(jar.toJSON()).toHaveLength(2);
    jar.removeCookies({ domain: 'bob.com' });
    expect(jar.toJSON()).toHaveLength(1);
    jar.removeCookies({ key: 'a' });
    expect(jar.toJSON()).toHaveLength(0);
  });
  test('getCookie gets the first cookie that matches key, or optionally domain and path', () => {
    const jar = new CookieJar();
    jar.addCookie(makeCookie({ key: 'a', value: 'b', domain: 'abc.com' }));
    jar.addCookie(makeCookie({ key: 'a', value: 'e', domain: 'abc.com', path: '/foo' }));
    jar.addCookie(makeCookie({ key: 'a', value: 'g', domain: 'bob.com', path: '/foo' }));
    jar.addCookie(makeCookie({ key: 'a', value: 'h', domain: 'bob.com' }));
    expect((jar.getCookie('a') || { value: '' }).value).toBe('b');
    expect((jar.getCookie('a', undefined, '/foo') || { value: '' }).value).toBe('e');
    expect((jar.getCookie('a', 'bob.com', '/foo') || { value: '' }).value).toBe('g');
    expect(jar.getCookie('b')).toBe(null);
  });
  test('cookies are removed when they are past their expiry time when getRequestCookies is called', () => {
    const jar = new CookieJar();
    jar.addCookie(makeCookie({ key: 'a', value: '', domain: 'example.com', expires: Date.now() + 10_000 }));
    jar.applyRequestCookieHeader(exampleUrl, exampleUrl.hostname, {});
    expect(jar.toJSON()).toHaveLength(1);
    jar.addCookie(makeCookie({ key: 'a', value: '', domain: 'example.com', expires: Date.now() - 10_000 }));
    expect(jar.toJSON()).toHaveLength(1);
    jar.getRequestCookies(exampleUrl, exampleUrl.hostname);
    expect(jar.toJSON()).toHaveLength(0);
  });
});
