import type { IncomingMessage } from 'node:http';
import type { RequestOptions } from 'node:https';
import { request as defaultNodeRequest } from 'node:https';
import type { Readable } from 'node:stream';
import { pipeline } from 'node:stream';
import type { URL } from 'node:url';
import type { NodeRequest } from './types/NodeRequest';

export function asyncNodeRequest(url: URL, options: RequestOptions, requestDataStream: Readable, nodeRequest: NodeRequest = defaultNodeRequest) {
  return new Promise<IncomingMessage>((resolve, reject) => {
    const request = nodeRequest(url, options, resolveWrapper);
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
    pipeline(requestDataStream, request, (err) => (err ? rejectWrapper(err) : null));
  });
}
