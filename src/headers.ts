import type { CombinedOptions } from './types/CombinedOptions';

import { formatRequestData } from './format-request-data';

export function applyContentHeaders(options: CombinedOptions) {
  const [dataStream, contentLength, contentEncoding] = formatRequestData(options.dataType || 'string', options.data);
  options.dataStream = dataStream;
  if (contentLength > 0) {
    options.headers['content-length'] = contentLength;
  }
  if (contentEncoding !== '') {
    options.headers['content-encoding'] = contentEncoding;
  }
}
export function applyCompressionHeader(options: CombinedOptions) {
  if (!options.disableDecompression) {
    options.headers['accept-encoding'] = 'br, gzip, deflate';
  }
}

export function applyAcceptHeader(options: CombinedOptions) {
  if (options.responseType === 'binary') {
    options.headers['accept'] = 'application/octet-stream';
  } else if (options.responseType === 'json') {
    options.headers['accept'] = 'application/json';
  }
  if (typeof options.headers['accept'] !== 'string') {
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation/List_of_default_Accept_values
    options.headers['accept'] =
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9';
  }
}
