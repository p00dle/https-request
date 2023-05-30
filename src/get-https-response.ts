import type { IncomingMessage } from 'node:http';
import type { GetHttpsResponseOptions } from './types/GetHttpsResponseOptions';

import { URL } from 'node:url';
import { nodeHttpsRequestWrapper } from './node-https-request-wrapper';
import { createReadableStream } from './lib/stream';
import { getRedirectLocation, isRedirect, makeRedirectUrl } from './redirect';
import { applyReferrerHeader, getReferrerPolicyFromResponse } from './referrer';
import { ReferrerPolicy } from './types/ReferrerPolicy';

export async function getHttpsResponse(url: string | URL, options: GetHttpsResponseOptions): Promise<IncomingMessage> {
  const maxRedirects = options.maxRedirects ?? 3;
  const dataStream = options.dataStream ?? createReadableStream('');
  const optionsCopy = { ...options };
  const httpsRequestWrapper = options._request ?? nodeHttpsRequestWrapper;
  let urlObj = typeof url === 'string' ? new URL(url) : url;
  let previousUrlObj =
    typeof options.previousUrl === 'string'
      ? new URL(options.previousUrl)
      : options.previousUrl instanceof URL
      ? options.previousUrl
      : urlObj;
  let redirectCount = 0;
  let referrerPolicy: ReferrerPolicy = options.referrerPolicy ?? 'strict-origin-when-cross-origin';
  while (true) {
    if (options.cookieJar) options.cookieJar.applyRequestCookieHeader(urlObj, previousUrlObj.host, options);
    const response = await httpsRequestWrapper(urlObj, optionsCopy, dataStream);
    if (options.cookieJar) options.cookieJar.collectCookiesFromResponse(urlObj, response);
    if (isRedirect(response.statusCode)) {
      if (redirectCount > maxRedirects) {
        throw new Error(`Redirect count exceeded maxRedirects ${maxRedirects}`);
      }
      redirectCount++;
      previousUrlObj = urlObj;
      urlObj = makeRedirectUrl(urlObj, getRedirectLocation(response));
      referrerPolicy = getReferrerPolicyFromResponse(response);
      applyReferrerHeader(referrerPolicy, previousUrlObj, urlObj, optionsCopy);
    } else {
      return response;
    }
  }
}
