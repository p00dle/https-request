import type { IncomingMessage, OutgoingHttpHeaders } from 'http';
import type { CombinedOptions } from './types/CombinedOptions';
import type { HttpsRequestType, HttpsResponseType } from './types/DataType';
import type { HttpsRequestOptions } from './types/HttpsRequestOptions';
import type { HttpsResponseData } from './types/HttpsResponseData';
import type { Readable } from 'node:stream';

import { getHttpsResponse } from './get-https-response';
import { applyAcceptHeader, applyCompressionHeader, applyContentHeaders } from './headers';
import { applyReportStream, reportContentLength } from './reporter';
import { getDecompressedStream } from './get-decompressed-stream';
import { validateHttpStatus } from './validate-http-status';
import { collectStreamToBuffer, collectStreamToString } from './lib/stream';

export async function httpsRequest<
  T extends HttpsRequestType | undefined,
  R extends HttpsResponseType | undefined,
  J = unknown
>(options: HttpsRequestOptions<T, R, J>): Promise<[HttpsResponseData<R, J>, IncomingMessage]> {
  const combinedOptions: CombinedOptions = { headers: {} as OutgoingHttpHeaders, ...options };
  applyContentHeaders(combinedOptions);
  applyAcceptHeader(combinedOptions);
  applyCompressionHeader(combinedOptions);
  const response = await getHttpsResponse(options.url, combinedOptions);
  if (combinedOptions.responseType === 'raw') return [response as HttpsResponseData<R, J>, response];

  validateHttpStatus(combinedOptions, response);
  reportContentLength(combinedOptions, response);
  let dataStream: Readable = response;
  dataStream = applyReportStream(combinedOptions, response, dataStream);
  dataStream = getDecompressedStream(combinedOptions, response, dataStream);

  switch (combinedOptions.responseType) {
    case 'binary':
      return [(await collectStreamToBuffer(dataStream)) as HttpsResponseData<R, J>, response];
    case 'string':
      return [(await collectStreamToString(dataStream)) as HttpsResponseData<R, J>, response];
    case 'json': {
      const jsonString = await collectStreamToString(dataStream);
      const json = JSON.parse(jsonString);
      if (combinedOptions.validateJson && !combinedOptions.validateJson(json)) {
        throw new Error(`Received JSON does not conform to requirements`);
      }
      return json;
    }
    case undefined:
    case 'stream':
      return [dataStream as HttpsResponseData<R, J>, response];
    default:
      throw new Error(`Invalid response type ${combinedOptions.responseType}`);
  }
}
