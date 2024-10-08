import type { OutgoingHttpHeaders } from 'node:http';
import { errors } from '../errors';

export function applyHeader(headers: OutgoingHttpHeaders, key: string, value: unknown, force: boolean) {
  if (force || !headers[key]) headers[key] = formatHeaderValue(value);
}

function formatHeaderValue(value: unknown): string {
  const valueType = typeof value;
  switch (valueType) {
    case 'string':
      return value as string;
    case 'undefined':
      return '';
    case 'bigint':
    case 'boolean':
    case 'number':
      return `${value}`;
    default:
      throw new errors.RequestInvalidHeader(`Expected header value to be stringifiable but got: ${valueType}`);
  }
}
