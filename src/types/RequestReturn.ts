import type { IncomingMessage } from 'node:http';
import type { Readable } from 'node:stream';

export type RequestReturn = [Readable, IncomingMessage];
