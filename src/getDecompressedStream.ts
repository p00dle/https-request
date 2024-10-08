import type { IncomingMessage } from 'node:http';
import type { Readable } from 'node:stream';

import { createBrotliDecompress, createGunzip, createInflate } from 'node:zlib';
import { errors } from './errors';

function getContentEncoding(response: IncomingMessage): null | 'gzip' | 'br' | 'deflate' | 'compress' {
  const acceptedValues = ['gzip', 'br', 'deflate', 'compress'];
  const headerValue = response.headers['content-encoding'] ?? null;
  if (headerValue === null) return null;
  if (acceptedValues.includes(headerValue)) return headerValue as 'gzip' | 'br' | 'deflate' | 'compress';
  throw new errors.ResponseInvalidCompression(`Content-Encoding not recognised: ${headerValue}`);
}

export function getDecompressedStream(response: IncomingMessage, dataStream: Readable, disableDecompression?: boolean): Readable {
  const contentEncoding = getContentEncoding(response);
  if (disableDecompression) {
    if (contentEncoding === null) return response;
    throw new errors.ResponseInvalidCompression(`Request was for uncompressed data, however response content encoding is: ${contentEncoding}`);
  }
  switch (getContentEncoding(response)) {
    case null:
      return response;
    case 'br': {
      const decompress = createBrotliDecompress();
      dataStream.pipe(decompress);
      return decompress;
    }
    case 'deflate': {
      const decompress = createInflate();
      dataStream.pipe(decompress);
      return decompress;
    }
    case 'compress':
    case 'gzip': {
      const decompress = createGunzip();
      dataStream.pipe(decompress);
      return decompress;
    }
  }
}
