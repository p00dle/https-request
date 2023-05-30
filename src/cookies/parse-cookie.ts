import type { Cookie } from '../types/Cookie';
import type { URL } from 'node:url';
import { makeCookie } from './make-cookie';

function unquote(str: string, quote = '"'): string {
  return str[0] === quote && str[str.length - 1] === quote ? str.slice(1, str.length - 1) : str;
}

function splitAtFirst(char: string, str: string): [string, string] {
  const index = str.indexOf(char);
  return [str.slice(0, index), str.slice(index + char.length)];
}

export function parseCookie(hostUrl: URL, cookieStr: string): Cookie {
  const cookie = makeCookie({ isHttps: hostUrl.protocol === 'https:', domain: hostUrl.hostname });
  cookieStr
    .split(/;\s*/)
    .filter((str) => str.length > 0)
    .forEach((str) => {
      if (/^secure$/i.test(str)) {
        cookie.secure = true;
        return;
      } else if (/^httponly$/i.test(str)) {
        return;
      } else if (!/=/.test(str)) {
        cookie.isValid = false;
        return;
      }
      const [key, value] = splitAtFirst('=', str);
      switch (key.toLowerCase()) {
        case 'expires':
          if (!cookie.expires) cookie.expires = +new Date(value);
          break;
        case 'max-age':
          cookie.expires = Date.now() + parseInt(value) * 1000;
          break;
        case 'domain':
          cookie.allowSubDomains = true;
          cookie.domain = value[0] === '.' ? value.slice(1) : value;
          break;
        case 'path':
          cookie.path = value;
          break;
        case 'samesite':
          cookie.sameSite = value as 'Strict' | 'Lax' | 'None';
          break;
        default:
          cookie.key = unquote(key);
          cookie.value = unquote(value);
          break;
      }
    });
  return cookie;
}
