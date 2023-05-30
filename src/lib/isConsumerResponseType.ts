import type { HttpsResponseType } from '../types/DataType';

export function isConsumeResponseType(responseType: HttpsResponseType | undefined): boolean {
  return responseType === 'binary' || responseType === 'json' || responseType === 'string';
}
