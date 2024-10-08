import type { IncomingMessage, OutgoingHttpHeaders } from 'node:http';

import type { Readable } from 'node:stream';
import { asyncNodeRequest } from './asyncNodeRequest';
import { errors } from './errors';
import { normalizeUrl } from './lib/normalizeUrl';
import { getRedirectLocation, isRedirect, makeRedirectUrl } from './redirect';
import { applyReferrerHeader, getReferrerPolicyFromResponse } from './referrer';
import { transformOptions } from './transformOptions';
import type { RequestBodyType } from './types/RequestBodyType';
import type { RequestParams } from './types/RequestParams';
import type { ResponseBodyType } from './types/ResponseBodyType';

export async function dispatchRequest(
  url: string | URL,
  options: RequestParams<RequestBodyType, ResponseBodyType, unknown, unknown>,
  requestDataStream: Readable,
  requestHeaders: OutgoingHttpHeaders,
): Promise<IncomingMessage> {
  const { maxRedirects, referrerPolicy, nodeOptions, cookieJar } = transformOptions(options, requestHeaders);
  let urlObj = normalizeUrl(url);
  let previousUrlObj = options.baseUrl ? normalizeUrl(options.baseUrl) : null;
  let redirectCount = 0;
  applyReferrerHeader(referrerPolicy, previousUrlObj, urlObj, requestHeaders);
  while (true) {
    cookieJar.applyRequestCookieHeader(urlObj, previousUrlObj ? previousUrlObj.host : urlObj.host, nodeOptions.headers);
    const response = await asyncNodeRequest(urlObj, nodeOptions, requestDataStream, options._nodeRequest);
    cookieJar.collectCookiesFromResponse(urlObj, response.headers);
    if (isRedirect(response.statusCode)) {
      if (redirectCount > maxRedirects) {
        throw new errors.ResponseRedirectCountExceeded(`Redirect count exceeded maxRedirects ${maxRedirects}`);
      }
      redirectCount++;
      previousUrlObj = urlObj;
      urlObj = makeRedirectUrl(urlObj, getRedirectLocation(response));
      applyReferrerHeader(getReferrerPolicyFromResponse(response), previousUrlObj, urlObj, nodeOptions.headers);
    } else {
      return response;
    }
  }
}
