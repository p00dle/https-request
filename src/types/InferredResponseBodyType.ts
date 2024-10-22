import type { IncomingMessage } from 'node:http';
import type { Readable } from 'node:stream';
import type { ResponseBodyType } from './ResponseBodyType';

export type InferredResponseBodyType<T extends ResponseBodyType | undefined> = T extends 'binary'
  ? Buffer | Uint8Array
  : T extends 'json' | 'string' | 'html'
    ? string
    : T extends 'raw'
      ? IncomingMessage
      : Readable;

export type InferredParsedResponseBodyType<T extends ResponseBodyType | undefined, P> = P extends undefined ? InferredResponseBodyType<T> : P;
