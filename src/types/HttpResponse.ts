import type { IncomingHttpHeaders } from 'node:http';

export type HttpResponse<T> = {
  headers: IncomingHttpHeaders;
  statusCode: number;
  data: T;
};
