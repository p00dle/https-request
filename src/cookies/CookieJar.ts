import type { URL } from 'node:url';
import type { Cookie } from '../types/Cookie';

import { parseCookie } from './parse-cookie';
import { validateCookie } from './validate-cookie';
import { selectCookieFactory } from './select-cookies';
import { CookieJarType } from '../types/CookieJarType';

function stringifyCookie(cookie: Cookie): string {
  return cookie.key + '=' + (cookie.value ? cookie.value : '');
}

export class CookieJar implements CookieJarType {
  protected cookies: Cookie[];
  constructor(cookies?: Cookie[]) {
    this.cookies = Array.isArray(cookies) ? cookies : [];
  }

  public collectCookiesFromResponse(url: URL, response: { headers: { 'set-cookie'?: string[] } }) {
    (response.headers['set-cookie'] || [])
      .map((cookieStr) => parseCookie(url, cookieStr))
      .filter((cookie) => validateCookie(url, cookie))
      .forEach((cookie) => this.addCookie(cookie));
  }

  public applyRequestCookieHeader(url: URL, host: string, requestOptions: { headers?: { Cookie?: string } }): void {
    this.expireCookies();
    const cookies = this.cookies.filter(selectCookieFactory(url, host));
    const cookieString = cookies.map(stringifyCookie).join(';');
    if (!requestOptions.headers) requestOptions.headers = {};
    if (requestOptions.headers.Cookie) requestOptions.headers.Cookie += ';' + cookieString;
    else requestOptions.headers.Cookie = cookieString;
  }

  protected expireCookies() {
    const now = Date.now();
    this.cookies = this.cookies.filter((cookie) => (cookie.expires !== null ? cookie.expires > now : true));
  }

  public toJSON() {
    return this.cookies;
  }

  public addCookie(cookie: Cookie) {
    const existingCookieIndex = this.cookies.findIndex(
      (c) =>
        c.key === cookie.key && c.domain === cookie.domain && c.path === cookie.path && c.isHttps === cookie.isHttps
    );
    if (existingCookieIndex >= 0) {
      this.cookies[existingCookieIndex] = cookie;
    } else {
      this.cookies.push(cookie);
    }
  }

  public addCookies(cookies: Cookie[]) {
    cookies.forEach((cookie) => this.addCookie(cookie));
  }

  public removeCookies({ key, domain, path }: { key?: string; domain?: string; path?: string }) {
    this.cookies = this.cookies.filter(
      (cookie) =>
        !(
          (key ? cookie.key === key : true) &&
          (domain ? cookie.domain === domain : true) &&
          (path ? cookie.path === path : true)
        )
    );
  }

  public getCookie(key: string, domain?: string, path?: string): Cookie | null {
    const cookie = this.cookies.find(
      (cookie) =>
        cookie.key === key && (domain ? cookie.domain === domain : true) && (path ? cookie.path === path : true)
    );
    return cookie ? cookie : null;
  }
  public getRequestCookies(url: URL, host: string): string[] {
    this.expireCookies();
    const cookies = this.cookies.filter(selectCookieFactory(url, host));
    return cookies.map(stringifyCookie);
  }
}
