import type { IncomingMessage } from 'node:http';
import type { RequestOptions } from 'node:https';
import type { URL } from 'node:url';
import type { Readable } from 'node:stream';

import { request as httpsRequest } from 'node:https';
import { pipeline } from 'node:stream';

export function nodeHttpsRequestWrapper(url: URL, options: RequestOptions, dataStream: Readable) {
  return new Promise<IncomingMessage>((resolve, reject) => {
    const request = httpsRequest(url, options, resolveWrapper);
    let settled = false;
    function resolveWrapper(response: IncomingMessage) {
      if (settled) return;
      settled = true;
      resolve(response);
    }
    function rejectWrapper(error: unknown) {
      if (settled) return;
      settled = true;
      if (!request.destroyed) {
        request.destroy();
      }
      reject(error);
    }
    request.on('error', rejectWrapper);
    request.on('timeout', () => rejectWrapper('Socket timed out'));
    pipeline(dataStream, request, (err) => (err ? rejectWrapper(err) : null));
  });
}
