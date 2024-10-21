import type { Readable } from 'node:stream';

import type { IncomingMessage } from 'node:http';
import { collectStreamToBuffer, collectStreamToString } from 'std-util';
import { errors } from './errors';
import type { InferredParsedResponseBodyType, InferredResponseBodyType } from './types/InferredResponseBodyType';
import type { ResponseBodyType } from './types/ResponseBodyType';

export async function parseResponse<T extends ResponseBodyType, P = never, V extends P = never>(
  responseStream: Readable,
  response: IncomingMessage,
  responseBodyType?: ResponseBodyType,
  parser?: (val: InferredResponseBodyType<T>) => P,
  validator?: (val: P) => val is V,
): Promise<InferredParsedResponseBodyType<T, P, V>> {
  const body = await getBody(responseStream, response, responseBodyType);
  const parsed = parseBody(body, responseBodyType, parser as (val: unknown) => unknown);
  if (validator && !validator(parsed)) throw new errors.ResponseInvalidJson('Response does not conform to validation');
  return parsed;
}

async function getBody(responseStream: Readable, response: IncomingMessage, responseBodyType?: ResponseBodyType) {
  switch (responseBodyType) {
    case 'binary':
      return collectStreamToBuffer(responseStream);
    case 'json':
    case 'string':
    case 'html':
      return collectStreamToString(responseStream);
    case 'raw':
      return response;
    default:
      return Promise.resolve(responseStream);
  }
}

function parseBody(body: string | Readable | Buffer, responseBodyType?: ResponseBodyType, parser?: (val: unknown) => unknown) {
  if (parser) {
    return parser(body);
  }
  if (responseBodyType === 'json') {
    try {
      return JSON.parse(body as string);
    } catch (err) {
      throw new errors.ResponseInvalidJson(
        typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string' ? err.message : 'Invalid response JSON',
      );
    }
  }
  return body;
}
