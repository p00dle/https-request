import type { IncomingHttpHeaders, OutgoingHttpHeaders } from 'node:http';
import type { URL } from 'node:url';

export interface CookieJarType {
  applyRequestCookieHeader(url: URL, host: string, requestHeaders: OutgoingHttpHeaders): void;
  collectCookiesFromResponse(url: URL, responseHeaders: IncomingHttpHeaders): void;
}
