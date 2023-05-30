import type { RequestOptions } from 'node:https';
import type { Readable } from 'node:stream';
import type { URL } from 'node:url';
import type { CookieJarType } from './CookieJarType';
import type { HttpMethod } from './HttpMethod';
import type { NodeHttpsRequestWrapper } from './NodeHttpsRequestWrapper';
import type { ReferrerPolicy } from './ReferrerPolicy';

export type GetHttpsResponseOptions = RequestOptions & {
  method?: HttpMethod;
  maxRedirects?: number;
  dataStream?: Readable;
  cookieJar?: CookieJarType;
  previousUrl?: string | URL;
  referrerPolicy?: ReferrerPolicy;
  _request?: NodeHttpsRequestWrapper;
};
