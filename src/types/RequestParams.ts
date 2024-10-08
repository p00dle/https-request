import type { OutgoingHttpHeaders } from 'node:http';
import type { request as NodeRequest, RequestOptions as NodeRequestParams } from 'node:https';
import type { CookieJarType } from './CookieJarType';
import type { HttpMethod } from './HttpMethod';
import type { HttpStatusCodeValidation } from './HttpStatusCodeValidation';
import type { InferredRequestBodyType } from './InferredRequestBodyType';
import type { ReferrerPolicy } from './ReferrerPolicy';
import type { RequestBodyType } from './RequestBodyType';
import type { ResponseBodyType } from './ResponseBodyType';

export interface RequestParams<I extends RequestBodyType, O extends ResponseBodyType, P, V> {
  url: string | URL;
  method?: HttpMethod;
  maxRedirects?: number;
  cookieJar?: CookieJarType;
  headers?: OutgoingHttpHeaders;
  baseUrl?: string | URL;
  validateResponseStatus?: HttpStatusCodeValidation;
  referrerPolicy?: ReferrerPolicy;
  bodyType?: I;
  body?: InferredRequestBodyType<I>;
  responseBodyType?: O;
  parseJson?: (str: string) => P;
  validateJson?: (val: unknown) => val is V;
  _nodeRequest?: typeof NodeRequest;
  nodeOptions?: NodeRequestParams;
  onResponseBodyLength?: (size: number) => unknown;
  onResponseDataChunk?: (size: number) => unknown;
  onRequestBodyLength?: (size: number) => unknown;
  onRequestDataChunk?: (size: number) => unknown;
  abortSignal?: AbortSignal;
  disableDecompression?: boolean;
}
