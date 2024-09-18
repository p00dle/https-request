import type { OutgoingHttpHeaders } from 'node:http';
import type { HttpsRequestType, HttpsResponseType } from './DataType';
import type { GetHttpsResponseOptions } from './GetHttpsResponseOptions';
import type { HttpsRequestOptions } from './HttpsRequestOptions';

export type CombinedOptions = HttpsRequestOptions<HttpsRequestType, HttpsResponseType, unknown> &
  GetHttpsResponseOptions & { headers: OutgoingHttpHeaders };
