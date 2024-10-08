import type { Readable } from 'node:stream';

import type { IncomingMessage } from 'node:http';
import { collectStreamToBuffer, collectStreamToString } from 'std-util';
import { errors } from './errors';
import type { InferredResponseBodyType } from './types/InferredResponseBodyType';
import type { ResponseBodyType } from './types/ResponseBodyType';

export function parseResponse<T extends ResponseBodyType, P = never, V = never>(
  responseStream: Readable,
  response: IncomingMessage,
  responseBodyType?: ResponseBodyType,
  jsonParser?: (str: string) => P,
  jsonValidator?: (val: unknown) => val is V,
): Promise<InferredResponseBodyType<T, P, V>> {
  switch (responseBodyType) {
    case 'binary':
      return collectStreamToBuffer(responseStream) as Promise<InferredResponseBodyType<T, P, V>>;
    case 'string':
      return collectStreamToString(responseStream) as Promise<InferredResponseBodyType<T, P, V>>;
    case 'json':
      return parseJson(responseStream, jsonParser, jsonValidator) as Promise<InferredResponseBodyType<T, P, V>>;
    case 'raw':
      return response as unknown as Promise<InferredResponseBodyType<T, P, V>>;
    default:
      return Promise.resolve(responseStream) as Promise<InferredResponseBodyType<T, P, V>>;
  }
}

async function parseJson(stream: Readable, parser: (str: string) => unknown = JSON.parse, validator: (val: unknown) => boolean = () => true) {
  const jsonString = await collectStreamToString(stream);
  let json: unknown;
  try {
    json = parser(jsonString);
  } catch (err) {
    throw new errors.ResponseInvalidJson(
      typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string' ? err.message : 'Invalid response JSON',
    );
  }
  if (!validator(json)) {
    throw new errors.ResponseInvalidJson('Response JSON does not conform to validation');
  }
  return json;
}

/*
  switch (options.responseBodyType) {
    case 'binary':
      return (await collectStreamToBuffer(responseDataStream)) as InferredResponseBodyType<O>;
    case 'string':
      return (await collectStreamToString(responseDataStream)) as HttpsResponseData<R, J>, response];
    case 'json': {
      const jsonString = await collectStreamToString(dataStream);
      const json = JSON.parse(jsonString);
      if (combinedOptions.validateJson && !combinedOptions.validateJson(json)) {
        throw new Error(`Received JSON does not conform to requirements`);
      }
      return json;
    }
    case undefined:
    case 'stream':
      return [dataStream as HttpsResponseData<R, J>, response];
    default:
      throw new Error(`Invalid response type ${combinedOptions.responseType}`);
  }

*/
