import type { RequestOptions as NodeRequestParams, OutgoingHttpHeaders } from 'node:http';
import type { CookieJarType } from './types/CookieJarType';
import type { RequestBodyType } from './types/RequestBodyType';

import { CookieJar } from './cookies/CookieJar';
import type { ReferrerPolicy } from './types/ReferrerPolicy';
import type { RequestParams } from './types/RequestParams';
import type { ResponseBodyType } from './types/ResponseBodyType';

export function transformOptions(
  options: RequestParams<RequestBodyType, ResponseBodyType, unknown, unknown>,
  requestHeaders: OutgoingHttpHeaders,
): {
  maxRedirects: number;
  referrerPolicy: ReferrerPolicy;
  cookieJar: CookieJarType;
  nodeOptions: NodeRequestParams & { headers: OutgoingHttpHeaders };
} {
  return {
    maxRedirects: options.maxRedirects ?? 3,
    referrerPolicy: options.referrerPolicy ?? 'strict-origin-when-cross-origin',
    cookieJar: options.cookieJar ?? new CookieJar(),
    nodeOptions: transformNodeOptions(options, requestHeaders),
  };
}

function transformNodeOptions(
  options: RequestParams<RequestBodyType, ResponseBodyType, unknown, unknown>,
  headers: OutgoingHttpHeaders,
): NodeRequestParams & { headers: OutgoingHttpHeaders } {
  const output = {
    signal: options.abortSignal,
    headers,
    method: options.method || 'GET',
  };
  if (options.nodeOptions) return { ...output, ...options.nodeOptions };
  return output;
}
