import type { Readable } from 'node:stream';
import type { HttpsRequestType } from './DataType';

export type HttpsRequestData<T extends HttpsRequestType | undefined> = T extends undefined
  ? never
  : T extends 'binary'
  ? Buffer | Uint8Array
  : T extends 'form'
  ? FormData
  : T extends 'json'
  ? any
  : T extends 'string'
  ? string
  : T extends 'stream'
  ? Readable
  : never;
