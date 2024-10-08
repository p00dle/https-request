import type { IncomingMessage } from 'node:http';
import type { RequestOptions } from 'node:https';
import type { Readable } from 'node:stream';

export type NodeHttpsRequestWrapper = (url: URL, options: RequestOptions, dataStream: Readable) => Promise<IncomingMessage>;
