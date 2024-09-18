import { IncomingMessage } from 'node:http';
import type { URL } from 'node:url';
import type { ReferrerPolicy } from './types/ReferrerPolicy';

/*
Resources:
https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy

*/

const REFERRER_POLICIES: ReferrerPolicy[] = [
  'no-referrer',
  'no-referrer-when-downgrade',
  'origin',
  'origin-when-cross-origin',
  'same-origin',
  'strict-origin',
  'strict-origin-when-cross-origin',
  'unsafe-url',
];

function isProtocolDowngrade(url: URL, newUrl: URL): boolean {
  if (url.protocol === 'https:') {
    return newUrl.protocol !== 'https:';
  }
  if (url.protocol === 'http:') {
    return !newUrl.protocol.startsWith('http');
  }
  return url.protocol !== newUrl.protocol;
}

function isSameOrigin(url: URL, newUrl: URL): boolean {
  return url.origin === newUrl.origin;
}

function makeReferrer(url: URL, fullUrl: boolean): string {
  return fullUrl ? url.toString() : url.origin;
}

type Options = { headers?: Record<string, unknown> };
export function applyReferrerHeader(policy: ReferrerPolicy, url: URL, newUrl: URL, options: Options): void {
  const referrer = getReferrer(policy, url, newUrl);
  if (!referrer) return;
  if (!options.headers) options.headers = {};
  options.headers.referer = referrer;
}

export function getReferrer(policy: ReferrerPolicy, url: URL, newUrl: URL): string | null {
  const protocolDowngrade = isProtocolDowngrade(url, newUrl);
  const sameOrigin = isSameOrigin(url, newUrl);
  switch (policy) {
    case 'no-referrer':
      return null;

    case 'no-referrer-when-downgrade':
      return protocolDowngrade ? null : makeReferrer(url, true);

    case 'origin':
      return makeReferrer(url, false);

    case 'origin-when-cross-origin':
      return makeReferrer(url, sameOrigin);

    case 'same-origin':
      return sameOrigin ? makeReferrer(url, true) : null;

    case 'strict-origin':
      return protocolDowngrade ? null : makeReferrer(url, false);

    case 'strict-origin-when-cross-origin':
      return protocolDowngrade ? null : makeReferrer(url, sameOrigin);

    case 'unsafe-url':
      return makeReferrer(url, true);

    default:
      throw new Error(`Invalid referrer policy: ${policy}`);
  }
}

function isValidPolicyHeader(header: string): header is ReferrerPolicy {
  return REFERRER_POLICIES.includes(header as ReferrerPolicy);
}

export function getReferrerPolicyFromResponse(response: IncomingMessage): ReferrerPolicy {
  const policyHeader = response.headers['referrer-policy'];
  if (typeof policyHeader === 'string') {
    const lowerCasePolicyHeader = policyHeader.toLowerCase();
    if (isValidPolicyHeader(lowerCasePolicyHeader)) return lowerCasePolicyHeader;
  }
  return 'strict-origin-when-cross-origin';
}
