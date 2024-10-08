import type { Readable } from 'node:stream';
import type { FormParams } from './FormParams';
import type { RequestBodyType } from './RequestBodyType';

export type InferredRequestBodyType<T extends RequestBodyType | undefined> = T extends undefined
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
