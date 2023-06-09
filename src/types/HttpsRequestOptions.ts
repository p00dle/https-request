import type { HttpsRequestType, HttpsResponseType } from './DataType';
import type { HttpsRequestData } from './HttpsRequestData';
import type { NodeHttpsRequestWrapper } from './NodeHttpsRequestWrapper';
import type { GetHttpsResponseOptions } from './GetHttpsResponseOptions';

export type HttpsRequestOptions<
  T extends HttpsRequestType | undefined,
  R extends HttpsResponseType | undefined,
  J = any
> = Omit<GetHttpsResponseOptions, 'dataStream'> & {
  url: string | URL;
  dataType?: T;
  data?: HttpsRequestData<T>;
  responseType?: R;
  validateJson?: (json: unknown) => json is J;
  validateHttpStatus?: number | ((statusCode?: number) => boolean);
  _request?: NodeHttpsRequestWrapper;
  onContentLength?: (size: number) => any;
  onDataChunk?: (size: number) => any;
  disableDecompression?: boolean;
};
