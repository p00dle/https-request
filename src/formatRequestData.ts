import type { Readable } from 'node:stream';
import type { FormParams } from './types/FormParams';
import type { RequestBodyType } from './types/RequestBodyType';

import { URLSearchParams } from 'node:url';
import { createReadableStream, isReadableStream } from 'std-util';
import { errors } from './errors';
import { normalizeUrl } from './lib/normalizeUrl';
import type { HttpMethod } from './types/HttpMethod';

interface RequestMetadata {
  url: URL;
  requestDataStream: Readable;
  contentType: string;
  contentLength: number;
}

export function formatRequestData(rawUrl: string | URL, method: HttpMethod = 'get', type?: RequestBodyType, data?: unknown): RequestMetadata {
  const url = normalizeUrl(rawUrl);
  if (typeof data === 'undefined') {
    return { url, requestDataStream: createReadableStream(''), contentType: '', contentLength: -1 };
  }
  const isGet = /get/i.test(method);
  if (isGet && type !== 'form' && type !== undefined) {
    throw new errors.RequestInvalidArgument('HTTP request with GET method supports only form data');
  }
  switch (type) {
    case 'binary':
      return binaryFormatter(url, data);
    case 'form':
      return formFormatter(url, data, isGet);
    case 'json':
      return jsonFormatter(url, data);
    case 'stream':
      if (!isReadableStream(data)) throw new errors.RequestInvalidArgument('Expected request body to be of type stream');
      return {
        url,
        requestDataStream: data,
        contentLength: -1,
        contentType: '',
      };
    case 'string':
      return stringFormatter(url, data);
    default:
      throw new errors.RequestInvalidArgument(`Invalid request body type: ${type}`);
  }
}

function jsonFormatter(url: URL, json: unknown): RequestMetadata {
  const data = JSON.stringify(json);
  return {
    url,
    requestDataStream: createReadableStream(data),
    contentLength: Buffer.byteLength(data),
    contentType: 'application/json',
  };
}

/*
  if (/get/i.test(method)) {
    if (type !== 'form' || type !== undefined) throw new errors.RequestInvalidArgument('HTTP request with GET method supports only form data');
    if (!isFormParams(formParams)) throw new errors.RequestInvalidArgument('Expected request body to satisfy FormParams interface');
  }
*/
function formFormatter(url: URL, formParams: unknown, isGet: boolean): RequestMetadata {
  if (!isFormParams(formParams)) throw new errors.RequestInvalidArgument('Expected request body to satisfy FormParams interface');

  const searchParams = isGet ? url.searchParams : new URLSearchParams();
  for (const [key, value] of Object.entries(formParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, item);
      }
    } else {
      searchParams.append(key, stringifyScalarValue(value));
    }
  }
  if (isGet) {
    return {
      url,
      requestDataStream: createReadableStream(''),
      contentLength: -1,
      contentType: '',
    };
  }
  const data = searchParams.toString();
  return {
    url,
    requestDataStream: createReadableStream(data),
    contentLength: Buffer.byteLength(data),
    contentType: 'application/x-www-form-urlencoded',
  };
}

function stringFormatter(url: URL, str: unknown): RequestMetadata {
  if (typeof str !== 'string') throw new errors.RequestInvalidArgument('Expected request body to be of type string');
  return {
    url,
    requestDataStream: createReadableStream(str),
    contentLength: Buffer.byteLength(str),
    contentType: '',
  };
}

function binaryFormatter(url: URL, binary: unknown): RequestMetadata {
  if (!Buffer.isBuffer(binary) || !(binary instanceof Uint8Array)) {
    throw new errors.RequestInvalidArgument('Expected request body to be either Buffer or Uint8Array');
  }
  return {
    url,
    requestDataStream: createReadableStream(binary),
    contentLength: Buffer.byteLength(binary),
    contentType: 'application/octet-stream',
  };
}

function isFormParams(value: unknown): value is FormParams {
  if (typeof value !== 'object' || value === null) return false;
  return Object.values(value).every((value) => {
    switch (typeof value) {
      case 'bigint':
      case 'boolean':
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'object':
        if (value === null) return true;
        return Array.isArray(value) && value.every((item) => typeof item === 'string');
      default:
        return false;
    }
  });
}

function stringifyScalarValue(value: string | number | boolean | null | undefined) {
  return value === null && typeof value === 'undefined' ? '' : `${value}`;
}
