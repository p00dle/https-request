import type { OutgoingHttpHeaders } from 'node:http';
import { applyHeader } from './lib/applyHeader';
import type { ResponseBodyType } from './types/ResponseBodyType';
import type { UserAgent } from './types/UserAgent';

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation/List_of_default_Accept_values
const DEFAULT_ACCEPT_HEADER =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9';

const CHROME_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const FIREFOX_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0';

export function applyRequestHeaders(
  contentLength: number,
  contentType: string,
  disableDecompression?: boolean,
  responseBodyType?: ResponseBodyType,
  userAgent?: UserAgent,
  headers: OutgoingHttpHeaders = {},
): OutgoingHttpHeaders {
  if (contentLength >= 0) {
    applyHeader(headers, 'content-length', contentLength, false);
  }
  if (contentType !== '') {
    applyHeader(headers, 'content-type', contentType, false);
  }
  if (!disableDecompression) {
    applyHeader(headers, 'accept-encoding', 'br, gzip, compress, deflate', false);
  }
  if (responseBodyType === 'json') {
    applyHeader(headers, 'accept', 'application/json', false);
  } else if (responseBodyType === 'html') {
    applyHeader(headers, 'accept', 'text/html', false);
  } else {
    applyHeader(headers, 'accept', DEFAULT_ACCEPT_HEADER, false);
  }
  if (userAgent) {
    let userAgentValue = '';
    if (typeof userAgent === 'function') {
      userAgentValue = userAgent();
    } else {
      switch (userAgent) {
        case 'chrome':
          userAgentValue = CHROME_USER_AGENT;
          break;
        case 'firefox':
          userAgentValue = FIREFOX_USER_AGENT;
          break;
        default:
          userAgentValue = userAgent;
      }
    }
    applyHeader(headers, 'user-agent', userAgentValue, false);
  }
  return headers;
}
