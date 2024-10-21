import type { OutgoingHttpHeaders } from 'node:http';
import { applyHeader } from './lib/applyHeader';
import type { ResponseBodyType } from './types/ResponseBodyType';

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation/List_of_default_Accept_values
const DEFAULT_ACCEPT_HEADER =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9';

export function applyRequestHeaders(
  contentLength: number,
  contentType: string,
  disableDecompression?: boolean,
  responseBodyType?: ResponseBodyType,
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
  return headers;
}
