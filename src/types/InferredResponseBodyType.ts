import type { IncomingMessage } from 'node:http';
import type { Readable } from 'node:stream';
import type { ResponseBodyType } from './ResponseBodyType';

export type InferredResponseBodyType<T extends ResponseBodyType | undefined, P, V> = T extends undefined
  ? never
  : T extends 'binary'
    ? Buffer | Uint8Array
    : T extends 'raw'
      ? IncomingMessage
      : T extends 'json'
        ? P extends never
          ? V extends never
            ? unknown
            : V
          : P
        : T extends 'string'
          ? string
          : T extends 'stream'
            ? Readable
            : never;
