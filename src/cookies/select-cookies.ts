import type { Cookie } from '../types/Cookie';
import { matchDomain } from './match-domain';

export function selectCookieFactory(url: URL, hostDomain: string): (cookie: Cookie) => boolean {
  const isSecure = url.protocol === 'https:';
  return (cookie: Cookie): boolean => {
    const urlDomainMatch = cookie.allowSubDomains ? matchDomain(url.hostname, cookie.domain) : cookie.domain === url.hostname;
    const domainMatch = cookie.allowSubDomains ? matchDomain(hostDomain, cookie.domain) : cookie.domain === hostDomain;
    const pathMatch = url.pathname.startsWith(cookie.path);
    if (!pathMatch) return false;
    if (cookie.secure && !isSecure) return false;
    if (cookie.sameSite === 'None') return urlDomainMatch || domainMatch;
    if (cookie.sameSite === 'Strict') return domainMatch && urlDomainMatch && pathMatch;
    return urlDomainMatch && pathMatch;
  };
}
