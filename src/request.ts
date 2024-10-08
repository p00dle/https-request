import type { Readable } from 'node:stream';
import { applyReports } from './applyReports';
import { applyRequestHeaders } from './applyRequestHeaders';
import { dispatchRequest } from './dispatchRequest';
import { formatRequestData } from './formatRequestData';
import { getDecompressedStream } from './getDecompressedStream';
import { parseResponse } from './parseResponse';
import type { HttpResponse } from './types/HttpResponse';
import type { InferredResponseBodyType } from './types/InferredResponseBodyType';
import type { RequestBodyType } from './types/RequestBodyType';
import type { RequestParams } from './types/RequestParams';
import type { ResponseBodyType } from './types/ResponseBodyType';
import { validateResponseStatus } from './validateResponseStatus';

export async function request<I extends RequestBodyType, O extends ResponseBodyType, P, V>(
  options: RequestParams<I, O, P, V>,
): Promise<HttpResponse<InferredResponseBodyType<O, P, V>>> {
  const { url, requestDataStream, contentType, contentLength } = formatRequestData(options.url, options.method, options.bodyType, options.body);
  const wrappedRequestDataStream = applyReports(requestDataStream, contentLength, options.onRequestBodyLength, options.onRequestDataChunk);
  const headers = applyRequestHeaders(contentLength, contentType, options.disableDecompression, options.headers);
  const response = await dispatchRequest(url, options, wrappedRequestDataStream, headers);
  validateResponseStatus(options.validateResponseStatus, response.statusCode);
  let responseDataStream: Readable = response;
  responseDataStream = applyReports(responseDataStream, response.headers['content-length'], options.onResponseBodyLength, options.onResponseDataChunk);
  responseDataStream = getDecompressedStream(response, responseDataStream, options.disableDecompression);
  return {
    headers: response.headers,
    statusCode: response.statusCode || 0,
    data: await parseResponse(responseDataStream, response, options.responseBodyType, options.parseJson, options.validateJson),
  };
}
