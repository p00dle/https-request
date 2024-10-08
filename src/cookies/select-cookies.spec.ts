import { URL } from 'node:url';
import { describe, expect, test } from 'vitest';
import { parseCookie } from './parse-cookie';
import { selectCookieFactory } from './select-cookies';

describe('selectCookieFactory', () => {
  const exampleUrl = new URL('https:/example.com');
  const httpExampleUrl = new URL('http:/example.com');
  const anotherUrl = new URL('https://another.com');
  const httpAnotherUrl = new URL('http://another.com');
  // const exampleUrlWithPath = new URL('https://example.com/foo/bar')
  const cookies = [
    '0=0',
    '1=1; SameSite=None; Secure',
    '2=2; SameSite=Strict',
    '3=3; Domain=example.com',
    '4=4; Domain=example.com; Secure',
    '5=5; Domain=sub.example.com',
    '6=6; Path=/foo/bar',
  ]
    .map((str) => parseCookie(exampleUrl, str))
    .concat(['7=7'].map((str) => parseCookie(httpExampleUrl, str)))
    .concat(['8=8'].map((str) => parseCookie(anotherUrl, str)));

  test('cookies with Secure attribute are not sent when protocol is http', () => {
    const httpCookies = cookies.filter(selectCookieFactory(httpExampleUrl, httpExampleUrl.hostname));
    const httpsCookies = cookies.filter(selectCookieFactory(exampleUrl, exampleUrl.hostname));
    expect(httpCookies.find((c) => c.key === '0')).toBeTruthy(); // sent because Secure is not specified
    expect(httpCookies.find((c) => c.key === '1')).toBeFalsy(); // not sent because Secure is specified
    expect(httpsCookies.find((c) => c.key === '1')).toBeTruthy(); // but sent when protocol is httpsCookies
    expect(httpCookies.find((c) => c.key === '4')).toBeFalsy(); // setting domain doesn't change the outcome
    expect(httpsCookies.find((c) => c.key === '4')).toBeTruthy();
    expect(httpsCookies.find((c) => c.key === '5')).toBeFalsy(); // unless the domain doesn't match
  });
  test('cookies with SameSite=None will be sent to other domains providing they are on https', () => {
    const httpCookies = cookies.filter(selectCookieFactory(httpAnotherUrl, exampleUrl.hostname));
    const httpsCookies = cookies.filter(selectCookieFactory(anotherUrl, exampleUrl.hostname));
    expect(httpCookies).toMatchObject([
      { key: '8', value: '8' }, // sent because Secure is not specified
    ]);
    expect(httpsCookies).toMatchObject([
      { key: '1', value: '1' }, // sent because of SameSite=None
      { key: '8', value: '8' }, // sent because it comes from anotherUrl
    ]);
  });
  test('cookies with SameSite=Lax (default) will be sent when url domain matches when sent from another host', () => {
    const httpsCookies = cookies.filter(selectCookieFactory(exampleUrl, anotherUrl.hostname));
    expect(httpsCookies.find((c) => c.key === '0')).toBeTruthy(); // sent because SameSite=Lax
    expect(httpsCookies.find((c) => c.key === '2')).toBeFalsy(); // not sent because SameSite=Strict
    expect(httpsCookies.find((c) => c.key === '8')).toBeFalsy(); // not sent because SameSite=Lax
  });
});
