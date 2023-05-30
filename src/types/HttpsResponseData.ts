import type { IncomingMessage } from 'node:http';
import type { Readable } from 'node:stream';
import type { HttpsResponseType } from './DataType';

export type HttpsResponseData<T extends HttpsResponseType | undefined, J> = T extends 'json'
  ? J
  : T extends 'binary'
  ? Buffer
  : T extends 'raw'
  ? IncomingMessage
  : T extends 'string'
  ? string
  : T extends 'stream'
  ? Readable
  : IncomingMessage;
