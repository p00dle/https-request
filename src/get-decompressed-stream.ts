import type { IncomingMessage } from 'node:http';
import type { Readable } from 'node:stream';

import { createGunzip, createBrotliDecompress, createInflate } from 'node:zlib';
import { CombinedOptions } from './types/CombinedOptions';

function getContentEncoding(response: IncomingMessage): null | 'gzip' | 'br' | 'deflate' {
  const acceptedValues = ['gzip', 'br', 'deflate'];
  const headerValue = response.headers['content-encoding'] ?? null;
  if (headerValue === null) return null;
  if (acceptedValues.includes(headerValue)) return headerValue as 'gzip' | 'br' | 'deflate';
  else throw Error('Content-Encoding not recognised: ' + headerValue);
}

export function getDecompressedStream(
  options: CombinedOptions,
  response: IncomingMessage,
  dataStream: Readable
): Readable {
  if (options.disableDecompression) return response;
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
    case 'gzip': {
      const decompress = createGunzip();
      dataStream.pipe(decompress);
      return decompress;
    }
  }
}
