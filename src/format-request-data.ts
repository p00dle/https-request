import type { Readable } from 'node:stream';
import type { HttpsRequestType } from './types/DataType';
import type { FormParams } from './types/FormParams';

import { URLSearchParams } from 'node:url';
import { createReadableStream } from './lib/stream';

function jsonFormatter(json: any): [Readable, number, string] {
  const data = JSON.stringify(json);
  return [createReadableStream(data), Buffer.byteLength(data), 'application/json'];
}

function formFormatter(formParams: FormParams): [Readable, number, string] {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(formParams)) {
    if (Array.isArray(value)) {
      value.forEach((val) => searchParams.append(key, val));
    } else {
      searchParams.append(key, '' + value);
    }
  }
  const data = searchParams.toString();
  return [createReadableStream(data), Buffer.byteLength(data), 'application/x-www-form-urlencoded'];
}

function stringFormatter(str: string | undefined): [Readable, number, string] {
  const val = typeof str === 'string' ? str : '';
  return [createReadableStream(val), Buffer.byteLength(val), ''];
}

function binaryFormatter(binary: Uint8Array | Buffer): [Readable, number, string] {
  if (!Buffer.isBuffer(binary) || !(binary instanceof Uint8Array)) {
    throw new Error(`Expected either Buffer or Uint8Array`);
  }
  return [createReadableStream(binary), Buffer.byteLength(binary), 'application/octet-stream'];
}

export function formatRequestData(type: HttpsRequestType, data: any): [Readable, number, string] {
  switch (type) {
    case 'binary':
      return binaryFormatter(data);
    case 'form':
      return formFormatter(data);
    case 'json':
      return jsonFormatter(data);
    case 'stream':
      return [data, -1, ''];
    case 'string':
      return stringFormatter(data);
    default:
      throw new Error(`Invalid type: ${type}`);
  }
}
