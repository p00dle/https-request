import type { Readable } from 'node:stream';
import { applyReports } from './applyReports';
import { applyRequestHeaders } from './applyRequestHeaders';
import { dispatchRequest } from './dispatchRequest';
import { formatRequestData } from './formatRequestData';
import { getDecompressedStream } from './getDecompressedStream';
import { parseResponse } from './parseResponse';
import type { HttpResponse } from './types/HttpResponse';
import type { InferredParsedResponseBodyType, InferredResponseBodyType } from './types/InferredResponseBodyType';
import type { RequestBodyType } from './types/RequestBodyType';
import type { RequestParams } from './types/RequestParams';
import type { ResponseBodyType } from './types/ResponseBodyType';
import { validateResponseStatus } from './validateResponseStatus';

export async function request<I extends RequestBodyType, O extends ResponseBodyType, P, V extends P>(
  options: RequestParams<I, O, P, V>,
): Promise<InferredParsedResponseBodyType<O, P, V>> {
  const { url, requestDataStream, contentType, contentLength } = formatRequestData(options.url, options.method, options.bodyType, options.body);
  const wrappedRequestDataStream = applyReports(requestDataStream, contentLength, options.onRequestBodyLength, options.onRequestDataChunk);
  const headers = applyRequestHeaders(contentLength, contentType, options.disableDecompression, options.responseBodyType, options.headers);
  const response = await dispatchRequest(url, options as RequestParams<RequestBodyType, ResponseBodyType, unknown, unknown>, wrappedRequestDataStream, headers);
  validateResponseStatus(options.validateResponseStatus, response.statusCode);
  if (options.onResponseHeaders) options.onResponseHeaders(response.headers);
  let responseDataStream: Readable = response;
  responseDataStream = applyReports(responseDataStream, response.headers['content-length'], options.onResponseBodyLength, options.onResponseDataChunk);
  responseDataStream = getDecompressedStream(response, responseDataStream, options.disableDecompression);
  return await parseResponse(responseDataStream, response, options.responseBodyType, options.parseResponse, options.validateResponse);
}
