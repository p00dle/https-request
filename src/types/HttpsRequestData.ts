import type { Readable } from 'node:stream';
import type { HttpsRequestType } from './DataType';
import type { FormParams } from './FormParams';

export type HttpsRequestData<T extends HttpsRequestType | undefined> = T extends undefined
  ? never
  : T extends 'binary'
  ? Buffer | Uint8Array
  : T extends 'form'
  ? FormParams
  : T extends 'json'
  ? unknown
  : T extends 'string'
  ? string
  : T extends 'stream'
  ? Readable
  : never;
