import type { IncomingMessage } from 'node:http';
import type { RequestOptions } from 'node:https';
import type { URL } from 'node:url';

export interface CookieJarType {
  collectCookiesFromResponse(url: URL, response: IncomingMessage): void;
  applyRequestCookieHeader(url: URL, host: string, requestOptions: RequestOptions): void;
}
