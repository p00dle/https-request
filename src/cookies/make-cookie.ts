import type { Cookie } from '../types/Cookie';

const cookieDefaults: Cookie = {
  key: '',
  value: '',
  domain: '',
  allowSubDomains: false,
  sameSite: 'Lax',
  isHttps: true,
  path: '/',
  expires: null,
  secure: false,
  isValid: true,
};
export function makeCookie(cookieParams?: Partial<Cookie>): Cookie {
  return cookieParams ? { ...cookieDefaults, ...cookieParams } : { ...cookieDefaults };
}
